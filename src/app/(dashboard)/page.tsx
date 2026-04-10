import { Users, UserPlus, MapPin, TrendingUp, CalendarDays, ArrowRight, Sparkles } from "lucide-react";
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

  // 1. Total de Células Ativas
  const [cellsCount] = await db
    .select({ value: count() })
    .from(cellGroups)
    .where(and(eq(cellGroups.churchId, churchId), eq(cellGroups.status, "ACTIVE")));

  // 2. Membros e Visitantes Totais
  const [membersCount] = await db
    .select({ value: count() })
    .from(persons)
    .where(and(eq(persons.churchId, churchId), eq(persons.attendsChurch, true)));

  // 3. Novos Visitantes (Última Semana)
  const [newVisitorsCount] = await db
    .select({ value: count() })
    .from(visitors)
    .where(and(eq(visitors.churchId, churchId), gte(visitors.createdAt, sevenDaysAgo)));

  // 4. Frequência Média (Média Simples calculada no JS sobre as últimas reuniões)
  const thirtyDaysAgo = subDays(now, 30);
  const recentMeetings = await db
    .select({
      totalCount: meetings.totalCount,
    })
    .from(meetings)
    .innerJoin(cellGroups, eq(meetings.cellGroupId, cellGroups.id))
    .where(and(eq(cellGroups.churchId, churchId), gte(meetings.meetingDate, thirtyDaysAgo.toISOString())));

  let averageAttendance = 0;
  if (recentMeetings.length > 0) {
    const total = recentMeetings.reduce((acc, curr) => acc + (curr.totalCount || 0), 0);
    averageAttendance = Math.round(total / recentMeetings.length);
  }

  // 5. Dados do Gráfico de Crescimento (Últimos 6 Meses)
  const recentPersons = await db
    .select({ joinedAt: persons.createdAt })
    .from(persons)
    .where(and(eq(persons.churchId, churchId), gte(persons.createdAt, sixMonthsAgo)));
    
  const recentVisitorsList = await db
    .select({ createdAt: visitors.createdAt })
    .from(visitors)
    .where(and(eq(visitors.churchId, churchId), gte(visitors.createdAt, sixMonthsAgo)));

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

  // 6. Próximas Reuniões (Cálculo Dinâmico Baseado no Dia da Semana)
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
    "SUNDAY": 0, "MONDAY": 1, "TUESDAY": 2, "WEDNESDAY": 3,
    "THURSDAY": 4, "FRIDAY": 5, "SATURDAY": 6,
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
    const [hours, mins] = timeStr.split(':');
    if (hours && mins) {
      nextDate.setHours(parseInt(hours), parseInt(mins), 0, 0);
    }
    
    if (daysUntil === 0 && nextDate.getTime() < today.getTime()) {
      nextDate.setDate(nextDate.getDate() + 7);
    }
    return nextDate;
  };

  const upcomingMeetings = activeCellGroups
    .map(cell => ({ ...cell, nextDate: getNextMeetingDate(cell.meetingDay || "", cell.meetingTime || "") }))
    .filter(cell => cell.nextDate !== null)
    .sort((a, b) => (a.nextDate!.getTime() - b.nextDate!.getTime()))
    .slice(0, 5);
    
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Visão Geral
            </h1>
          </div>
          <p className="text-base text-slate-500 font-medium">Acompanhe o crescimento e a saúde da sua igreja.</p>
        </div>
        <div className="flex items-center text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-full border shadow-sm">
          Última atualização: {format(now, "HH:mm")}
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-6 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/80 transition-all duration-300">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Células Ativas</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-4xl font-black text-slate-900 tracking-tight">{cellsCount.value}</p>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-6 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/80 transition-all duration-300">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Membros</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-4xl font-black text-slate-900 tracking-tight">{membersCount.value}</p>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-6 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/80 transition-all duration-300">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl group-hover:bg-orange-500/20 transition-all duration-500"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Novos Visitantes</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-4xl font-black text-slate-900 tracking-tight">{newVisitorsCount.value}</p>
              </div>
              <div className="mt-2 flex items-center text-xs font-bold text-orange-600 bg-orange-100/50 w-fit px-2 py-1 rounded-md">
                <TrendingUp className="mr-1 h-3 w-3" />
                Na última semana
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
              <UserPlus className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-6 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/80 transition-all duration-300">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Média de Presença</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-4xl font-black text-slate-900 tracking-tight">{averageAttendance}</p>
                <span className="text-sm font-semibold text-slate-400">/reunião</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-6 w-6" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS & LISTS GRID */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* CHART WIDGET */}
        <div className="col-span-4 rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Crescimento da Igreja</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Evolução de membros e visitantes nos últimos 6 meses</p>
            </div>
          </div>
          <div className="p-6 md:p-8 flex-1 flex flex-col justify-end">
            <OverviewChart data={monthsData} />
          </div>
        </div>
        
        {/* AGENDA WIDGET */}
        <div className="col-span-3 rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Próximas Células</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Agenda dos próximos dias</p>
            </div>
            <div className="p-3 bg-slate-100 text-slate-500 rounded-full">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          
          <div className="p-2 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2 p-2">
              {upcomingMeetings.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <CalendarDays className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">Agenda Vazia</h3>
                  <p className="text-sm text-slate-500 max-w-[200px] mt-1">
                    Nenhuma célula com horário configurado para os próximos dias.
                  </p>
                  <Link href="/cells" className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center group">
                    Configurar Células 
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ) : (
                upcomingMeetings.map((cell) => (
                  <div key={cell.id} className="group relative flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50/80 border border-transparent hover:border-slate-100 transition-all duration-300">
                    <div className="flex flex-col h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200 group-hover:border-blue-200 group-hover:shadow-blue-100 transition-all">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{format(cell.nextDate!, "MMM", { locale: ptBR })}</span>
                      <span className="text-lg font-black text-slate-800 leading-none mt-1">{format(cell.nextDate!, "dd")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors" title={cell.name}>{cell.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {format(cell.nextDate!, "EEEE • HH:mm", { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}
                        </span>
                      </div>
                      {cell.addressLine && (
                        <p className="text-xs font-medium text-slate-500 truncate mt-2 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {cell.addressLine}
                        </p>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

