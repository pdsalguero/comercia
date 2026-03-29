import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/");

  return (
    <div className="admin-layout">
      <AdminSidebar admin={{ name: profile.full_name ?? user.email ?? "Admin", avatar: profile.avatar_url }} />
      <main className="admin-main">
        {children}
      </main>
      <style>{`
        .admin-layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #f1f5f9;
        }
        .admin-main {
          flex: 1;
          padding: 20px 16px;
          overflow-y: auto;
        }
        @media (min-width: 768px) {
          .admin-layout { flex-direction: row; }
          .admin-main { padding: 32px; }
        }
      `}</style>
    </div>
  );
}
