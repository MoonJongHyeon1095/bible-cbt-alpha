import type { ComponentType } from "react";

export type NavItem = {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

export type NavSharedProps = {
  currentPage: string;
  navItems: NavItem[];
  user: any;
  onLogout: () => void;
  onShowAuth: () => void;
  onNavigate: (page: string) => boolean | void;
  onHomeRefresh: () => void;
};
