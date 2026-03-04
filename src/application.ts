function qooxdooMain(app: qx.application.Standalone) {
  const root = <qx.ui.container.Composite>app.getRoot();
  type AppLayoutMode = "login" | "main";

  const pageMap = new Map<string, () => qx.ui.core.Widget>();
  PAGE_DEFINITIONS.forEach((definition) => {
    if (definition.factory) {
      pageMap.set(definition.label, definition.factory);
    }
  });

  const sidebarItems = manipulateSidebarItems(createSidebarItems(), pageMap);
  const initialPage = new MainPage();
  const initialTitle = "Welcome";

  const createMainLayout = () => {
    const mainLayout = new MainLayout(
      initialPage,
      sidebarItems,
      pageMap,
      initialTitle,
    );
    mainLayout.addListener("logout", () => {
      setAppLayout("login");
    });
    return mainLayout;
  };

  const createLoginLayout = () => {
    const loginLayout = new LoginLayout();
    loginLayout.addListener("login", () => {
      setAppLayout("main");
    });
    return loginLayout;
  };

  const setAppLayout = (mode: AppLayoutMode): void => {
    root.removeAll();
    root.add(mode === "main" ? createMainLayout() : createLoginLayout(), {
      edge: 0,
    });
  };

  const currentLayout: AppLayoutMode = "login";
  setAppLayout(currentLayout);
}

qx.registry.registerMainMethod(qooxdooMain);
