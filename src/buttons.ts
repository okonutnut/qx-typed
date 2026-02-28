class ButtonsPage extends qx.ui.container.Composite {
  constructor() {
    super(new qx.ui.layout.VBox(10));

    const container = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
    let isRowLayout = true;

    const primaryBtn = new BsButton("Primary", null, "btn-primary btn-sm");
    const secondaryBtn = new BsButton(
      "Secondary",
      null,
      "btn-secondary btn-sm",
    );
    const accentBtn = new BsButton("Accent", null, "btn-accent btn-sm");
    const infoBtn = new BsButton("Info", null, "btn-info btn-sm");
    const successBtn = new BsButton("Success", null, "btn-success btn-sm");
    const warningBtn = new BsButton("Warning", null, "btn-warning btn-sm");
    const destructiveBtn = new BsButton(
      "Error",
      null,
      "btn-destructive btn-sm",
    );
    const outlineBtn = new BsButton("Outline", null, "btn-outline btn-sm");

    primaryBtn.onClick(() => {
      alert("Hello World!");
    });
    secondaryBtn.onClick(() => {
      alert("Hello World1");
    });
    accentBtn.onClick(() => {
      alert("Hello World2");
    });
    outlineBtn.onClick(() => {
      isRowLayout = !isRowLayout;
      container.setLayout(
        isRowLayout ? new qx.ui.layout.HBox(10) : new qx.ui.layout.VBox(10),
      );
    });

    container.setAllowGrowX(true);

    container.add(primaryBtn, { flex: 1 });
    container.add(secondaryBtn, { flex: 1 });
    container.add(accentBtn, { flex: 1 });
    container.add(infoBtn, { flex: 1 });
    container.add(successBtn, { flex: 1 });
    container.add(warningBtn, { flex: 1 });
    container.add(destructiveBtn, { flex: 1 });
    container.add(outlineBtn, { flex: 1 });

    this.add(container);
  }
}
