class ButtonsPage extends qx.ui.container.Composite {
  constructor() {
    super(new qx.ui.layout.VBox(8));

    const container = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
    let isRowLayout = true;

    const button1 = new BsButton(
      "Hello",
      new InlineSvgIcon("message-circle", 16),
      "btn-primary btn-sm w-full",
    );
    const button2 = new BsButton(
      "Dark Theme",
      new InlineSvgIcon("moon", 16),
      "btn-secondary btn-sm w-full",
    );
    const button3 = new BsButton(
      "Light Theme",
      new InlineSvgIcon("sun", 16),
      "btn-accent btn-sm w-full",
    );
    const button4 = new BsButton(
      "Change Layout",
      new InlineSvgIcon("layout-panel-top", 16),
      "btn-outline btn-sm w-full",
    );

    button1.onClick(() => {
      alert("Hello World!");
    });
    button2.onClick(() => {
      alert("Hello World1");
    });
    button3.onClick(() => {
      alert("Hello World2");
    });
    button4.onClick(() => {
      isRowLayout = !isRowLayout;
      container.setLayout(
        isRowLayout ? new qx.ui.layout.HBox(8) : new qx.ui.layout.VBox(8),
      );
    });

    container.setAllowGrowX(true);
    this.setPadding(10);

    container.add(button1);
    container.add(button2);
    container.add(button3);
    container.add(button4);

    this.add(container);
  }
}
