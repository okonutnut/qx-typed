class Sidebar extends qx.ui.container.Composite {
  static events = {
    select: "qx.event.type.Data",
  };

  constructor(sidebarItems: SidebarItem[]) {
    super(new qx.ui.layout.VBox().set({ alignX: "center" }));
    this.setWidth(230);
    this.setPadding(10);
    this.setAlignX("center");
    this.setBackgroundColor("#fcfcfc");
    this.setDecorator(
      new qx.ui.decoration.Decorator().set({
        widthRight: 1,
        styleRight: "solid",
        colorRight: "#e5e7eb",
      }),
    );

    const header = new qx.ui.basic.Label("My App");
    header.setFont(
      //@ts-ignore
      new qx.bom.Font(20, ["Arial", "sans-serif"]).set({ bold: true }),
    );
    header.setTextAlign("center");
    header.setHeight(50);
    header.setPadding(5);
    this.add(header);

    const itemsContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(),
    );
    itemsContainer.setAllowGrowX(true);

    const buttonsByLabel = new Map<string, BsSidebarButton>();

    const setActiveLabel = (activeLabel: string) => {
      buttonsByLabel.forEach((btn, label) => {
        btn.setActive(label === activeLabel);
      });
    };

    sidebarItems.forEach((item) => {
      const row = new qx.ui.container.Composite(
        new qx.ui.layout.HBox().set({ alignY: "middle" }),
      );

      row.set({
        allowGrowX: true,
        height: 35,
      });

      const button = new BsSidebarButton(item.label, item.icon);
      button.setAllowGrowX(true);
      button.setWidth(230);

      buttonsByLabel.set(item.label, button);

      button.onClick(() => {
        setActiveLabel(item.label);
        this.fireDataEvent("select", item.label);
      });

      row.add(button, { flex: 1 });
      itemsContainer.add(row);
    });

    // Set first item active initially
    if (sidebarItems.length > 0) {
      setActiveLabel(sidebarItems[0].label);
    }

    this.add(itemsContainer, { flex: 1 });

    const footer = new qx.ui.basic.Label("© 2024 My Company");
    //@ts-ignore
    footer.setFont(new qx.bom.Font(12, ["Arial", "sans-serif"]));
    footer.setTextAlign("center");
    footer.setHeight(30);
    footer.setPadding(5);
    this.add(footer);
  }
}
