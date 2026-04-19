"use client";

import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { meetingSchema, MeetingFormInput, MeetingFormOutput } from "@/lib/validations/meeting";
import { createMeeting, updateMeeting, getCellGroupMembers } from "@/actions/meetings";
import { uploadMeetingPhoto } from "@/actions/upload";
import { useRouter } from "next/navigation";
import { Save, Loader2, Users, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { DualListSelector } from "@/components/ui/dual-list-selector";
import { ImageUpload } from "@/components/ui/image-upload";
import { AddVisitorDialog } from "./add-visitor-dialog";
import { toast } from "@/lib/toast";

import * as React from "react";
interface MeetingFormProps {
  meeting?: any;
  cellGroups: { id: string; name: string }[];
  initialCellMembers?: { id: string; fullName: string }[];
}

const inputClass =
  "w-full flex h-10 rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50";

const EMPTY_MEMBERS: { id: string; fullName: string }[] = [];

export function MeetingForm({ meeting, cellGroups, initialCellMembers = EMPTY_MEMBERS }: MeetingFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cellMembers, setCellMembers] = useState<{ id: string; fullName: string }[]>(initialCellMembers);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isVisitorDialogOpen, setIsVisitorDialogOpen] = useState(false);
  const [visitorDetails, setVisitorDetails] = useState<{ id: string; fullName: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const isFirstRender = React.useRef(true);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MeetingFormInput>({
    resolver: zodResolver(meetingSchema),
    defaultValues: meeting
      ? {
          cellGroupId: meeting.cellGroupId,
          meetingDate: meeting.meetingDate,
          topic: meeting.topic || "",
          initialPrayer: meeting.initialPrayer || "",
          finalPrayer: meeting.finalPrayer || "",
          responsibleForReflection: meeting.responsibleForReflection || "",
          notes: meeting.notes || "",
          photoUrl: meeting.photoUrl || "",
          visitorCount: meeting.visitorCount || 0,
          childrenCount: meeting.childrenCount || 0,
          attendances: meeting.attendances?.map((a: any) => ({
            personId: a.personId,
            status: a.status,
          })) || [],
        }
      : {
          visitorCount: 0,
          childrenCount: 0,
          meetingDate: new Date().toISOString().split("T")[0],
          attendances: [],
        },
  });

  const cellGroupId = useWatch({ control, name: "cellGroupId" });
  const attendances = useWatch({ control, name: "attendances" }) || [];

  // Initialize visitorDetails if editing
  useEffect(() => {
    if (meeting?.attendances) {
      const visitorsInAttendance = meeting.attendances.filter((a: any) => a.status === "VISITOR");
      if (visitorsInAttendance.length > 0) {
        // We'd ideally want the names here. For now, we'll try to find them if they exist in cellMembers 
        // OR we might need an action to fetch them. 
        // For simplicity, let's assume if they are in attendance but not in cellMembers, they are visitors.
      }
    }
  }, [meeting]);

  useEffect(() => {
    async function fetchMembers() {
      if (!cellGroupId) {
        setCellMembers((prev) => prev.length === 0 ? prev : []);
        return;
      }

      // Se é o primeiro render, estamos editando e o cellGroupId é o mesmo
      // da reunião sendo editada, podemos pular o fetch no cliente, pois
      // já recebemos via SSR initialCellMembers.
      if (
        isFirstRender.current && 
        meeting && 
        cellGroupId === meeting.cellGroupId && 
        initialCellMembers.length > 0
      ) {
        isFirstRender.current = false;
        
        // Configuramos os visitantes detalhados que vieram com a meeting
        if (meeting?.attendances) {
          const currentVisitors = meeting.attendances
            .filter((a: any) => a.status === "VISITOR")
            .map((a: any) => ({ id: a.personId, fullName: a.fullName || "Visitante" }));
          setVisitorDetails(currentVisitors);
        }
        return;
      }

      isFirstRender.current = false;
      setLoadingMembers(true);
      try {
        const { data, error } = await getCellGroupMembers(cellGroupId);
        if (error) {
          toast.error(error);
          setCellMembers([]);
          return;
        }
        const members = data || [];
        setCellMembers(members);

        // Se estiver criando nova reunião e ainda não houver presenças definidas,
        // inicializa todos como ABSENT para que apareçam na lista de "Ausentes"
        const currentAttendances = getValues("attendances") || [];
        if (!meeting && currentAttendances.length === 0 && members.length > 0) {
          setValue(
            "attendances",
            members.map((m) => ({ personId: m.id, status: "ABSENT" as const })),
            { shouldValidate: true }
          );
        }

        // If editing, extract visitors who are not in members
        if (meeting?.attendances && cellGroupId === meeting.cellGroupId) {
          const currentVisitors = meeting.attendances
            .filter((a: any) => a.status === "VISITOR")
            .map((a: any) => ({ id: a.personId, fullName: a.fullName || "Visitante" }));
          setVisitorDetails(currentVisitors);
        }
      } catch {
        toast.error("Não foi possível carregar os membros da célula. Tente novamente em instantes.");
        setCellMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    }
    fetchMembers();
  }, [cellGroupId, meeting, setValue, getValues, initialCellMembers]);

  const selectedPersonIds = attendances
    .filter((a) => a.status === "PRESENT")
    .map((a) => a.personId);

  const visitorAttendances = attendances.filter((a) => a.status === "VISITOR");

  const handleAttendanceChange = (ids: string[]) => {
    // Mantém os visitantes existentes
    const currentVisitors = attendances.filter((a) => a.status === "VISITOR");
    
    // Todos os membros da célula devem estar no array de attendances com status apropriado
    const memberAttendances = cellMembers.map((m) => ({
      personId: m.id,
      status: ids.includes(m.id) ? ("PRESENT" as const) : ("ABSENT" as const),
    }));

    setValue("attendances", [...memberAttendances, ...currentVisitors], { shouldValidate: true });
  };

  const addVisitor = (person: { id: string; fullName: string }) => {
    // Evita duplicados
    if (attendances.some(a => a.personId === person.id)) return;

    const newAttendance = { personId: person.id, status: "VISITOR" as const };
    setValue("attendances", [...attendances, newAttendance], { shouldValidate: true });
    setVisitorDetails(prev => [...prev, person]);
    
    // Incrementa o contador de visitantes
    const currentCount = control._formValues.visitorCount || 0;
    setValue("visitorCount", currentCount + 1);
  };

  const removeVisitor = (id: string) => {
    setValue("attendances", attendances.filter(a => a.personId !== id), { shouldValidate: true });
    setVisitorDetails(prev => prev.filter(v => v.id !== id));
    
    // Decrementa o contador de visitantes
    const currentCount = control._formValues.visitorCount || 0;
    setValue("visitorCount", Math.max(0, currentCount - 1));
  };

  async function onSubmit(input: MeetingFormInput) {
    setError(null);
    try {
      const data = input as MeetingFormOutput;

      // 1. Se houver uma foto selecionada, faz o upload via server action
      let photoUrl: string | null | undefined = undefined;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResult = await uploadMeetingPhoto(formData);

        if (uploadResult.error || !uploadResult.url) {
          const message = uploadResult.error || "Não foi possível enviar a foto. Tente novamente.";
          setError(message);
          toast.error(message);
          return;
        }

        photoUrl = uploadResult.url;
      } else if (meeting?.photoUrl) {
        // Se não trocou a foto, preserva a URL existente
        photoUrl = meeting.photoUrl;
      }

      // 2. Inclui a photoUrl no payload de criação/atualização
      const payload = { ...data, photoUrl: photoUrl ?? null };

      const result = meeting
        ? await updateMeeting(meeting.id, payload)
        : await createMeeting(payload);

      if (result.error || !result.data) {
        const message = result.error ?? "Não foi possível concluir esta ação. Tente novamente em instantes.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(meeting ? "Reunião atualizada" : "Reunião registrada");
      router.push("/meetings");
      router.refresh();
    } catch {
      const message = "Não foi possível concluir esta ação. Tente novamente em instantes.";
      setError(message);
      toast.error(message);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm p-6 overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Informações da Reunião */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground border-b pb-2">Dados da Reunião</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Célula *</label>
                  <select {...register("cellGroupId")} className={inputClass}>
                    <option value="">Selecione a célula...</option>
                    {cellGroups.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.cellGroupId && <p className="text-xs text-destructive">{errors.cellGroupId.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Data da Reunião *</label>
                  <input type="date" {...register("meetingDate")} className={inputClass} />
                  {errors.meetingDate && <p className="text-xs text-destructive">{errors.meetingDate.message}</p>}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center pt-4 border-t border-border">
                <ImageUpload 
                  value={meeting?.photoUrl} 
                  onChange={setSelectedFile}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Visitantes */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#2d4a2b]" />
                Visitantes Individuais
              </h3>
              <button
                type="button"
                onClick={() => setIsVisitorDialogOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2d4a2b] hover:text-[#3a5e36] bg-[#e5ecdf] hover:bg-[#e5ecdf] px-3 py-1.5 rounded-md transition-all border border-[#ebe3cf]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Adicionar Visitante
              </button>
            </div>

            {visitorDetails.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {visitorDetails.map((visitor) => (
                  <div key={visitor.id} className="flex items-center justify-between p-2.5 bg-muted/60 border border-border rounded-lg group">
                    <span className="text-sm font-medium text-foreground">{visitor.fullName}</span>
                    <button
                      type="button"
                      onClick={() => removeVisitor(visitor.id)}
                      className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic py-2 text-center border border-dashed rounded-lg border-border">
                Nenhum visitante individual adicionado.
              </p>
            )}
          </div>

          {/* Controle de Presença */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2d4a2b]" />
                Chamada de Membros
              </h3>
              <div className="flex gap-2">
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-[#e5ecdf] text-[#2d4a2b] rounded-full">
                  {selectedPersonIds.length} Membros
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-[#e5ecdf] text-[#2d4a2b] rounded-full">
                  {visitorDetails.length} Visitantes
                </span>
              </div>
            </div>
            
            {!cellGroupId ? (
              <div className="py-12 border-2 border-dashed border-border rounded-lg text-center bg-muted/40">
                <p className="text-sm text-muted-foreground">Selecione uma célula para ver os integrantes</p>
              </div>
            ) : loadingMembers ? (
              <div className="py-12 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#2d4a2b]" />
              </div>
            ) : (
              <DualListSelector
                items={[
                  ...cellMembers.map((m) => ({ id: m.id, label: m.fullName })),
                  ...visitorDetails.map((v) => ({ id: v.id, label: v.fullName })),
                ]}
                selectedIds={[...selectedPersonIds, ...visitorDetails.map((v) => v.id)]}
                disabledIds={visitorDetails.map((v) => v.id)}
                onChange={handleAttendanceChange}
                leftTitle="Ausentes"
                rightTitle="Presentes"
              />
            )}
          </div>

          {/* Dinâmica da Reunião */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="font-semibold text-foreground border-b pb-2">Dinâmica da Reunião</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Tópico / Estudo</label>
                <input
                  {...register("topic")}
                  className={inputClass}
                  placeholder="Ex: Fruto do Espírito #1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Oração Inicial</label>
                <Controller
                  control={control}
                  name="initialPrayer"
                  render={({ field }) => (
                    <select
                      {...field}
                      value={field.value || ""}
                      className={inputClass}
                      disabled={!cellGroupId || loadingMembers}
                    >
                      <option value="">Selecione...</option>
                      {[...cellMembers, ...visitorDetails].map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.fullName}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Oração Final</label>
                <Controller
                  control={control}
                  name="finalPrayer"
                  render={({ field }) => (
                    <select
                      {...field}
                      value={field.value || ""}
                      className={inputClass}
                      disabled={!cellGroupId || loadingMembers}
                    >
                      <option value="">Selecione...</option>
                      {[...cellMembers, ...visitorDetails].map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.fullName}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Reflexão (Palavra)</label>
                <Controller
                  control={control}
                  name="responsibleForReflection"
                  render={({ field }) => (
                    <select
                      {...field}
                      value={field.value || ""}
                      className={inputClass}
                      disabled={!cellGroupId || loadingMembers}
                    >
                      <option value="">Selecione...</option>
                      {[...cellMembers, ...visitorDetails].map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.fullName}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Observações</label>
                <textarea
                  {...register("notes")}
                  className={inputClass + " h-24 resize-none"}
                  placeholder="Detalhes sobre a reunião, pedidos de oração, etc."
                />
              </div>
            </div>
          </div>

        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
          <Link
            href="/meetings"
            className="px-4 py-2 text-sm font-medium text-foreground hover:text-foreground bg-white border border-border rounded-md hover:bg-muted/60 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-[#3a5e36] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting ? "Salvando..." : "Salvar Reunião"}
          </button>
        </div>
      </form>

      <AddVisitorDialog
        isOpen={isVisitorDialogOpen}
        onClose={() => setIsVisitorDialogOpen(false)}
        onSuccess={addVisitor}
        excludeIds={[...selectedPersonIds, ...visitorDetails.map(v => v.id)]}
      />
    </div>
  );
}
