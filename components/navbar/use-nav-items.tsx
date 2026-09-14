"use client";

import { tran } from "@/lib/languages/i18n";
import { LayoutDashboard, Settings, Tickets } from "lucide-react";
import { TabItem } from "./tab-item";

export const useNavItems = () => {
  const navItems: TabItem[] = [
    { id: "dashboard", label: tran("nav.dashboard"), icon: <LayoutDashboard size={20} />, href: "/dashboard" },
    { id: "events", label: tran("nav.events"), icon: <Tickets size={20} />, href: "/events" },
    { id: "settings", label: tran("nav.settings"), icon: <Settings size={20} />, href: "/settings" },
  ];

  return navItems;
};