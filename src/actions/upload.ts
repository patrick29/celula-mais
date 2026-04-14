"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthUserContext } from "@/lib/auth-context";
import { toActionError, logActionError } from "@/lib/actions/result";

export async function uploadMeetingPhoto(formData: FormData): Promise<{
  url: string | null;
  error: string | null;
}> {
  try {
    const file = formData.get("file") as File | null;

    if (!file) {
      return { url: null, error: "Selecione um arquivo para enviar." };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: "O arquivo é muito grande. O limite é 5MB." };
    }

    const { dbUser } = await getAuthUserContext();

    const supabase = await createClient();

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${dbUser.id}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("meeting-photos")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      logActionError("uploadMeetingPhoto", uploadError, { filePath });
      return {
        url: null,
        error: "Não foi possível enviar a foto. Verifique o arquivo e tente novamente.",
      };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("meeting-photos").getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (err) {
    logActionError("uploadMeetingPhoto", err);
    return {
      url: null,
      error: toActionError(err, "Não foi possível enviar a foto. Tente novamente em instantes."),
    };
  }
}
