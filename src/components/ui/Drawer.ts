class BsDrawer extends qx.ui.container.Composite {
  private __open = false;
  private __backdrop: qx.ui.core.Widget;
  private __drawerPanel: qx.ui.core.Widget;

  constructor(
    content: qx.ui.core.Widget,
    drawerPanel: qx.ui.core.Widget,
    drawerWidth = 230,
  ) {
    super(new qx.ui.layout.Canvas());

    this.add(content, { left: 0, right: 0, top: 0, bottom: 0 });

    this.__backdrop = new qx.ui.core.Widget();
    this.__backdrop.set({
      backgroundColor: "rgba(15, 23, 42, 0.35)",
      zIndex: 20,
    });
    this.__backdrop.addListener("tap", () => this.close());
    this.__backdrop.exclude();
    this.add(this.__backdrop, { left: 0, right: 0, top: 0, bottom: 0 });

    this.__drawerPanel = drawerPanel;
    this.__drawerPanel.set({
      width: drawerWidth,
      zIndex: 30,
    });
    this.__drawerPanel.exclude();
    this.add(this.__drawerPanel, { left: 0, top: 0, bottom: 0 });
  }

  public open(): void {
    if (this.__open) return;
    this.__open = true;
    this.__backdrop.show();
    this.__drawerPanel.show();
  }

  public close(): void {
    if (!this.__open) return;
    this.__open = false;
    this.__backdrop.exclude();
    this.__drawerPanel.exclude();
  }

  public toggle(): void {
    this.__open ? this.close() : this.open();
  }

  public isOpen(): boolean {
    return this.__open;
  }
}
