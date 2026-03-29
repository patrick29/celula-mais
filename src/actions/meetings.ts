"use server";

import { db } from "@/lib/db";
import { meetings, cellGroups, users, persons, meetingAttendance, cellMembers, churchLifeEvents } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, ilike, desc, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { revalidatePath } from "next/cache";
import { getAuthUserContext } from "@/lib/auth-context";


export type GetMeetingsParams = {
  search?: string;
  cellGroupId?: string;
};

export async function getMeetings(params?: GetMeetingsParams) {
  try {
    const { dbUser } = await getAuthUserContext();

    const conditions = [eq(cellGroups.churchId, dbUser.churchId)];

    if (params?.cellGroupId) {
      conditions.push(eq(meetings.cellGroupId, params.cellGroupId));
    }

    if (params?.search) {
      conditions.push(ilike(meetings.topic, `%${params.search}%`));
    }

    const p1 = alias(persons, "p1");
    const p2 = alias(persons, "p2");
    const p3 = alias(persons, "p3");

    const meetingsList = await db
      .select({
        id: meetings.id,
        meetingDate: meetings.meetingDate,
        topic: meetings.topic,
        initialPrayer: meetings.initialPrayer,
        initialPrayerName: p1.fullName,
        finalPrayer: meetings.finalPrayer,
        finalPrayerName: p2.fullName,
        responsibleForReflection: meetings.responsibleForReflection,
        reflectionName: p3.fullName,
        notes: meetings.notes,
        photoUrl: meetings.photoUrl,
        memberCount: meetings.memberCount,
        visitorCount: meetings.visitorCount,
        childrenCount: meetings.childrenCount,
        totalCount: meetings.totalCount,
        cellGroupId: meetings.cellGroupId,
        cellGroupName: cellGroups.name,
        createdAt: meetings.createdAt,
      })
      .from(meetings)
      .innerJoin(cellGroups, eq(meetings.cellGroupId, cellGroups.id))
      .leftJoin(p1, eq(meetings.initialPrayer, p1.id))
      .leftJoin(p2, eq(meetings.finalPrayer, p2.id))
      .leftJoin(p3, eq(meetings.responsibleForReflection, p3.id))
      .where(and(...conditions))
      .orderBy(desc(meetings.meetingDate));

    return { data: meetingsList, error: null };
  } catch (error: any) {
    console.error("Error fetching meetings:", error);
    return { data: null, error: error.message };
  }
}

export async function getMeetingById(id: string) {
  try {
    const { dbUser } = await getAuthUserContext();

    const p1 = alias(persons, "p1");
    const p2 = alias(persons, "p2");
    const p3 = alias(persons, "p3");

    const [meetingResult, attendancesResult] = await Promise.all([
      db.select({
        id: meetings.id,
        meetingDate: meetings.meetingDate,
        topic: meetings.topic,
        initialPrayer: meetings.initialPrayer,
        initialPrayerName: p1.fullName,
        finalPrayer: meetings.finalPrayer,
        finalPrayerName: p2.fullName,
        responsibleForReflection: meetings.responsibleForReflection,
        reflectionName: p3.fullName,
        notes: meetings.notes,
        photoUrl: meetings.photoUrl,
        memberCount: meetings.memberCount,
        visitorCount: meetings.visitorCount,
        childrenCount: meetings.childrenCount,
        totalCount: meetings.totalCount,
        cellGroupId: meetings.cellGroupId,
        createdAt: meetings.createdAt,
        updatedAt: meetings.updatedAt,
      })
      .from(meetings)
      .innerJoin(cellGroups, eq(meetings.cellGroupId, cellGroups.id))
      .leftJoin(p1, eq(meetings.initialPrayer, p1.id))
      .leftJoin(p2, eq(meetings.finalPrayer, p2.id))
      .leftJoin(p3, eq(meetings.responsibleForReflection, p3.id))
      .where(
        and(eq(meetings.id, id), eq(cellGroups.churchId, dbUser.churchId))
      )
      .limit(1),
      db.select({
        personId: meetingAttendance.personId,
        status: meetingAttendance.status,
        fullName: persons.fullName,
      })
      .from(meetingAttendance)
      .innerJoin(persons, eq(meetingAttendance.personId, persons.id))
      .where(eq(meetingAttendance.meetingId, id))
    ]);

    const [meeting] = meetingResult;

    if (!meeting) {
      return { data: null, error: "Reunião não encontrada" };
    }

    return { data: { ...meeting, attendances: attendancesResult }, error: null };
  } catch (error: any) {
    console.error("Error fetching meeting by id:", error);
    return { data: null, error: error.message };
  }
}

export async function getCellGroupsForSelect() {
  try {
    const { dbUser } = await getAuthUserContext();

    const cellGroupsData = await db
      .select({ id: cellGroups.id, name: cellGroups.name })
      .from(cellGroups)
      .where(eq(cellGroups.churchId, dbUser.churchId))
      .orderBy(cellGroups.name);

    return { data: cellGroupsData, error: null };
  } catch (error: any) {
    console.error("Error fetching cell groups for select:", error);
    return { data: null, error: error.message };
  }
}

