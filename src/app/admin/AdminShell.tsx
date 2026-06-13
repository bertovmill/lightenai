"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  FileText,
  SquarePen,
  type LucideIcon,
} from "lucide-react";
import { Navigation } from "../components/Navigation";
import FeedbackWidget from "../components/FeedbackWidget";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/outreach", label: "Outreach CRM", icon: Users },
  { href: "/admin/generate", label: "Generate Assets", icon: Sparkles },
  { href: "/content?view=admin", label: "Content", icon: FileText },
  { href: "/admin/blog-writer", label: "Blog Writer", icon: SquarePen },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1C1C]">
      <Navigation />

      <SidebarProvider>
        {/* Mobile-only trigger — the in-sidebar trigger lives in the sheet, which
            is hidden when closed, so mobile needs an always-visible toggle. */}
        <SidebarTrigger className="md:hidden fixed top-[18px] left-4 z-[60] text-[#666] hover:bg-transparent hover:text-[#1C1C1C]" />

        {/* collapsible="icon" → collapses to a slim icon rail on desktop,
            slides out as a sheet on mobile. ⌘/Ctrl+B toggles; state persists. */}
        <Sidebar collapsible="icon" className="border-r border-[#E8E6E1]">
          {/* pt-24 clears the fixed top Navigation; trigger stays visible in both
              expanded and collapsed (icon) states. */}
          <SidebarHeader className="pt-24">
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#888] group-data-[collapsible=icon]:hidden">
                Admin
              </span>
              <SidebarTrigger className="text-[#666] hover:bg-[#F5F4F1] hover:text-[#1C1C1C]" />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href, item.exact);
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.label}
                          className="data-[active=true]:bg-[#5F9468]/10 data-[active=true]:text-[#5F9468] data-[active=true]:font-medium text-[#666] hover:bg-[#F5F4F1] hover:text-[#1C1C1C]"
                        >
                          <Link href={item.href}>
                            <Icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarRail />
        </Sidebar>

        <SidebarInset className="bg-[#FAFAF8]">{children}</SidebarInset>
      </SidebarProvider>

      <FeedbackWidget />
    </div>
  );
}
