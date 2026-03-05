type PageDefinition = {
  label: string;
  iconName: string;
  factory?: () => qx.ui.core.Widget;
};

type SidebarDefinition = {
  label: string;
  iconName?: string;
  children?: SidebarDefinition[];
};

const PAGE_DEFINITIONS: PageDefinition[] = [
  {
    label: "Form",
    iconName: "notebook-pen",
    factory: () => new FormPage(),
  },
  {
    label: "Buttons",
    iconName: "banana",
    factory: () => new ButtonsPage(),
  },
  {
    label: "Controls",
    iconName: "sliders-horizontal",
    factory: () => new ControlPage(),
  },
  {
    label: "Table",
    iconName: "table",
    factory: () => new TablePage(),
  },
  {
    label: "Windows",
    iconName: "app-window",
    factory: () => new WindowsPage(),
  },
];

const SIDEBAR_DEFINITIONS: SidebarDefinition[] = [
  {
    label: "Workspace",
    iconName: "folder-tree",
    children: [
      {
        label: "Form",
        iconName: "notebook-pen",
      },
      {
        label: "Buttons",
        iconName: "banana",
      },
      {
        label: "Controls",
        iconName: "sliders-horizontal",
      },
    ],
  },
  {
    label: "Data",
    iconName: "table",
    children: [
      {
        label: "Table",
        iconName: "table",
      },
    ],
  },
  {
    label: "Windows",
    iconName: "app-window",
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
