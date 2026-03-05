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

    const mobileTopBar = new qx.ui.container.Composite(
      new qx.ui.layout.HBox().set({ alignY: "middle" }),
    );
    mobileTopBar.set({
      paddingTop: 8,
      paddingRight: 6,
      paddingBottom: 8,
      paddingLeft: 10,
      minHeight: 48,
      backgroundColor: AppColors.background(),
    });
    mobileTopBar.setDecorator(
      new qx.ui.decoration.Decorator().set({
        widthBottom: 1,
        styleBottom: "solid",
        colorBottom: AppColors.border(),
      }),
    );

    const mobileSchoolLogo = new qx.ui.basic.Image("resource/app/ac_logo.png");
    mobileSchoolLogo.set({
      scale: true,
      width: 32,
      height: 32,
    });
    mobileTopBar.add(mobileSchoolLogo);
    mobileTopBar.add(new qx.ui.core.Spacer(), { flex: 1 });

    const mobileAccount = new BsSidebarAccount(
      globalThis.username || "User",
      "Student",
      "resource/app/user.png",
      "RB",
      "px-0 py-0",
    );
    mobileAccount.setCollapsed(true);
    mobileAccount.setAllowGrowX(false);
    mobileAccount.setAlignY("middle");
    const mobileAccountSlot = new qx.ui.container.Composite(
      new qx.ui.layout.Grow(),
    );
    mobileAccountSlot.setAllowGrowX(false);
    mobileAccountSlot.setAlignY("middle");
    mobileAccountSlot.setWidth(40);
    mobileAccountSlot.setHeight(40);
    mobileAccountSlot.add(mobileAccount);
    mobileAccount.onAction((action) => {
      if (action === "logout") this.fireEvent("logout");
    });
    mobileTopBar.add(mobileAccountSlot);
    mobileTopBar.exclude();

    const desktopShell = new qx.ui.container.Composite(new qx.ui.layout.HBox());

    const mountDesktop = () => {
      drawer?.close();
      sidebar.setDrawerMode(false);
      mobileTopBar.exclude();

      desktopShell.removeAll();
      desktopShell.add(sidebar);
      desktopShell.add(contentContainer, { flex: 1 });

      this.removeAll();
      this.add(desktopShell);
    };

    const mountMobile = () => {
      sidebar.setCollapsed(false);
      sidebar.setDrawerMode(true);
      mobileTopBar.show();
      drawer = new BsDrawer(contentContainer, sidebar);

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
    contentContainer.add(mobileTopBar);
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

    globalThis.setContent = (contentOrFactory, title) => {
      const nextPage =
        typeof contentOrFactory === "function"
          ? contentOrFactory()
          : contentOrFactory;
      if (nextPage === currentPage) return;

      mainContentContainer.removeAll();
      mainContentContainer.add(nextPage, { edge: 0 });
      currentPage = nextPage;

      if (title) navbar.setPageTitle(title);
      if (isMobileMode) drawer?.close();
    };

    sidebar.addListener("select", (ev: qx.event.type.Data) => {
      const label = ev.getData() as string;
      const nextPage = getPage(label);
      if (!nextPage) return;

      globalThis.setContent(nextPage, label);
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