export async function getCellGroupMembers(cellGroupId: string) {
  try {
    const { dbUser } = await getAuthUserContext();

    // 1 & 2. Get cell group, its leadership, and explicit members in parallel
    const [cellGroupResult, members] = await Promise.all([
      db.select({
        leaderId: cellGroups.leaderId,
        coLeaderId: cellGroups.coLeaderId,
        hostId: cellGroups.hostId,
      })
      .from(cellGroups)
      .where(and(eq(cellGroups.id, cellGroupId), eq(cellGroups.churchId, dbUser.churchId)))
      .limit(1),
      db.select({
        id: persons.id,
        fullName: persons.fullName,
      })
      .from(cellMembers)
      .innerJoin(persons, eq(cellMembers.personId, persons.id))
      .where(eq(cellMembers.cellGroupId, cellGroupId))
      .orderBy(persons.fullName)
    ]);

    const [cellGroup] = cellGroupResult;

    if (!cellGroup) return { data: [], error: "Célula não encontrada" };

    // 3. Get leadership persons details
    const leadershipIds = [cellGroup.leaderId, cellGroup.coLeaderId, cellGroup.hostId].filter(
      (id): id is string => !!id
    );

    let leadershipPersons: { id: string; fullName: string }[] = [];
    if (leadershipIds.length > 0) {
      leadershipPersons = await db
        .select({ id: persons.id, fullName: persons.fullName })
        .from(persons)
        .where(inArray(persons.id, leadershipIds));
    }

    // Combine and remove duplicates
    const allMembersMap = new Map<string, string>();
    [...leadershipPersons, ...members].forEach((p) => {
      allMembersMap.set(p.id, p.fullName);
    });

    const result = Array.from(allMembersMap.entries())
      .map(([id, fullName]) => ({ id, fullName }))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));

    return { data: result, error: null };
  } catch (error: any) {
    console.error("Error fetching cell group members:", error);
    return { data: null, error: error.message };
  }
}

export async function createMeeting(data: {
  cellGroupId: string;
  meetingDate: string;
  topic?: string | null;
  initialPrayer?: string | null;
  finalPrayer?: string | null;
  responsibleForReflection?: string | null;
  notes?: string | null;
  photoUrl?: string | null;
  memberCount?: number;
  visitorCount?: number;
  childrenCount?: number;
  attendances?: { personId: string; status: "PRESENT" | "ABSENT" | "VISITOR" }[];
}) {
  try {
    const visitorCount = data.visitorCount ?? 0;
    const childrenCount = data.childrenCount ?? 0;
    const attendances = data.attendances ?? [];
    const memberCount =
      data.memberCount ?? attendances.filter((a) => a.status === "PRESENT").length;
    const individualVisitorCount = attendances.filter((a) => a.status === "VISITOR").length;
    const finalVisitorCount = Math.max(visitorCount, individualVisitorCount);

    const [newMeeting] = await db
      .insert(meetings)
      .values({
        cellGroupId: data.cellGroupId,
        meetingDate: data.meetingDate,
        topic: data.topic ?? null,
        initialPrayer: data.initialPrayer ?? null,
        finalPrayer: data.finalPrayer ?? null,
        responsibleForReflection: data.responsibleForReflection ?? null,
        notes: data.notes ?? null,
        photoUrl: data.photoUrl ?? null,
        memberCount,
        visitorCount: finalVisitorCount,
        childrenCount,
        totalCount: memberCount + finalVisitorCount + childrenCount,
      })
      .returning();

    // Lançar eventos de vida eclesiástica
    const eventRoles = [
      { personId: data.initialPrayer, type: "INITIAL_PRAYER", label: "Oração Inicial" },
      { personId: data.finalPrayer, type: "FINAL_PRAYER", label: "Oração Final" },
      { personId: data.responsibleForReflection, type: "REFLECTION", label: "Reflexão (Palavra)" },
    ];

    for (const role of eventRoles) {
      if (role.personId) {
        await db.insert(churchLifeEvents).values({
          personId: role.personId,
          type: role.type,
          date: data.meetingDate,
          notes: `${role.label} na reunião de ${data.meetingDate} (Relatado via ID: ${newMeeting.id})`,
        });
      }
    }

    if (attendances.length > 0) {
      await db.insert(meetingAttendance).values(
        attendances.map((att) => ({
          meetingId: newMeeting.id,
          personId: att.personId,
          status: att.status,
        }))
      );
    }

    revalidatePath("/meetings");
    return { data: newMeeting, error: null };
  } catch (error: any) {
    console.error("Error creating meeting:", error);
    return { data: null, error: error.message };
  }
}

