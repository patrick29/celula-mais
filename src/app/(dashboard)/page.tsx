import { Users, UserPlus, MapPin, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Última atualização: hoje às 14:00</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Stat Cards */}
        <div className="rounded-xl border bg-white p-6 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total de Células</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">24</p>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>+2% vs último mês</span>
            </div>
          </div>
          <div className="rounded-md bg-blue-50 p-3">
            <MapPin className="h-5 w-5 text-blue-600" />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Membros</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">482</p>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>+5% vs último mês</span>
            </div>
          </div>
          <div className="rounded-md bg-green-50 p-3">
            <Users className="h-5 w-5 text-green-600" />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Novos Visitantes</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">38</p>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>Esta semana</span>
            </div>
          </div>
          <div className="rounded-md bg-orange-50 p-3">
            <UserPlus className="h-5 w-5 text-orange-600" />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Frequência Média</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">85%</p>
            <div className="mt-2 flex items-center text-sm text-red-600">
              <TrendingUp className="mr-1 h-3 w-3 rotate-180" />
              <span>-1% vs última semana</span>
            </div>
          </div>
          <div className="rounded-md bg-purple-50 p-3">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Rest of the dashboard sections */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-white shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-slate-900">Crescimento de Membros</h2>
            <p className="text-sm text-slate-500">Evolução nos últimos 6 meses</p>
          </div>
          <div className="p-6 h-[300px] flex items-center justify-center text-slate-400 bg-slate-50/50 m-6 rounded-lg border border-dashed">
            [Gráfico Aqui]
          </div>
        </div>
        
        <div className="col-span-3 rounded-xl border bg-white shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-slate-900">Próximas Reuniões</h2>
            <p className="text-sm text-slate-500">Agenda das próximas células</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-slate-100 font-semibold text-slate-600">
                    <span className="text-xs">Out</span>
                    <span>{12 + i}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Célula Multiplicadores</p>
                    <p className="text-xs text-slate-500">Quinta, 19:30 • Casa do João</p>
                  </div>
                  <div className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    Confirmada
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
