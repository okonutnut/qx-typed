class AppLayout extends qx.ui.container.Composite {
  constructor(
    content: qx.ui.core.Widget,
    sidebarItems: { label: string; icon?: qx.ui.core.Widget }[],
  ) {
    super();
    this.setLayout(new qx.ui.layout.HBox());
    this.setBackgroundColor("#f6f7f9");

    // Sidebar
    const sidebar = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    sidebar.setWidth(200);
    sidebar.setPadding(10);
    sidebar.setBackgroundColor("#fcfcfc");
    sidebar.setDecorator(
      new qx.ui.decoration.Decorator().set({
        widthRight: 1,
        styleRight: "solid",
        colorRight: "#e5e7eb",
      }),
    );

    sidebarItems.forEach((item) => {
      const rowLayout = new qx.ui.layout.HBox(8);
      rowLayout.setAlignY("middle");
      const row = new qx.ui.container.Composite(rowLayout);

      if (item.icon) row.add(item.icon);

      const button = new qx.ui.form.Button(item.label);
      row.add(button, { flex: 1 });

      sidebar.add(row);
    });

    // Right side: Navbar + Main content
    const contentContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(),
    );

    const navbar = new Navbar();
    contentContainer.add(navbar, { edge: 0 }); // top, natural height

    const mainContentContainer = new qx.ui.container.Composite(
      new qx.ui.layout.Grow(),
    );
    mainContentContainer.add(content); // ✅ put page here
    contentContainer.add(mainContentContainer, { flex: 1 }); // ✅ fill remaining height

    // Add to HBox
    this.add(sidebar);
    this.add(contentContainer, { flex: 1 }); // ✅ fill remaining width
  }
}

function createSidebarItems() {
  return [
    { label: "Home", icon: new InlineSvgIcon("home", 16) },
    { label: "Profile", icon: new InlineSvgIcon("baby", 16) },
    { label: "Settings", icon: new InlineSvgIcon("banana", 16) },
  ];
}

function qooxdooMain(app: qx.application.Standalone) {
  const root = <qx.ui.container.Composite>app.getRoot();

  const mainPage = new MainPage();
  const layout = new AppLayout(mainPage, createSidebarItems());

  root.add(layout, { edge: 0 });
}

qx.registry.registerMainMethod(qooxdooMain);
