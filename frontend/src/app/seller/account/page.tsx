"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { AccountProfile } from "@/components/account-profile";

const links = [
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/products", label: "Inventory" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/products/new", label: "Add Product" },
  { href: "/seller/account", label: "Account" },
];

export default function SellerAccountPage() {
  return (
    <DashboardShell
      title="My Account"
      subtitle="Manage your profile and personal details."
      links={links}
    >
      <AccountProfile />
    </DashboardShell>
  );
}
