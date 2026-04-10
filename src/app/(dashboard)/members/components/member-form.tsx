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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Controller } from "react-hook-form";
import { cn } from "@/lib/utils";

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
          nickname: member.nickname || undefined,
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
        spouseId: spouseMode === "select" ? (data.spouseId === "none" ? null : (data.spouseId || null)) : null,
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

  // Styles removed: using shadcn components directly

  return (
    <div className="max-w-4xl mx-auto">
      <form
        onSubmit={handleSubmit(onSubmit, (formErrors) => {
          console.error("Validation errors:", JSON.stringify(formErrors, null, 2));
        })}
        className="space-y-8"
      >
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {/* ── Dados Pessoais ── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="João da Silva"
                  className={errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">Apelido</Label>
                <Input
                  id="nickname"
                  {...register("nickname")}
                  placeholder="Ex: Joãozinho"
                />
                {errors.nickname && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.nickname.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="(11) 98765-4321"
                />
                {errors.phone && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...register("birthDate")}
                />
                {errors.birthDate && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.birthDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gênero</Label>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Masculino</SelectItem>
                        <SelectItem value="FEMALE">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Estado Civil</Label>
                <Controller
                  control={control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="maritalStatus">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOLTEIRO">Solteiro(a)</SelectItem>
                        <SelectItem value="CASADO">Casado(a)</SelectItem>
                        <SelectItem value="DIVORCIADO">Divorciado(a)</SelectItem>
                        <SelectItem value="VIUVO">Viúvo(a)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.maritalStatus && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.maritalStatus.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Cônjuge (condicional) ── */}
          {showSpouse && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Cônjuge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Toggle modo */}
                <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                  <Button
                    type="button"
                    variant={spouseMode === "select" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setSpouseMode("select");
                      setValue("spouseQuickName", "");
                    }}
                    className="rounded-md"
                  >
                    Já cadastrado(a)
                  </Button>
                  <Button
                    type="button"
                    variant={spouseMode === "quick" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setSpouseMode("quick");
                      setValue("spouseId", null);
                    }}
                    className="rounded-md"
                  >
                    Cadastrar agora
                  </Button>
                </div>

                {spouseMode === "select" ? (
                  <div className="space-y-2">
                    <Label htmlFor="spouseId">Selecionar cônjuge</Label>
                    <Controller
                      control={control}
                      name="spouseId"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <SelectTrigger id="spouseId">
                            <SelectValue placeholder="— Nenhum —" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">— Nenhum —</SelectItem>
                            {allPersons
                              .filter((p) => p.id !== member?.id)
                              .map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.fullName}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.spouseId && (
                      <p className="text-xs font-medium text-destructive">
                        {errors.spouseId.message}
                      </p>
                    )}
                    {allPersons.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Nenhum outro membro cadastrado ainda.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-4">
                    <p className="text-xs text-muted-foreground">
                      Preencha apenas o nome para cadastrar o cônjuge rapidamente.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="spouseQuickName">Nome do cônjuge</Label>
                      <Input
                        id="spouseQuickName"
                        {...register("spouseQuickName")}
                        placeholder="Maria da Silva"
                      />
                      {errors.spouseQuickName && (
                        <p className="text-xs font-medium text-destructive">
                          {errors.spouseQuickName.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Controller
                        control={control}
                        name="spouseAttends"
                        render={({ field }) => (
                          <Checkbox
                            id="spouseAttends"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label
                        htmlFor="spouseAttends"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Frequenta a igreja
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Desmarque se o cônjuge não frequenta a igreja.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Endereço ── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine">Endereço Completo</Label>
                <Input
                  id="addressLine"
                  {...register("addressLine")}
                  placeholder="Rua da Esperança, 123"
                />
                {errors.addressLine && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.addressLine.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  {...register("neighborhood")}
                  placeholder="Centro"
                />
                {errors.neighborhood && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.neighborhood.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Vida na Igreja ── */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Vida na Igreja
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEventDialogOpen(true)}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Adicionar Evento
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Histórico de Eventos ({fields.length})</Label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fields.map((field: any, index) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 transition-colors hover:bg-slate-100"
                    >
                      <input type="hidden" {...register(`churchLifeEvents.${index}.type` as const)} />
                      <input type="hidden" {...register(`churchLifeEvents.${index}.date` as const)} />
                      <input type="hidden" {...register(`churchLifeEvents.${index}.notes` as const)} />
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-full shadow-sm text-blue-600">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            {getFriendlyEventTitle(field.type)}
                            {(field as any).isNew && (
                              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                                Novo
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">
                            {formatDateBr(field.date)}
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-slate-400 hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {fields.length === 0 && (
                    <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                      <p className="text-sm text-muted-foreground font-medium">
                        Nenhum evento lançado no histórico.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Observações ── */}
              <div className="space-y-2 pt-4">
                <Label htmlFor="notes">Observações adicionais</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  rows={4}
                  placeholder="Alergias, histórico familiar, etc."
                  className="resize-none"
                />
                {errors.notes && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.notes.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            asChild
          >
            <Link href="/members">Cancelar</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="px-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Membro
              </>
            )}
          </Button>
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
