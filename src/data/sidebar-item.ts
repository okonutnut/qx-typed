interface SidebarItem {
  label: string;
  icon?: InlineSvgIcon;
  disabled?: boolean;
  hidden?: boolean;
  children?: SidebarItem[];
}
