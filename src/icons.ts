class IconsPage extends MyPage {
  constructor() {
    super("Icons");

    const homeIcon = new InlineSvgIcon("home", 128).set({
      textColor: "#f0570b",
    });

    const bananaIcon = new InlineSvgIcon("banana", 128).set({
      textColor: "#0bf06a",
    });

    const babyIcon = new InlineSvgIcon("baby", 128).set({
      textColor: "#1a0bf0",
    });

    const hbox = new qx.ui.layout.HBox(10);
    hbox.setAlignY("middle");

    const container = new qx.ui.container.Composite(hbox);
    container.add(homeIcon);
    container.add(bananaIcon);
    container.add(babyIcon);
    this.add(container);
  }
}
