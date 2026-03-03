class Navbar extends qx.ui.container.Composite {
  static events = {
    toggleSidebar: "qx.event.type.Event",
    action: "qx.event.type.Data",
  };

  private __titleLabel: qx.ui.basic.Label;
  private __actionsPopup: qx.ui.popup.Popup;
  private __isActionsOpen = false;

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

    // SIDEBAR TRIGGER
    const collapseSidebarBtn = new BsButton(
      "",
      new InlineSvgIcon("panel-left-close", 8),
      "btn-sm-icon-ghost p-1",
      "ghost",
    );
    collapseSidebarBtn.setWidth(50);
    collapseSidebarBtn.onClick(() => {
      this.fireEvent("toggleSidebar");
      if (onToggleSidebar) onToggleSidebar();
    });
    this.add(collapseSidebarBtn);

    // PAGE TITLE
    this.__titleLabel = new qx.ui.basic.Label(pageTitle ?? "Dashboard");
    this.__titleLabel.setTextColor(AppColors.foreground());
    this.__titleLabel.setFont(
      // @ts-ignore
      new qx.bom.Font(18).set({ bold: true }),
    );
    this.__titleLabel.setAlignY("middle");
    this.add(this.__titleLabel);

    const spacer = new qx.ui.core.Spacer();
    this.add(spacer, { flex: 1 });

    // OTHER ACTIONS
    const otherActionsBtn = new BsButton(
      "",
      new InlineSvgIcon("ellipsis", 8),
      "btn-sm-icon-ghost p-1",
      "ghost",
    );
    otherActionsBtn.setWidth(50);
    otherActionsBtn.onClick(() => this.__toggleActionsPopup(otherActionsBtn));
    this.add(otherActionsBtn);

    this.__actionsPopup = new qx.ui.popup.Popup(new qx.ui.layout.Grow());
    this.__actionsPopup.setAutoHide(true);
    this.__actionsPopup.setDomMove(true);
    this.__actionsPopup.setZIndex(100000);
    this.__actionsPopup.setAllowGrowX(false);
    this.__actionsPopup.setAllowGrowY(true);
    this.__actionsPopup.setPadding(0);
    this.__actionsPopup.setBackgroundColor("transparent");
    this.__actionsPopup.setDecorator(
      new qx.ui.decoration.Decorator().set({
        width: 1,
        style: "solid",
        color: AppColors.border(),
        radius: 10,
        shadowVerticalLength: 2,
        shadowBlurRadius: 10,
        shadowColor: AppColors.overlay(0.1),
      }),
    );

    const actionsMenu = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
    actionsMenu.set({
      minWidth: 160,
      paddingTop: 6,
      paddingRight: 6,
      paddingBottom: 6,
      paddingLeft: 6,
      backgroundColor: AppColors.card(),
      textColor: AppColors.foreground(),
    });

    actionsMenu.add(
      this.__createActionsMenuButton(
        "Support",
        new InlineSvgIcon("help-circle", 16),
        "support",
      ),
    );
    actionsMenu.add(
      this.__createActionsMenuButton(
        "About",
        new InlineSvgIcon("info", 16),
        "about",
      ),
    );
    this.__actionsPopup.add(actionsMenu);

    this.__actionsPopup.addListener("disappear", () => {
      this.__isActionsOpen = false;
    });

    this.addListenerOnce("disappear", () => {
      this.__actionsPopup.hide();
    });
  }

  private __createActionsMenuButton(
    label: string,
    icon: InlineSvgIcon,
    action: string,
  ): BsButton {
    const button = new BsButton(label, icon, "btn-sm-outline", "outline", true);
    button.setAllowGrowX(true);
    button.setHeight(40);
    button.onClick(() => {
      this.fireDataEvent("action", action);
      this.__closeActionsPopup();
    });
    return button;
  }

  private __toggleActionsPopup(target: qx.ui.core.Widget): void {
    if (this.__isActionsOpen) {
      this.__closeActionsPopup();
      return;
    }

    this.__actionsPopup.show();
    this.__isActionsOpen = true;
    this.__actionsPopup.placeToWidget(target, true);
    qx.event.Timer.once(
      () => this.__actionsPopup.placeToWidget(target, true),
      this,
      0,
    );
  }

  private __closeActionsPopup(): void {
    if (!this.__isActionsOpen) return;
    this.__isActionsOpen = false;
    this.__actionsPopup.hide();
  }

  public setPageTitle(value: string): void {
    this.__titleLabel.setValue(value);
  }

  public setTitle(value: string): void {
    this.setPageTitle(value);
  }
}
