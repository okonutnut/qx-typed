class AppLayout extends qx.ui.container.Composite {
  constructor(
    content: qx.ui.core.Widget,
    sidebarItems: SidebarItem[],
    pageMap: Map<string, qx.ui.core.Widget>,
    pageTitle?: string,
  ) {
    super();
    this.setLayout(new qx.ui.layout.HBox());
    this.setBackgroundColor("#f6f7f9");

    const sidebar = new Sidebar(sidebarItems);

    const contentContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(),
    );

    const navbar = new Navbar(pageTitle);
    contentContainer.add(navbar);

    const mainContentContainer = new qx.ui.container.Composite(
      new qx.ui.layout.Grow(),
    );
    mainContentContainer.setPadding(10);
    mainContentContainer.add(content, { edge: 0 });

    sidebar.addListener("select", (ev: qx.event.type.Data) => {
      const label = ev.getData() as string;
      const nextPage = pageMap.get(label);
      if (!nextPage) return;

      mainContentContainer.removeAll();
      mainContentContainer.add(nextPage, { edge: 0 });

      navbar.setPageTitle(label);
    });

    contentContainer.add(mainContentContainer, { flex: 1, edge: 0 });

    this.add(sidebar);
    this.add(contentContainer, { flex: 1 });
  }
}

function createSidebarItems() {
  return [
    {
      label: "Dashboard",
      icon: new InlineSvgIcon("home", 16),
    },
    { label: "Profile", icon: new InlineSvgIcon("user", 16) },
    { label: "Settings", icon: new InlineSvgIcon("banana", 16) },
  ] as SidebarItem[];
}

function manipulateSidebarItems(
  items: SidebarItem[],
  pageMap: Map<string, qx.ui.core.Widget>,
): SidebarItem[] {
  return items
    .map((item) => ({
      ...item,
      label: item.label.trim(),
    }))
    .filter((item) => pageMap.has(item.label)) // keep only items that have a page
    .sort((a, b) => a.label.localeCompare(b.label)); // optional ordering
}

function qooxdooMain(app: qx.application.Standalone) {
  const root = <qx.ui.container.Composite>app.getRoot();

  const pageMap = new Map<string, qx.ui.core.Widget>([
    ["Dashboard", new MainPage()],
    ["Profile", new FormPage()],
  ]);

  const sidebarItems = manipulateSidebarItems(createSidebarItems(), pageMap);
  const firstLabel = sidebarItems[0]?.label ?? "Dashboard";
  const initialPage = pageMap.get(firstLabel) ?? new MainPage();

  const layout = new AppLayout(initialPage, sidebarItems, pageMap, firstLabel);

  root.add(layout, { edge: 0 });
}

qx.registry.registerMainMethod(qooxdooMain);
