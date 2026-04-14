import { requireRole } from "@/lib/auth-context";
import { listUsers, getSupervisorOptions } from "@/actions/users";
import { UsersPageClient } from "./components/users-page-client";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  await requireRole(["ADMIN"]);

  const [usersResult, supervisorsResult] = await Promise.all([
    listUsers({ status: "all" }),
    getSupervisorOptions(),
  ]);

  return (
    <UsersPageClient
      initialUsers={usersResult.data ?? []}
      loadError={usersResult.error}
      supervisors={supervisorsResult.data ?? []}
    />
  );
}
