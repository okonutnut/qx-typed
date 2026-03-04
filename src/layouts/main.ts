class MainLayout extends qx.ui.container.Composite {
  static events = {
    logout: "qx.event.type.Event",
  };

  constructor(
    content: qx.ui.core.Widget,
    sidebarItems: SidebarItem[],
    pageMap: Map<string, () => qx.ui.core.Widget>,
    pageTitle?: string,
  ) {
    super();
    this.setLayout(new qx.ui.layout.Grow());
    this.setBackgroundColor(AppColors.background());

    const MOBILE_BREAKPOINT = 768;
    let isSidebarCollapsed = false;
    let isMobileMode = qx.bom.Viewport.getWidth() < MOBILE_BREAKPOINT;
    let drawer: BsDrawer | null = null;

    const sidebar = new Sidebar(sidebarItems, pageTitle);

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
    const mainContentScroll = new qx.ui.container.Scroll();
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

    sidebar.addListener("action", (ev: qx.event.type.Data) => {
      if ((ev.getData() as string) === "logout") {
        this.fireEvent("logout");
      }
    });

    mainContentScroll.add(mainContentContainer);
    contentContainer.add(mainContentScroll, { flex: 1, edge: 0 });

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
