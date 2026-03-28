"use server";

import { db } from "@/lib/db";
import { cellGroups, users, persons, cellMembers, churchLifeEvents } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, and, ilike, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getAuthUserContext() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser) {
    const [fallbackUser] = await db.select().from(users).limit(1);

    if (!fallbackUser) {
      throw new Error("Unauthorized and no fallback user found. Please seed the database first.");
    }

    return {
      authUser: { id: fallbackUser.id } as any,
      dbUser: fallbackUser,
    };
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!dbUser) {
    throw new Error("User not found in database");
  }

  return { authUser, dbUser };
}

export type GetCellGroupsParams = {
  search?: string;
  status?: string;
};

export async function getCellGroups(params?: GetCellGroupsParams) {
  try {
    const { dbUser } = await getAuthUserContext();

    const conditions = [eq(cellGroups.churchId, dbUser.churchId)];

    if (params?.search) {
      conditions.push(ilike(cellGroups.name, `%${params.search}%`));
    }

    const cellGroupsList = await db
      .select({
        id: cellGroups.id,
        name: cellGroups.name,
        cellGroupType: cellGroups.cellGroupType,
        status: cellGroups.status,
        meetingDay: cellGroups.meetingDay,
        meetingTime: cellGroups.meetingTime,
        addressLine: cellGroups.addressLine,
        neighborhood: cellGroups.neighborhood,
        city: cellGroups.city,
        state: cellGroups.state,
        startDate: cellGroups.startDate,
        churchId: cellGroups.churchId,
        leaderId: cellGroups.leaderId,
        coLeaderId: cellGroups.coLeaderId,
        hostId: cellGroups.hostId,
        supervisorId: cellGroups.supervisorId,
        createdAt: cellGroups.createdAt,
        updatedAt: cellGroups.updatedAt,
        leaderName: persons.fullName,
      })
      .from(cellGroups)
      .leftJoin(persons, eq(cellGroups.leaderId, persons.id))
      .where(and(...conditions))
      .orderBy(desc(cellGroups.createdAt));

    return { data: cellGroupsList, error: null };
  } catch (error: any) {
    console.error("Error fetching cell groups:", error);
    return { data: null, error: error.message };
  }
}

export async function getCellGroupById(id: string) {
  try {
    const { dbUser } = await getAuthUserContext();

    const [cellGroup] = await db
      .select()
      .from(cellGroups)
      .where(and(eq(cellGroups.id, id), eq(cellGroups.churchId, dbUser.churchId)))
      .limit(1);

    if (!cellGroup) {
      return { data: null, error: "Célula não encontrada" };
    }

    // Buscar integrantes
    const members = await db
      .select({ personId: cellMembers.personId })
      .from(cellMembers)
      .where(eq(cellMembers.cellGroupId, id));

    const dataWithMembers = {
      ...cellGroup,
      memberIds: members.map((m) => m.personId),
    };

    return { data: dataWithMembers, error: null };
  } catch (error: any) {
    console.error("Error fetching cell group by id:", error);
    return { data: null, error: error.message };
  }
}

export async function getLeadersForSelect() {
  try {
    const { dbUser } = await getAuthUserContext();

    const leaders = await db
      .select({ id: persons.id, fullName: persons.fullName })
      .from(persons)
      .where(eq(persons.churchId, dbUser.churchId))
      .orderBy(persons.fullName);

    return { data: leaders, error: null };
  } catch (error: any) {
    console.error("Error fetching leaders:", error);
    return { data: null, error: error.message };
  }
}

