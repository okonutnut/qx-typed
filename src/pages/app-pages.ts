type PageDefinition = {
  label: string;
  iconName: string;
  factory?: () => qx.ui.core.Widget;
  allowedRoles?: UserRole[];
};

type SidebarDefinition = {
  label: string;
  iconName?: string;
  children?: SidebarDefinition[];
};

const PAGE_DEFINITIONS: PageDefinition[] = [
  {
    label: "Subjects",
    iconName: "book-open",
    factory: () => new SubjectsPage(),
    allowedRoles: ["admin", "faculty"],
  },
  {
    label: "Faculty",
    iconName: "users",
    factory: () => new FacultyPage(),
    allowedRoles: ["admin", "faculty"],
  },
  {
    label: "Rooms",
    iconName: "door-open",
    factory: () => new RoomsPage(),
    allowedRoles: ["admin", "faculty"],
  },
  {
    label: "Semesters",
    iconName: "calendar",
    factory: () => new SemestersPage(),
    allowedRoles: ["admin"],
  },
  {
    label: "Class Schedules",
    iconName: "clock",
    factory: () => new SchedulesPage(),
    allowedRoles: ["admin", "faculty"],
  },
];

const SIDEBAR_DEFINITIONS: SidebarDefinition[] = [
  {
    label: "Academic",
    iconName: "graduation-cap",
    children: [
      {
        label: "Subjects",
        iconName: "book-open",
      },
      {
        label: "Faculty",
        iconName: "users",
      },
      {
        label: "Rooms",
        iconName: "door-open",
      },
    ],
  },
  {
    label: "Scheduling",
    iconName: "clock",
    children: [
      {
        label: "Class Schedules",
        iconName: "clock",
      },
    ],
  },
  {
    label: "Settings",
    iconName: "settings",
    children: [
      {
        label: "Semesters",
        iconName: "calendar",
      },
    ],
  },
];

function createSidebarItems(
  definitions: SidebarDefinition[] = SIDEBAR_DEFINITIONS,
) {
  const createItems = (items: SidebarDefinition[]): SidebarItem[] => {
    return items.map((definition) => ({
      label: definition.label,
      icon: definition.iconName
        ? new InlineSvgIcon(definition.iconName, 16)
        : undefined,
      children: definition.children
        ? createItems(definition.children)
        : undefined,
    }));
  };

  return createItems(definitions);
}

function manipulateSidebarItems(
  items: SidebarItem[],
  pageMap: Map<string, () => qx.ui.core.Widget>,
): SidebarItem[] {
  const normalizeItems = (source: SidebarItem[]): SidebarItem[] => {
    const normalizedItems: SidebarItem[] = [];

    source.forEach((item) => {
      const normalizedLabel = item.label.trim();
      const normalizedChildren = item.children
        ? normalizeItems(item.children)
        : undefined;

      const isLeaf = !normalizedChildren || normalizedChildren.length === 0;
      if (isLeaf && !pageMap.has(normalizedLabel)) return;

      normalizedItems.push({
        ...item,
        label: normalizedLabel,
        children:
          normalizedChildren && normalizedChildren.length > 0
            ? normalizedChildren
            : undefined,
      });
    });

    return normalizedItems;
  };

  return normalizeItems(items);
}
