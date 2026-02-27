class AppLayout extends qx.ui.container.Composite {
  constructor(
    content: qx.ui.core.Widget,
    sidebarItems: SidebarItem[],
    pageMap: Map<string, () => qx.ui.core.Widget>,
    pageTitle?: string,
  ) {
    super();
    this.setLayout(new qx.ui.layout.Grow());
    this.setBackgroundColor("#f6f7f9");

    const MOBILE_BREAKPOINT = 768;
    let isSidebarCollapsed = false;
    let isMobileMode = qx.bom.Viewport.getWidth() < MOBILE_BREAKPOINT;
    let drawer: BsDrawer | null = null;

    const sidebar = new Sidebar(sidebarItems);

    const contentContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(),
    );

    const desktopShell = new qx.ui.container.Composite(new qx.ui.layout.HBox());

    const mountDesktop = () => {
      drawer?.close();

      desktopShell.removeAll();
      desktopShell.add(sidebar);
      desktopShell.add(contentContainer, { flex: 1 });

      this.removeAll();
      this.add(desktopShell);
    };

    const mountMobile = () => {
      sidebar.setCollapsed(false);
      drawer = new BsDrawer(contentContainer, sidebar, 230);

      this.removeAll();
      this.add(drawer);
    };

    const navbar = new Navbar(pageTitle, () => {
      if (isMobileMode) {
        drawer?.toggle();
      } else {
        isSidebarCollapsed = !isSidebarCollapsed;
        sidebar.setCollapsed(isSidebarCollapsed);
      }
    });
    contentContainer.add(navbar);

    const mainContentContainer = new qx.ui.container.Composite(
      new qx.ui.layout.Grow(),
    );
    const pageCache = new Map<string, qx.ui.core.Widget>();
    if (pageTitle) {
      pageCache.set(pageTitle, content);
    }
    let currentPage = content;

    const getPage = (label: string): qx.ui.core.Widget | null => {
      const cached = pageCache.get(label);
      if (cached) return cached;

      const factory = pageMap.get(label);
      if (!factory) return null;

      const page = factory();
      pageCache.set(label, page);
      return page;
    };

    mainContentContainer.setPadding(10);
    mainContentContainer.add(content, { edge: 0 });

    sidebar.addListener("select", (ev: qx.event.type.Data) => {
      const label = ev.getData() as string;
      const nextPage = getPage(label);
      if (!nextPage || nextPage === currentPage) return;

      mainContentContainer.removeAll();
      mainContentContainer.add(nextPage, { edge: 0 });
      currentPage = nextPage;

      navbar.setPageTitle(label);
      if (isMobileMode) drawer?.close();
    });

    contentContainer.add(mainContentContainer, { flex: 1, edge: 0 });

    const syncResponsiveMode = () => {
      const nextIsMobile = qx.bom.Viewport.getWidth() < MOBILE_BREAKPOINT;
      if (nextIsMobile === isMobileMode && this.getChildren().length > 0)
        return;

      isMobileMode = nextIsMobile;
      if (isMobileMode) {
        mountMobile();
      } else {
        mountDesktop();
        sidebar.setCollapsed(isSidebarCollapsed);
      }
    };

    qx.event.Registration.addListener(window, "resize", () => {
      syncResponsiveMode();
    });

    syncResponsiveMode();
  }
}

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

function qooxdooMain(app: qx.application.Standalone) {
  const root = <qx.ui.container.Composite>app.getRoot();

  const pageMap = new Map<string, () => qx.ui.core.Widget>();
  PAGE_DEFINITIONS.forEach((definition) => {
    if (definition.factory) {
      pageMap.set(definition.label, definition.factory);
    }
  });

  const sidebarItems = manipulateSidebarItems(createSidebarItems(), pageMap);
  const firstLabel =
    sidebarItems[0]?.label ?? PAGE_DEFINITIONS.find((d) => !!d.factory)?.label;
  const initialPageFactory = firstLabel ? pageMap.get(firstLabel) : undefined;
  const initialPage = initialPageFactory
    ? initialPageFactory()
    : new MainPage();

  const layout = new AppLayout(initialPage, sidebarItems, pageMap, firstLabel);

  root.add(layout, { edge: 0 });
}

qx.registry.registerMainMethod(qooxdooMain);
