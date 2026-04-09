function qooxdooMain(app: qx.application.Standalone) {
  const root = <qx.ui.container.Composite>app.getRoot();
  type AppLayoutMode = "login" | "main";

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.error("ServiceWorker registration failed:", err);
    });
  }

  const createMainLayout = () => {
    // Filter pages by the logged-in user's role
    const role = globalThis.userRole;
    const pageMap = new Map<string, () => qx.ui.core.Widget>();
    PAGE_DEFINITIONS.forEach((definition) => {
      if (!definition.element) return;
      if (definition.allowedRoles && definition.allowedRoles.indexOf(role) === -1)
        return;
      pageMap.set(definition.label, definition.element);
    });

    const sidebarItems = manipulateSidebarItems(createSidebarItems(), pageMap);
    const initialPage = new MainPage();
    const initialTitle = "Welcome";

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
