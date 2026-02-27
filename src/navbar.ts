class Navbar extends qx.ui.container.Composite {
  private __titleLabel: qx.ui.basic.Label;

  constructor(pageTitle?: string) {
    super(new qx.ui.layout.HBox(2));
    this.setAlignY("middle");
    this.setPadding(10);
    this.setHeight(55);
    this.setBackgroundColor("#fcfcfc");
    this.setDecorator(
      new qx.ui.decoration.Decorator().set({
        widthBottom: 1,
        styleBottom: "solid",
        colorBottom: "#e5e7eb",
      }),
    );

    const collapseSidebarBtn = new BsButton(
      "",
      new InlineSvgIcon("menu", 16),
      "btn-sm btn-ghost",
    );
    collapseSidebarBtn.setWidth(50);
    this.add(collapseSidebarBtn);

    this.__titleLabel = new qx.ui.basic.Label(pageTitle ?? "Dashboard");
    this.__titleLabel.setTextColor("#0f1729");
    this.__titleLabel.setFont("bold");
    this.__titleLabel.setAlignY("middle");
    this.add(this.__titleLabel);
  }

  public setPageTitle(value: string): void {
    this.__titleLabel.setValue(value);
  }

  // Optional alias (keeps compatibility with older calls)
  public setTitle(value: string): void {
    this.setPageTitle(value);
  }
}
