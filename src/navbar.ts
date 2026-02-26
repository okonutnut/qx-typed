class Navbar extends qx.ui.container.Composite {
  constructor() {
    super(new qx.ui.layout.HBox(10));

    this.setPadding(10);
    this.setBackgroundColor("#fcfcfc");
    this.setHeight(50);
    this.setAlignY("middle");

    // ✅ Bottom border
    this.setDecorator(
      new qx.ui.decoration.Decorator().set({
        widthBottom: 1,
        styleBottom: "solid",
        colorBottom: "#e5e7eb",
      }),
    );

    const pageTitle = new qx.ui.basic.Label("My App");
    pageTitle.setTextColor("#0f1729");

    this.add(pageTitle);
  }
}
