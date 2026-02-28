class Navbar extends qx.ui.container.Composite {
  static events = {
    toggleSidebar: "qx.event.type.Event",
  };

  private __titleLabel: qx.ui.basic.Label;

  constructor(pageTitle?: string, onToggleSidebar?: () => void) {
    super(new qx.ui.layout.HBox(2));
    this.setAlignY("middle");
    this.setPadding(8);
    this.setHeight(55);
    this.setBackgroundColor(AppColors.card());
    this.setDecorator(
      new qx.ui.decoration.Decorator().set({
        widthBottom: 1,
        styleBottom: "solid",
        colorBottom: AppColors.border(),
      }),
    );

    const collapseSidebarBtn = new BsButton(
      "",
      new InlineSvgIcon("panel-left-close", 8),
      "btn-sm-icon-ghost p-1",
      "ghost",
    );
    collapseSidebarBtn.setWidth(50);

    // fire event when menu button is clicked
    collapseSidebarBtn.onClick(() => {
      this.fireEvent("toggleSidebar");
      if (onToggleSidebar) onToggleSidebar();
    });
    this.add(collapseSidebarBtn);

    this.__titleLabel = new qx.ui.basic.Label(pageTitle ?? "Dashboard");
    this.__titleLabel.setTextColor(AppColors.foreground());
    this.__titleLabel.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    this.__titleLabel.setAlignY("middle");
    this.setWidth(100);
    this.add(this.__titleLabel);
  }

  public setPageTitle(value: string): void {
    this.__titleLabel.setValue(value);
  }

  public setTitle(value: string): void {
    this.setPageTitle(value);
  }
}