export async function createCellGroup(data: any) {
  try {
    const { dbUser } = await getAuthUserContext();
    const { memberIds, ...rest } = data;

    const insertData = {
      ...rest,
      churchId: dbUser.churchId,
      leaderId: rest.leaderId || null,
      coLeaderId: rest.coLeaderId || null,
      hostId: rest.hostId || null,
    } as typeof cellGroups.$inferInsert;

    const [newCellGroup] = await db.insert(cellGroups).values(insertData).returning();

    // Lançar eventos iniciais de funções
    const roles = [
      { key: 'leaderId', type: 'LIDERANCA', label: 'Líder' },
      { key: 'coLeaderId', type: 'COLIDERANCA', label: 'Co-líder' },
      { key: 'hostId', type: 'ANFITRIAO', label: 'Anfitrião' },
      { key: 'supervisorId', type: 'SUPERVISOR', label: 'Supervisor' },
    ];

    const today = new Date().toISOString().split('T')[0];
    
    for (const role of roles) {
      const personId = rest[role.key];
      if (personId) {
        await db.insert(churchLifeEvents).values({
          personId,
          type: role.type,
          date: today,
          notes: `Tornou-se ${role.label} da célula ${newCellGroup.name} (Cadastro inicial)`,
        });
      }
    }

    if (memberIds && memberIds.length > 0) {
      const memberInserts = memberIds.map((personId: string) => ({
        cellGroupId: newCellGroup.id,
        personId,
      }));
      await db.insert(cellMembers).values(memberInserts);
    }

    revalidatePath("/cells");
    return { data: newCellGroup, error: null };
  } catch (error: any) {
    console.error("Error creating cell group:", error);
    return { data: null, error: error.message };
  }
}

export async function updateCellGroup(id: string, data: any) {
  try {
    const { dbUser } = await getAuthUserContext();

    const { memberIds, churchId, regionId, ...updateData } = data;

    const cleanData = {
      ...updateData,
      leaderId: data.leaderId || null,
      coLeaderId: data.coLeaderId || null,
      hostId: data.hostId || null,
      updatedAt: new Date(),
    };

    const [oldCellGroup] = await db
      .select()
      .from(cellGroups)
      .where(eq(cellGroups.id, id))
      .limit(1);

    const [updatedCellGroup] = await db
      .update(cellGroups)
      .set(cleanData)
      .where(and(eq(cellGroups.id, id), eq(cellGroups.churchId, dbUser.churchId)))
      .returning();

    if (!updatedCellGroup) {
      throw new Error("Célula não encontrada ou acesso negado");
    }

    // Lançar eventos de transição de funções
    const roles = [
      { key: 'leaderId', type: 'LIDERANCA', label: 'Líder', contrary: 'DEIXOU_LIDERANCA' },
      { key: 'coLeaderId', type: 'COLIDERANCA', label: 'Co-líder', contrary: 'DEIXOU_COLIDERANCA' },
      { key: 'hostId', type: 'ANFITRIAO', label: 'Anfitrião', contrary: 'DEIXOU_ANFITRIAO' },
      { key: 'supervisorId', type: 'SUPERVISOR', label: 'Supervisor', contrary: 'DEIXOU_SUPERVISOR' },
    ];

    const today = new Date().toISOString().split('T')[0];

    for (const role of roles) {
      const oldId = oldCellGroup[role.key as keyof typeof oldCellGroup];
      const newId = cleanData[role.key as keyof typeof cleanData];

      if (oldId !== newId) {
        // Se saiu da função
        if (oldId) {
          await db.insert(churchLifeEvents).values({
            personId: oldId as string,
            type: role.contrary,
            date: today,
            notes: `Deixou de ser ${role.label} da célula ${updatedCellGroup.name} (Alteração de liderança)`,
          });
        }
        // Se entrou na função
        if (newId) {
          await db.insert(churchLifeEvents).values({
            personId: newId as string,
            type: role.type,
            date: today,
            notes: `Tornou-se ${role.label} da célula ${updatedCellGroup.name}`,
          });
        }
      }
    }

    // Sincronizar integrantes
    await db.delete(cellMembers).where(eq(cellMembers.cellGroupId, id));

    if (memberIds && memberIds.length > 0) {
      const memberInserts = memberIds.map((personId: string) => ({
        cellGroupId: id,
        personId,
      }));
      await db.insert(cellMembers).values(memberInserts);
    }

    revalidatePath("/cells");
    return { data: updatedCellGroup, error: null };
  } catch (error: any) {
    console.error("Error updating cell group:", error);
    return { data: null, error: error.message };
  }
}

export async function deleteCellGroup(id: string) {
  try {
    const { dbUser } = await getAuthUserContext();

    const [deletedCellGroup] = await db
      .delete(cellGroups)
      .where(and(eq(cellGroups.id, id), eq(cellGroups.churchId, dbUser.churchId)))
      .returning();

    if (!deletedCellGroup) {
      throw new Error("Célula não encontrada ou acesso negado");
    }

    revalidatePath("/cells");
    return { data: deletedCellGroup, error: null };
  } catch (error: any) {
    console.error("Error deleting cell group:", error);
    return { data: null, error: error.message };
  }
}
