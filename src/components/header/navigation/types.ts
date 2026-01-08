import type { ComponentType } from "react";
import type { CbtMode } from "./ModePicker";

export type NavItem = {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

export type NavSharedProps = {
  currentPage: string;
  navItems: NavItem[];
  user: any;
  mode: CbtMode;
  onChangeMode: (mode: CbtMode) => void;
  onLogout: () => void;
  onShowAuth: () => void;
  onNavigate: (page: string) => void;
  onHomeRefresh: () => void;
};
