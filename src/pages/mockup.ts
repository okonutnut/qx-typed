class MockupPage extends qx.ui.container.Composite {
  constructor(private __label: string) {
    super(new qx.ui.layout.VBox(10));
    const label = new qx.ui.basic.Label(__label);
    label.setFont(
      // @ts-ignore
      new qx.bom.Font(24).set({ bold: true }),
    );
    this.add(label);
  }
}
