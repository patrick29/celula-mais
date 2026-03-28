"use client";

import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { memberSchema, MemberFormInput } from "@/lib/validations/member";
import { createMember, updateMember } from "@/actions/members";
import { useRouter } from "next/navigation";
import { Save, Loader2, Plus, Trash2, Calendar } from "lucide-react";
import Link from "next/link";
import { persons } from "@/lib/db/schema";
import { ChurchEventDialog } from "./church-event-dialog";

type PersonOption = { id: string; fullName: string };

interface MemberFormProps {
  member?: typeof persons.$inferSelect & {
    churchLifeEvents?: any[];
    spouse?: { id: string; fullName: string } | null;
  };
  allPersons?: PersonOption[];
}

export function MemberForm({ member, allPersons = [] }: MemberFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  // "select" = já cadastrado | "quick" = cadastro rápido
  const [spouseMode, setSpouseMode] = useState<"select" | "quick">(
    member?.spouseId ? "select" : "quick"
  );

  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  const handleAddEvent = (eventData: { type: string; date: string; notes?: string }) => {
    const eventToAdd = { ...eventData, isNew: true };
    const insertIndex = fields.findIndex((f: any) => f.date < eventData.date);
    if (insertIndex === -1) append(eventToAdd as any);
    else insert(insertIndex, eventToAdd as any);
  };

  const eventTypeLabels: Record<string, string> = {
    // English (Current)
    BAPTISM: "Batismo nas Águas",
    BECAME_MEMBER: "Tornou-se Membro",
    MARRIAGE: "Casamento",
    BECAME_LEADER: "Tornou-se Líder",
    LEFT_LEADERSHIP: "Deixou de ser Líder",
    BECAME_CO_LEADER: "Tornou-se Co-líder",
    LEFT_CO_LEADERSHIP: "Deixou de ser Co-líder",
    BECAME_HOST: "Tornou-se Anfitrião",
    LEFT_HOST: "Deixou de ser Anfitrião",
    BECAME_SUPERVISOR: "Tornou-se Supervisor",
    LEFT_SUPERVISOR: "Deixou de ser Supervisor",
    INITIAL_PRAYER: "Oração Inicial",
    FINAL_PRAYER: "Oração Final",
    REFLECTION: "Reflexão (Palavra)",
    OTHER: "Outro",

    // Portuguese (Legacy)
    BATISMO: "Batismo nas Águas",
    MEMBRO: "Tornou-se Membro",
    CASAMENTO: "Casamento",
    LIDERANCA: "Tornou-se Líder",
    DEIXOU_LIDERANCA: "Deixou de ser Líder",
    COLIDERANCA: "Tornou-se Co-líder",
    DEIXOU_COLIDERANCA: "Deixou de ser Co-líder",
    ANFITRIAO: "Tornou-se Anfitrião",
    DEIXOU_ANFITRIAO: "Deixou de ser Anfitrião",
    SUPERVISOR: "Tornou-se Supervisor",
    DEIXOU_SUPERVISOR: "Deixou de ser Supervisor",
    OUTRO: "Outro",
  };

  const getFriendlyEventTitle = (rawType: string) => {
    if (!rawType) return "Evento";
    const key = String(rawType).toUpperCase().trim();
    if (eventTypeLabels[key]) return eventTypeLabels[key];
    
    // Fallback: remove underscores and capitalize each word
    return String(rawType)
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatDateBr = (dateString: string) => {
    if (!dateString) return "";
    const [y, m, d] = dateString.split("-");
    return `${d}/${m}/${y}`;
  };

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<MemberFormInput>({
    resolver: zodResolver(memberSchema),
    defaultValues: member
      ? {
          fullName: member.fullName,
          phone: member.phone || undefined,
          birthDate: member.birthDate || undefined,
          gender: member.gender || undefined,
          maritalStatus: member.maritalStatus || undefined,
          spouseId: member.spouseId || undefined,
          spouseAttends: true,
          addressLine: member.addressLine || undefined,
          neighborhood: member.neighborhood || undefined,
          churchLifeEvents: Array.isArray(member.churchLifeEvents)
            ? member.churchLifeEvents.map((e: any) => ({
                type: e.type,
                date: e.date,
                notes: e.notes || "",
              }))
            : [],
          notes: member.notes || undefined,
        }
      : { churchLifeEvents: [], spouseAttends: true },
  });

  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: "churchLifeEvents",
  });

  const maritalStatus = useWatch({ control, name: "maritalStatus" });
  const showSpouse = maritalStatus === "CASADO";

  async function onSubmit(data: MemberFormInput) {
    setError(null);
    try {
      const payload = {
        ...data,
        gender: data.gender === "" ? undefined : data.gender,
        churchId: "",
        cellGroupId: null,
        // Se modo "select" mas sem id selecionado, nulifica
        spouseId: spouseMode === "select" ? (data.spouseId || null) : null,
        spouseQuickName: spouseMode === "quick" ? data.spouseQuickName : undefined,
        spouseAttends: spouseMode === "quick" ? data.spouseAttends : undefined,
        churchLifeEvents: data.churchLifeEvents?.map((evt) => {
          const { isNew: _, ...rest } = evt as any;
          return rest;
        }),
      } as any;

      const result = member
        ? await updateMember(member.id, payload)
        : await createMember(payload);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.push("/members");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao salvar.");
    }
  }

  const inputCls =
    "w-full flex h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50";
  const selectCls =
    "w-full flex h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600";

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
          {/* ── Dados Pessoais ── */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nome Completo *</label>
                <input {...register("fullName")} className={inputCls} placeholder="João da Silva" />
                {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Telefone (WhatsApp)</label>
                <input {...register("phone")} className={inputCls} placeholder="(11) 98765-4321" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Data de Nascimento</label>
                <input type="date" {...register("birthDate")} className={selectCls} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Gênero</label>
                <select {...register("gender")} className={selectCls}>
                  <option value="">Selecione...</option>
                  <option value="MALE">Masculino</option>
                  <option value="FEMALE">Feminino</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Estado Civil</label>
                <select {...register("maritalStatus")} className={selectCls}>
                  <option value="">Selecione...</option>
                  <option value="SOLTEIRO">Solteiro(a)</option>
                  <option value="CASADO">Casado(a)</option>
                  <option value="DIVORCIADO">Divorciado(a)</option>
                  <option value="VIUVO">Viúvo(a)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Cônjuge (condicional) ── */}
          {showSpouse && (
            <div className="space-y-4 md:col-span-2 mt-2">
              <h3 className="font-semibold text-slate-900 border-b pb-2">Cônjuge</h3>

              {/* Toggle modo */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSpouseMode("select");
                    setValue("spouseQuickName", "");
                  }}
                  className={`px-4 py-1.5 text-sm rounded-full font-medium transition-colors border ${
                    spouseMode === "select"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  Já cadastrado(a)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSpouseMode("quick");
                    setValue("spouseId", null);
                  }}
                  className={`px-4 py-1.5 text-sm rounded-full font-medium transition-colors border ${
                    spouseMode === "quick"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  Cadastrar agora
                </button>
              </div>

              {spouseMode === "select" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Selecionar cônjuge
                  </label>
                  <select {...register("spouseId")} className={selectCls}>
                    <option value="">— Nenhum —</option>
                    {allPersons
                      .filter((p) => p.id !== member?.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.fullName}
                        </option>
                      ))}
                  </select>
                  {allPersons.length === 0 && (
                    <p className="text-xs text-slate-500">
                      Nenhum outro membro cadastrado ainda.
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
                  <p className="text-xs text-slate-500">
                    Preencha apenas o nome para cadastrar o cônjuge rapidamente.
                  </p>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Nome do cônjuge
                    </label>
                    <input
                      {...register("spouseQuickName")}
                      className={inputCls}
                      placeholder="Maria da Silva"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      {...register("spouseAttends")}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      defaultChecked
                    />
                    <span className="text-sm text-slate-700">Frequenta a igreja</span>
                  </label>
                  <p className="text-xs text-slate-400">
                    Desmarque se o cônjuge não frequenta a igreja.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Endereço ── */}
          <div className="space-y-4 md:col-span-2 mt-4">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Endereço Completo</label>
                <input
                  {...register("addressLine")}
                  className={inputCls}
                  placeholder="Rua da Esperança, 123"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Bairro</label>
                <input {...register("neighborhood")} className={inputCls} placeholder="Centro" />
              </div>
            </div>
          </div>

          {/* ── Vida na Igreja ── */}
          <div className="space-y-4 md:col-span-2 mt-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-slate-900">Vida na Igreja</h3>
              <button
                type="button"
                onClick={() => setIsEventDialogOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-all border border-blue-200"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Evento
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Histórico de Eventos ({fields.length})
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {fields.map((field: any, index) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm"
                    >
                      <input type="hidden" {...register(`churchLifeEvents.${index}.type` as const)} />
                      <input type="hidden" {...register(`churchLifeEvents.${index}.date` as const)} />
                      <input type="hidden" {...register(`churchLifeEvents.${index}.notes` as const)} />
                      
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-slate-100 rounded-full text-slate-500">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            {getFriendlyEventTitle(field.type)}
                            {(field as any).isNew && (
                              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                Novo
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDateBr(field.date)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {fields.length === 0 && (
                    <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-100 rounded-lg text-slate-400 text-sm">
                      Nenhum evento lançado no histórico.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Observações ── */}
          <div className="space-y-2 md:col-span-2 mt-4">
            <label className="text-sm font-medium text-slate-700">Observações adicionais</label>
            <textarea
              {...register("notes")}
              rows={3}
              className="w-full flex rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Alergias, histórico familiar, etc."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Link
            href="/members"
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSubmitting ? "Salvando..." : "Salvar Membro"}
          </button>
        </div>
      </form>

      <ChurchEventDialog 
        isOpen={isEventDialogOpen}
        onClose={() => setIsEventDialogOpen(false)}
        onSuccess={handleAddEvent}
      />
    </div>
  );
}
