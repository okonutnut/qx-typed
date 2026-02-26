class MainPage extends qx.ui.container.Composite {
  constructor() {
    super(new qx.ui.layout.Grow());

    const helloLabel = new qx.ui.basic.Label("Hello, World!");
    this.add(helloLabel, { edge: 10 });
  }
}
