"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useMemo, useEffect } from "react";
import { CellGroupFormInput, cellGroupSchema } from "@/lib/validations/cell-group";
import { createCellGroup, updateCellGroup } from "@/actions/cell-groups";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft, Search, User, X, UserPlus } from "lucide-react";
import Link from "next/link";
import { cellGroups } from "@/lib/db/schema";
import { QuickPersonDialog } from "./quick-person-dialog";
import { toast } from "@/lib/toast";

type Person = { id: string; fullName: string };

interface CellGroupFormProps {
  cellGroup?: typeof cellGroups.$inferSelect & { memberIds?: string[] };
  leaders?: Person[];
}

const cellGroupTypeLabels: Record<string, string> = {
  CHILDREN: "Infantil",
  YOUNG_ADULTS: "Jovens Adultos",
  TEENAGERS: "Adolescentes",
  ADULTS: "Adultos",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativa",
  PLANTING: "Em Plantio",
  PAUSED: "Pausada",
  CLOSED: "Encerrada",
};

const meetingDays = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

const inputClass =
  "w-full flex h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50";

export function CellGroupForm({ cellGroup, leaders = [] }: CellGroupFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [isQuickPersonDialogOpen, setIsQuickPersonDialogOpen] = useState(false);
  const [availablePersons, setAvailablePersons] = useState<Person[]>(leaders);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CellGroupFormInput>({
    resolver: zodResolver(cellGroupSchema),
    defaultValues: cellGroup
      ? {
          name: cellGroup.name,
          cellGroupType: cellGroup.cellGroupType,
          status: cellGroup.status,
          meetingDay: cellGroup.meetingDay || undefined,
          meetingTime: cellGroup.meetingTime || undefined,
          addressLine: cellGroup.addressLine || undefined,
          neighborhood: cellGroup.neighborhood || undefined,
          city: cellGroup.city || undefined,
          state: cellGroup.state || undefined,
          startDate: cellGroup.startDate || undefined,
          leaderId: cellGroup.leaderId || "",
          coLeaderId: cellGroup.coLeaderId || "",
          hostId: cellGroup.hostId || "",
          memberIds: cellGroup.memberIds || [],
        }
      : {
          status: "ACTIVE",
          leaderId: "",
          coLeaderId: "",
          hostId: "",
          memberIds: [],
        },
  });

  const selectedMembers = watch("memberIds") || [];
  const leaderId = watch("leaderId");
  const coLeaderId = watch("coLeaderId");
  const hostId = watch("hostId");

  const leadershipIds = useMemo(() => [leaderId, coLeaderId, hostId].filter(Boolean), [leaderId, coLeaderId, hostId]);
  
  const filteredSearchMembers = useMemo(() => {
    if (!memberSearch) return [];
    const allAddedIds = [...leadershipIds, ...selectedMembers];
    return availablePersons.filter((p: Person) =>
      p.fullName.toLowerCase().includes(memberSearch.toLowerCase()) &&
      !allAddedIds.includes(p.id)
    );
  }, [availablePersons, memberSearch, leadershipIds, selectedMembers]);

  // Sync: Remove selected members if they are assigned to leadership roles
  useEffect(() => {
    const leadershipIds = [leaderId, coLeaderId, hostId].filter(Boolean) as string[];
    const overlapping = selectedMembers.filter((mId: string) => leadershipIds.includes(mId));
    
    if (overlapping.length > 0) {
      const nextMembers = selectedMembers.filter((mId: string) => !leadershipIds.includes(mId));
      setValue("memberIds", nextMembers, { shouldValidate: true });
    }
  }, [leaderId, coLeaderId, hostId, selectedMembers, setValue]);

  const addMember = (id: string) => {
    setValue("memberIds", [...selectedMembers, id], { shouldValidate: true });
    setMemberSearch("");
  };

  const removeMember = (id: string) => {
    setValue("memberIds", selectedMembers.filter((mId: string) => mId !== id), { shouldValidate: true });
  };

  const getPersonName = (id: string) => availablePersons.find(l => l.id === id)?.fullName || "Pessoa não encontrada";

  const handleQuickPersonSuccess = (person: Person) => {
    // Adiciona às pessoas disponíveis no componente
    setAvailablePersons((prev: Person[]) => [...prev, person]);
    // Já adiciona automaticamente como integrante da célula
    setValue("memberIds", [...selectedMembers, person.id], { shouldValidate: true });
  };

  async function onSubmit(data: CellGroupFormInput) {
    setError(null);
    try {
      const payload = {
        ...data,
        leaderId: data.leaderId === "" ? undefined : data.leaderId,
        coLeaderId: data.coLeaderId === "" ? undefined : data.coLeaderId,
        hostId: data.hostId === "" ? undefined : data.hostId,
      } as any;

      const result = cellGroup
        ? await updateCellGroup(cellGroup.id, payload)
        : await createCellGroup(payload);

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success(cellGroup ? "Célula atualizada" : "Célula criada");
      router.push("/cells");
      router.refresh();
    } catch {
      const message = "Não foi possível concluir esta ação. Tente novamente em instantes.";
      setError(message);
      toast.error(message);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      <form
        onSubmit={handleSubmit(onSubmit, (formErrors) => {
          console.error("Validation errors:", JSON.stringify(formErrors, null, 2));
        })}
        className="space-y-8"
      >
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        {Object.keys(errors).length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md text-sm">
            <p className="font-medium mb-1">Erro de validação. Verifique os campos:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {Object.entries(errors).map(([field, err]) => (
                <li key={field}>
                  {field}: {(err as any)?.message || JSON.stringify(err)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Informações da Célula</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Nome da Célula *</label>
                <input
                  {...register("name")}
                  className={inputClass}
                  placeholder="Ex: Célula da Esperança"
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tipo de Célula *</label>
                <select {...register("cellGroupType")} className={inputClass}>
                  <option value="">Selecione...</option>
                  {Object.entries(cellGroupTypeLabels).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.cellGroupType && (
                  <p className="text-xs text-red-500">{errors.cellGroupType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select {...register("status")} className={inputClass}>
                  {Object.entries(statusLabels).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Data de Início</label>
                <input
                  type="date"
                  {...register("startDate")}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Liderança */}
          <div className="space-y-4 md:col-span-2 mt-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Liderança</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Líder</label>
                <select {...register("leaderId")} className={inputClass}>
                  <option value="">Selecione...</option>
                  {leaders.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.fullName}
                    </option>
                  ))}
                </select>
                {errors.leaderId && (
                  <p className="text-xs text-red-500">{errors.leaderId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Co-Líder</label>
                <select {...register("coLeaderId")} className={inputClass}>
                  <option value="">Selecione...</option>
                  {leaders.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Anfitrião</label>
                <select {...register("hostId")} className={inputClass}>
                  <option value="">Selecione...</option>
                  {leaders.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Integrantes Section */}
          <div className="space-y-4 md:col-span-2 mt-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-slate-900">Integrantes</h3>
              <button
                type="button"
                onClick={() => setIsQuickPersonDialogOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-all border border-blue-200"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Cadastro Rápido
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Search Field */}
              <div className="relative">
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Adicionar Integrantes
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome para adicionar..."
                    className={`${inputClass} pl-10`}
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                  />
                </div>

                {/* Search Results Overlay */}
                {memberSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
                    {filteredSearchMembers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-slate-500">
                        Nenhuma pessoa disponível encontrada.
                      </div>
                    ) : (
                      <div className="p-1">
                        {filteredSearchMembers.map((person) => (
                          <button
                            key={person.id}
                            type="button"
                            onClick={() => addMember(person.id)}
                            className="flex items-center gap-3 w-full p-2.5 hover:bg-slate-50 rounded text-left transition-colors"
                          >
                            <div className="p-1.5 bg-slate-100 rounded-full">
                              <User className="w-4 h-4 text-slate-500" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{person.fullName}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Members List Below */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Lista de Integrantes ({leadershipIds.length + selectedMembers.length})
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Leadership Items - Non-removable from here */}
                  {leaderId && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-100 rounded-full text-blue-600">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{getPersonName(leaderId)}</p>
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Líder</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {coLeaderId && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-100 rounded-full text-blue-600">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{getPersonName(coLeaderId)}</p>
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Co-Líder</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {hostId && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-100 rounded-full text-blue-600">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{getPersonName(hostId)}</p>
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Anfitrião</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Added Members - Removable */}
                  {selectedMembers.map((mId: string) => (
                    <div key={mId} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-slate-100 rounded-full text-slate-500">
                          <User className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-medium text-slate-900">{getPersonName(mId)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMember(mId)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {leadershipIds.length === 0 && selectedMembers.length === 0 && (
                    <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-100 rounded-lg text-slate-400 text-sm">
                      Nenhum integrante na lista ainda.
                    </div>
                  )}
                </div>
              </div>
            </div>
            {errors.memberIds && <p className="text-xs text-red-500">{errors.memberIds.message}</p>}
          </div>

          {/* Reunião */}
          <div className="space-y-4 md:col-span-2 mt-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Reunião</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Dia da Semana</label>
                <select {...register("meetingDay")} className={inputClass}>
                  <option value="">Selecione...</option>
                  {meetingDays.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Horário</label>
                <input
                  type="time"
                  {...register("meetingTime")}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Local de Reunião */}
          <div className="space-y-4 md:col-span-2 mt-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Local de Reunião</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Endereço</label>
                <input
                  {...register("addressLine")}
                  className={inputClass}
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Bairro</label>
                <input
                  {...register("neighborhood")}
                  className={inputClass}
                  placeholder="Centro"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Cidade</label>
                <input
                  {...register("city")}
                  className={inputClass}
                  placeholder="São Paulo"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Estado (UF)</label>
                <input
                  {...register("state")}
                  className={inputClass}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Link
            href="/cells"
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting ? "Salvando..." : "Salvar Célula"}
          </button>
        </div>
      </form>

      <QuickPersonDialog 
        isOpen={isQuickPersonDialogOpen}
        onClose={() => setIsQuickPersonDialogOpen(false)}
        onSuccess={handleQuickPersonSuccess}
      />
    </div>
  );
}
