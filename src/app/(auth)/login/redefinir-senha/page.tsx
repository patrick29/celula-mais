import { ResetPasswordForm } from "./reset-password-form";

type ResetPasswordPageProps = {
  searchParams: Promise<{ first?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  return <ResetPasswordForm first={params.first === "true"} />;
}