export async function updateMeeting(
  id: string,
  data: {
    cellGroupId?: string;
    meetingDate?: string;
    topic?: string | null;
    initialPrayer?: string | null;
    finalPrayer?: string | null;
    responsibleForReflection?: string | null;
    notes?: string | null;
    photoUrl?: string | null;
    memberCount?: number;
    visitorCount?: number;
    childrenCount?: number;
    attendances?: { personId: string; status: "PRESENT" | "ABSENT" | "VISITOR" }[];
  }
) {
  try {
    const { dbUser } = await getAuthUserContext();

    // Validate access: the meeting must belong to this church
    const [existing] = await db
      .select({ id: meetings.id })
      .from(meetings)
      .innerJoin(cellGroups, eq(meetings.cellGroupId, cellGroups.id))
      .where(
        and(eq(meetings.id, id), eq(cellGroups.churchId, dbUser.churchId))
      )
      .limit(1);

    if (!existing) {
      throw new Error("Reunião não encontrada ou acesso negado");
    }

    // Fetch existing meeting data to merge counts
    const [meeting] = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, id))
      .limit(1);

    if (!meeting) {
      throw new Error("Reunião não encontrada");
    }

    const visitorCount = data.visitorCount !== undefined ? data.visitorCount : (meeting.visitorCount ?? 0);
    const childrenCount = data.childrenCount !== undefined ? data.childrenCount : (meeting.childrenCount ?? 0);
    const attendancesInput = data.attendances;
    
    let memberCount = data.memberCount !== undefined ? data.memberCount : (meeting.memberCount ?? 0);
    let finalVisitorCount = visitorCount;

    if (attendancesInput) {
      memberCount = attendancesInput.filter(a => a.status === "PRESENT").length;
      const individualVisitorCount = attendancesInput.filter(a => a.status === "VISITOR").length;
      finalVisitorCount = Math.max(visitorCount, individualVisitorCount);
      
      // Update attendance: delete old and insert new
      await db.delete(meetingAttendance).where(eq(meetingAttendance.meetingId, id));
      
      if (attendancesInput.length > 0) {
        await db.insert(meetingAttendance).values(
          attendancesInput.map((att) => ({
            meetingId: id,
            personId: att.personId,
            status: att.status,
          }))
        );
      }
    }

    const [updatedMeeting] = await db
      .update(meetings)
      .set({
        ...(data.cellGroupId && { cellGroupId: data.cellGroupId }),
        ...(data.meetingDate && { meetingDate: data.meetingDate }),
        topic: data.topic !== undefined ? data.topic : meeting.topic,
        initialPrayer: data.initialPrayer !== undefined ? data.initialPrayer : meeting.initialPrayer,
        finalPrayer: data.finalPrayer !== undefined ? data.finalPrayer : meeting.finalPrayer,
        responsibleForReflection: data.responsibleForReflection !== undefined ? data.responsibleForReflection : meeting.responsibleForReflection,
        notes: data.notes !== undefined ? data.notes : meeting.notes,
        photoUrl: data.photoUrl !== undefined ? data.photoUrl : meeting.photoUrl,
        memberCount,
        visitorCount: finalVisitorCount,
        childrenCount,
        totalCount: memberCount + finalVisitorCount + childrenCount,
        updatedAt: new Date(),
      })
      .where(eq(meetings.id, id))
      .returning();

    // Sincronizar eventos de vida eclesiástica
    // 1. Remover eventos antigos desta reunião
    await db.delete(churchLifeEvents).where(
      and(
        ilike(churchLifeEvents.notes, `%Relatado via ID: ${id}%`),
        inArray(churchLifeEvents.type, ["INITIAL_PRAYER", "FINAL_PRAYER", "REFLECTION"])
      )
    );

    // 2. Criar novos eventos
    const eventRoles = [
      { personId: updatedMeeting.initialPrayer, type: "INITIAL_PRAYER", label: "Oração Inicial" },
      { personId: updatedMeeting.finalPrayer, type: "FINAL_PRAYER", label: "Oração Final" },
      { personId: updatedMeeting.responsibleForReflection, type: "REFLECTION", label: "Reflexão (Palavra)" },
    ];

    for (const role of eventRoles) {
      if (role.personId) {
        await db.insert(churchLifeEvents).values({
          personId: role.personId,
          type: role.type,
          date: updatedMeeting.meetingDate,
          notes: `${role.label} na reunião de ${updatedMeeting.meetingDate} (Relatado via ID: ${id})`,
        });
      }
    }

    revalidatePath("/meetings");
    return { data: updatedMeeting, error: null };
  } catch (error: any) {
    console.error("Error updating meeting:", error);
    return { data: null, error: error.message };
  }
}

export async function deleteMeeting(id: string) {
  try {
    const { dbUser } = await getAuthUserContext();

    // Validate access
    const [existing] = await db
      .select({ id: meetings.id })
      .from(meetings)
      .innerJoin(cellGroups, eq(meetings.cellGroupId, cellGroups.id))
      .where(
        and(eq(meetings.id, id), eq(cellGroups.churchId, dbUser.churchId))
      )
      .limit(1);

    if (!existing) {
      throw new Error("Reunião não encontrada ou acesso negado");
    }

    const [deletedMeeting] = await db
      .delete(meetings)
      .where(eq(meetings.id, id))
      .returning();

    revalidatePath("/meetings");
    return { data: deletedMeeting, error: null };
  } catch (error: any) {
    console.error("Error deleting meeting:", error);
    return { data: null, error: error.message };
  }
}
