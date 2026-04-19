import {
  Users,
  UserPlus,
  MapPin,
  TrendingUp,
  CalendarDays,
  ArrowRight,
  Grape,
} from "lucide-react";
import { db } from "@/lib/db";
import { cellGroups, persons, visitors, meetings } from "@/lib/db/schema";
import { getAuthUserContext } from "@/lib/auth-context";
import { and, count, eq, gte } from "drizzle-orm";
import { subDays, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OverviewChart } from "./components/overview-chart";
import Link from "next/link";

export default async function DashboardPage() {
  const { dbUser } = await getAuthUserContext();
  const churchId = dbUser.churchId;

  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);
  const sixMonthsAgo = subMonths(now, 6);

  const [cellsCount] = await db
    .select({ value: count() })
    .from(cellGroups)
    .where(and(eq(cellGroups.churchId, churchId), eq(cellGroups.status, "ACTIVE")));

  const [membersCount] = await db
    .select({ value: count() })
    .from(persons)
    .where(and(eq(persons.churchId, churchId), eq(persons.attendsChurch, true)));

  const [newVisitorsCount] = await db
    .select({ value: count() })
    .from(visitors)
    .where(and(eq(visitors.churchId, churchId), gte(visitors.createdAt, sevenDaysAgo)));

  const thirtyDaysAgo = subDays(now, 30);
  const recentMeetings = await db
    .select({ totalCount: meetings.totalCount })
    .from(meetings)
    .innerJoin(cellGroups, eq(meetings.cellGroupId, cellGroups.id))
    .where(
      and(
        eq(cellGroups.churchId, churchId),
        gte(meetings.meetingDate, thirtyDaysAgo.toISOString())
      )
    );

  let averageAttendance = 0;
  if (recentMeetings.length > 0) {
    const total = recentMeetings.reduce(
      (acc, curr) => acc + (curr.totalCount || 0),
      0
    );
    averageAttendance = Math.round(total / recentMeetings.length);
  }

  const recentPersons = await db
    .select({ joinedAt: persons.createdAt })
    .from(persons)
    .where(
      and(eq(persons.churchId, churchId), gte(persons.createdAt, sixMonthsAgo))
    );

  const recentVisitorsList = await db
    .select({ createdAt: visitors.createdAt })
    .from(visitors)
    .where(
      and(eq(visitors.churchId, churchId), gte(visitors.createdAt, sixMonthsAgo))
    );

  const monthsData = Array.from({ length: 6 }).map((_, i) => {
    const date = subMonths(now, 5 - i);
    return {
      name: format(date, "MMM", { locale: ptBR }),
      monthIndex: date.getMonth(),
      members: 0,
      visitors: 0,
    };
  });

  recentPersons.forEach((person) => {
    const pDate = new Date(person.joinedAt);
    const monthRecord = monthsData.find((m) => m.monthIndex === pDate.getMonth());
    if (monthRecord) monthRecord.members += 1;
  });

  recentVisitorsList.forEach((visitor) => {
    const vDate = new Date(visitor.createdAt);
    const monthRecord = monthsData.find((m) => m.monthIndex === vDate.getMonth());
    if (monthRecord) monthRecord.visitors += 1;
  });

  const activeCellGroups = await db
    .select({
      id: cellGroups.id,
      name: cellGroups.name,
      meetingDay: cellGroups.meetingDay,
      meetingTime: cellGroups.meetingTime,
      addressLine: cellGroups.addressLine,
    })
    .from(cellGroups)
    .where(and(eq(cellGroups.churchId, churchId), eq(cellGroups.status, "ACTIVE")));

  const daysMap: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  const getNextMeetingDate = (dayStr: string, timeStr: string) => {
    if (!dayStr || !timeStr || daysMap[dayStr] === undefined) return null;
    const targetDay = daysMap[dayStr];
    const today = new Date();
    const currentDay = today.getDay();
    let daysUntil = targetDay - currentDay;
    if (daysUntil < 0) daysUntil += 7;

    const nextDate = new Date();
    nextDate.setDate(today.getDate() + daysUntil);
    const [hours, mins] = timeStr.split(":");
    if (hours && mins) {
      nextDate.setHours(parseInt(hours), parseInt(mins), 0, 0);
    }

    if (daysUntil === 0 && nextDate.getTime() < today.getTime()) {
      nextDate.setDate(nextDate.getDate() + 7);
    }
    return nextDate;
  };

  const upcomingMeetings = activeCellGroups
    .map((cell) => ({
      ...cell,
      nextDate: getNextMeetingDate(cell.meetingDay || "", cell.meetingTime || ""),
    }))
    .filter((cell) => cell.nextDate !== null)
    .sort((a, b) => a.nextDate!.getTime() - b.nextDate!.getTime())
    .slice(0, 5);

  const firstName = dbUser.fullName?.split(" ")[0] ?? "";

  const kpis = [
    {
      label: "Células ativas",
      value: cellsCount.value,
      icon: MapPin,
      hint: "Ramos vivos na rede",
    },
    {
      label: "Membros",
      value: membersCount.value,
      icon: Users,
      hint: "Vidas acompanhadas",
    },
    {
      label: "Novos visitantes",
      value: newVisitorsCount.value,
      icon: UserPlus,
      hint: "Últimos 7 dias",
    },
    {
      label: "Média de presença",
      value: averageAttendance,
      icon: TrendingUp,
      hint: "Por encontro · 30 dias",
    },
  ];

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <Grape className="h-4 w-4 text-[#2d4a2b]" strokeWidth={1.75} />
            Visão geral
          </div>
          <h1 className="font-serif text-4xl md:text-[42px] leading-tight text-foreground">
            {firstName ? `Graça e paz, ${firstName}.` : "Graça e paz com você."}
          </h1>
          <p className="text-base text-muted-foreground max-w-xl">
            Aqui está a videira hoje — cada ramo, cada fruto, cada encontro que
            faz parte da sua rede.
          </p>
        </div>
        <div className="flex items-center text-xs font-medium text-muted-foreground bg-card px-3 py-2 rounded-md border border-border">
          Atualizado às {format(now, "HH:mm")}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-[#d4a43c]/50 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {kpi.label}
              </p>
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#e5ecdf] text-[#2d4a2b]">
                <kpi.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </div>
            </div>
            <p className="mt-3 font-serif text-4xl leading-none text-foreground">
              {kpi.value}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{kpi.hint}</p>
          </div>
        ))}
      </div>

      {/* CHART + AGENDA */}
      <div className="grid gap-5 lg:grid-cols-7">
        <div className="lg:col-span-4 rounded-xl border border-border bg-card flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="font-serif text-xl text-foreground">
              Crescimento da videira
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Evolução de membros e visitantes nos últimos 6 meses.
            </p>
          </div>
          <div className="p-6 flex-1">
            <OverviewChart data={monthsData} />
          </div>
        </div>

        <div className="lg:col-span-3 rounded-xl border border-border bg-card flex flex-col overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-start">
            <div>
              <h2 className="font-serif text-xl text-foreground">
                Próximos encontros
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Onde a videira se reúne em breve.
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f6ead0] text-[#b88a28]">
              <CalendarDays className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {upcomingMeetings.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CalendarDays
                    className="h-7 w-7 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                </div>
                <h3 className="font-serif text-lg text-foreground">
                  Agenda silenciosa
                </h3>
                <p className="text-sm text-muted-foreground max-w-[220px] mt-1">
                  Nenhum encontro agendado ainda. Marque o próximo momento de
                  comunhão.
                </p>
                <Link
                  href="/cells"
                  className="mt-5 text-sm font-medium text-[#2d4a2b] hover:text-[#6b2d3f] inline-flex items-center group/link"
                >
                  Configurar células
                  <ArrowRight
                    className="ml-1 h-4 w-4 group-hover/link:translate-x-0.5 transition-transform"
                    strokeWidth={1.75}
                  />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {upcomingMeetings.map((cell) => (
                  <div
                    key={cell.id}
                    className="group flex items-center gap-4 p-5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex flex-col h-14 w-14 items-center justify-center rounded-md border border-border bg-background">
                      <span className="text-[10px] font-medium text-[#6b2d3f] uppercase tracking-[0.1em]">
                        {format(cell.nextDate!, "MMM", { locale: ptBR })}
                      </span>
                      <span className="font-serif text-xl text-foreground leading-none mt-0.5">
                        {format(cell.nextDate!, "dd")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium text-foreground truncate"
                        title={cell.name}
                      >
                        {cell.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(cell.nextDate!, "EEEE • HH:mm", {
                          locale: ptBR,
                        }).replace(/^\w/, (c) => c.toUpperCase())}
                      </p>
                      {cell.addressLine && (
                        <p className="text-xs text-muted-foreground truncate mt-1 flex items-center gap-1">
                          <MapPin
                            className="h-3 w-3"
                            strokeWidth={1.75}
                          />
                          {cell.addressLine}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
