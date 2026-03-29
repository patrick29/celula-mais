"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthUserContext } from "@/lib/auth-context";

export async function uploadMeetingPhoto(formData: FormData): Promise<{
  url: string | null;
  error: string | null;
}> {
  try {
    const file = formData.get("file") as File | null;

    if (!file) {
      return { url: null, error: "Nenhum arquivo enviado" };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: "O arquivo é muito grande. O limite é 5MB." };
    }

    // Usa o mesmo padrão de auth do restante do app
    const { dbUser } = await getAuthUserContext();

    const supabase = await createClient();

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${dbUser.id}/${fileName}`;

    // Converte File para ArrayBuffer para uso no servidor
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("meeting-photos")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { url: null, error: `Erro no upload: ${uploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("meeting-photos").getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error: any) {
    console.error("Upload error:", error);
    return { url: null, error: error.message || "Erro desconhecido no upload" };
  }
}
