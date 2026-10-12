import { redirect } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace/shell";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <WorkspaceShell user={user}>{children}</WorkspaceShell>;
}
