type PageDefinition = {
  label: string;
  iconName: string;
  element?: () => qx.ui.core.Widget;
  allowedRoles?: UserRole[];
};

type SidebarDefinition = {
  label: string;
  iconName?: string;
  disabled?: boolean;
  hidden?: boolean;
  children?: SidebarDefinition[];
};

const PAGE_DEFINITIONS: PageDefinition[] = [
  {
    label: "Subjects",
    iconName: "book-open",
    element: () => new SubjectsPage(),
    allowedRoles: ["admin", "faculty"],
  },
  {
    label: "Faculty",
    iconName: "users",
    element: () => new FacultyPage(),
    allowedRoles: ["admin", "faculty"],
  },
  {
    label: "Rooms",
    iconName: "door-open",
    element: () => new RoomsPage(),
    allowedRoles: ["admin", "faculty"],
  },
  {
    label: "Semesters",
    iconName: "calendar",
    element: () => new SemestersPage(),
    allowedRoles: ["admin"],
  },
  {
    label: "Class Schedules",
    iconName: "clock",
    element: () => new SchedulesPage(),
    allowedRoles: ["admin", "faculty"],
  },
  {
    label: "Level 1",
    iconName: "circle",
    element: () => new MockupPage("Level 1"),
    allowedRoles: ["admin", "faculty"],
  },
  {
    label: "Level 2",
    iconName: "circle",
    element: () => new MockupPage("Level 2"),
    allowedRoles: ["admin", "faculty"],
  },
  {
    label: "Level 3",
    iconName: "circle",
    element: () => new MockupPage("Level 3"),
    allowedRoles: ["admin", "faculty"],
  },
  {
    label: "Level 4",
    iconName: "circle",
    element: () => new MockupPage("Level 4"),
    allowedRoles: ["admin", "faculty"],
  },
  {
    label: "Level 5",
    iconName: "circle",
    element: () => new MockupPage("Level 5"),
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
  {
    label: "Nested Demo",
    iconName: "folder",
    children: [
      {
        label: "Level 1",
        iconName: "circle",
      },
      {
        label: "Level 2",
        iconName: "folder",
        children: [
          {
            label: "Level 3",
            iconName: "circle",
          },
          {
            label: "Level 4",
            iconName: "folder",
            children: [
              {
                label: "Level 5",
                iconName: "circle",
              },
            ],
          },
        ],
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
      disabled: definition.disabled,
      hidden: definition.hidden,
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
      if (item.hidden) return;

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
