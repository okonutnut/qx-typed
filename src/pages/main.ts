class MainPage extends qx.ui.container.Composite {
  constructor() {
    super();
    this.setLayout(new qx.ui.layout.VBox(10));
    this.setAlignY("middle");

    const helloLabel = new qx.ui.basic.Label("Hello, World!");
    this.add(helloLabel);

    const checkBtn = new InlineSvgIcon("check", 24);
    const button = new BsButton("Check Button", checkBtn, "btn-primary");
    this.add(button);
  }
}
