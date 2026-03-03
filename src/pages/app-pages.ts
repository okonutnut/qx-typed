type PageDefinition = {
  label: string;
  iconName: string;
  factory?: () => qx.ui.core.Widget;
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

function createSidebarItems(definitions: PageDefinition[] = PAGE_DEFINITIONS) {
  return definitions.map((definition) => ({
    label: definition.label,
    icon: new InlineSvgIcon(definition.iconName, 16),
  })) as SidebarItem[];
}

function manipulateSidebarItems(
  items: SidebarItem[],
  pageMap: Map<string, () => qx.ui.core.Widget>,
): SidebarItem[] {
  const normalizedItems: SidebarItem[] = [];

  items.forEach((item) => {
    const normalizedLabel = item.label.trim();
    if (!pageMap.has(normalizedLabel)) return;

    normalizedItems.push({
      ...item,
      label: normalizedLabel,
    });
  });

  return normalizedItems;
}
