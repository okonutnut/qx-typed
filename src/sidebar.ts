class Sidebar extends qx.ui.container.Composite {
  static events = {
    select: "qx.event.type.Data",
  };

  private __collapsed = false;
  private __header: qx.ui.basic.Label;
  private __footer: qx.ui.basic.Label;
  private __buttons: BsSidebarButton[] = [];

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

    const schoolLogo = new qx.ui.basic.Image("resource/app/ac_logo.png");
    schoolLogo.set({
      scale: true,
      width: 42,
      height: 42,
      minWidth: 42,
      minHeight: 42,
    });
    this.add(schoolLogo);

    const header = new qx.ui.basic.Label("Aldersgate College Inc.");
    this.__header = header;
    header.setFont(
      //@ts-ignore
      new qx.bom.Font(12, ["Inter", "sans-serif"]).set({ bold: true }),
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

      this.__buttons.push(button);
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

    const footer = new qx.ui.basic.Label("SIAS Online 10.x");
    this.__footer = footer;
    //@ts-ignore
    footer.setFont(new qx.bom.Font(12, ["Inter", "sans-serif"]));
    footer.setTextAlign("center");
    footer.setHeight(30);
    footer.setPadding(5);
    this.add(footer);
  }

  public setCollapsed(collapsed: boolean): void {
    this.__collapsed = collapsed;

    if (collapsed) {
      this.setWidth(72);
      this.setPadding(10);
      this.__header.exclude();
      this.__footer.exclude();
      this.__buttons.forEach((btn) => {
        btn.setCollapsed(true);
        btn.setWidth(56);
      });
    } else {
      this.setWidth(230);
      this.setPadding(10);
      this.__header.show();
      this.__footer.show();
      this.__buttons.forEach((btn) => {
        btn.setCollapsed(false);
        btn.setWidth(230);
      });
    }
  }

  public isCollapsed(): boolean {
    return this.__collapsed;
  }
}
