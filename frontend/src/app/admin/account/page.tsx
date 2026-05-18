"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { AccountProfile } from "@/components/account-profile";
import { ADMIN_SHELL_LINKS } from "@/lib/admin-links";

export default function AdminAccountPage() {
  return (
    <DashboardShell
      title="My Account"
      subtitle="Manage your profile and personal details."
      links={ADMIN_SHELL_LINKS}
    >
      <AccountProfile />
    </DashboardShell>
  );
}
