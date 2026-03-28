import { Bell, Search } from "lucide-react";

export function Header() {
  return (
    <div className="flex h-16 items-center border-b bg-white px-6 shadow-sm">
      <div className="flex flex-1 items-center gap-x-4">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar membro, célula..."
            className="w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-x-4">
        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>
        <div className="flex items-center gap-x-2 ml-2 border-l pl-4">
          <div className="flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-900">Admin Silva</span>
            <span className="text-xs text-slate-500">Administrador</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
            AS
          </div>
        </div>
      </div>
    </div>
  );
}
