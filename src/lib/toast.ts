import { toast } from "sonner";

type ResultWithData<T> =
  | { data: T; error: null }
  | { data: null; error: string };

type ResultWithUrl =
  | { url: string; error: null }
  | { url: null; error: string };

export function toastActionResult<T>(
  result: ResultWithData<T>,
  successMessage: string,
): ResultWithData<T> {
  if (result.error) {
    toast.error(result.error);
  } else {
    toast.success(successMessage);
  }
  return result;
}

export function toastUploadResult(
  result: ResultWithUrl,
  successMessage: string,
): ResultWithUrl {
  if (result.error) {
    toast.error(result.error);
  } else {
    toast.success(successMessage);
  }
  return result;
}

export { toast };
