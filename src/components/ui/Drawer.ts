class BsDrawer extends qx.ui.container.Composite {
  private __open = false;
  private __backdrop: qx.ui.core.Widget;
  private __sheet: qx.ui.container.Composite;
  private __drawerPanel: qx.ui.core.Widget;
  private __dragHandle: qx.ui.core.Widget;
  private __bodyScroll: qx.ui.container.Scroll;
  private __isAnimating = false;
  private __animationToken = 0;
  private __dragStartY: number | null = null;
  private __dragOffset = 0;

  constructor(content: qx.ui.core.Widget, drawerPanel: qx.ui.core.Widget) {
    super(new qx.ui.layout.Canvas());

    this.add(content, { left: 0, right: 0, top: 0, bottom: 0 });

    this.__backdrop = new qx.ui.core.Widget();
    this.__backdrop.set({
      backgroundColor: AppColors.overlay(0.45),
      zIndex: 20,
    });
    this.__backdrop.addListener("tap", () => this.close());
    this.add(this.__backdrop, { left: 0, right: 0, top: 0, bottom: 0 });

    this.__drawerPanel = drawerPanel;
    (this.__drawerPanel as any).resetWidth?.();
    this.__drawerPanel.setAllowGrowX(true);
    this.__drawerPanel.setAllowGrowY(true);

    const handleRow = new qx.ui.container.Composite(new qx.ui.layout.HBox());
    handleRow.set({
      alignY: "middle",
      paddingTop: 10,
      paddingBottom: 8,
    });
    const spacerLeft = new qx.ui.core.Spacer();
    const spacerRight = new qx.ui.core.Spacer();
    this.__dragHandle = new qx.ui.core.Widget();
    this.__dragHandle.set({
      width: 56,
      height: 6,
      backgroundColor: AppColors.primary(),
      cursor: "ns-resize",
    });
    this.__dragHandle.setDecorator(
      new qx.ui.decoration.Decorator().set({
        radius: 999,
      }),
    );
    handleRow.add(spacerLeft, { flex: 1 });
    handleRow.add(this.__dragHandle);
    handleRow.add(spacerRight, { flex: 1 });

    this.__bodyScroll = new qx.ui.container.Scroll();
    this.__bodyScroll.add(this.__drawerPanel);

    const sheetHeight = Math.floor(qx.bom.Viewport.getHeight() * 0.5);

    this.__sheet = new qx.ui.container.Composite(new qx.ui.layout.VBox());
    this.__sheet.set({
      zIndex: 30,
      minHeight: sheetHeight,
      maxHeight: sheetHeight,
    });
    this.__sheet.add(handleRow);
    this.__sheet.add(this.__bodyScroll, { flex: 1 });
    this.add(this.__sheet, { left: 0, right: 0, bottom: 0 });

    this.__sheet.setDecorator(
      new qx.ui.decoration.Decorator().set({
        radiusTopLeft: 16,
        radiusTopRight: 16,
        shadowBlurRadius: 45,
        shadowVerticalLength: -20,
        shadowColor: "rgba(0,0,0,0.22)",
      }),
    );
    this.__sheet.setBackgroundColor(AppColors.sidebar());

    // Start hidden off-screen
    this.__hideImmediate();

    this.__wireDragToClose();
  }

  private __hideImmediate(): void {
    this.__setDomStyles(this.__backdrop, {
      opacity: "0",
      visibility: "hidden",
      pointerEvents: "none",
      transition: "none",
    });
    this.__setDomStyles(this.__sheet, {
      transform: "translateY(110%)",
      visibility: "hidden",
      pointerEvents: "none",
      transition: "none",
      willChange: "transform",
    });
  }

  public open(): void {
    if (this.__open) return;
    this.__open = true;
    this.__isAnimating = true;
    const token = ++this.__animationToken;

    // Make visible at off-screen position, no transition yet
    this.__setDomStyles(this.__backdrop, {
      visibility: "visible",
      pointerEvents: "auto",
      opacity: "0",
      transition: "none",
    });
    this.__setDomStyles(this.__sheet, {
      visibility: "visible",
      pointerEvents: "auto",
      transform: "translateY(110%)",
      transition: "none",
    });

    // Force reflow so the browser registers the initial position
    this.__forceReflow();

    // Now enable transitions and animate to final position
    this.__setDomStyles(this.__backdrop, {
      opacity: "1",
      transition: "opacity 200ms ease",
    });
    this.__setDomStyles(this.__sheet, {
      transform: "translateY(0px)",
      transition: "transform 260ms cubic-bezier(0.16, 1, 0.3, 1)",
    });

    qx.event.Timer.once(
      () => {
        if (token !== this.__animationToken) return;
        this.__isAnimating = false;
      },
      this,
      280,
    );
  }

  public close(): void {
    if (!this.__open) return;
    this.__open = false;
    this.__isAnimating = true;
    const token = ++this.__animationToken;

    this.__setDomStyles(this.__backdrop, {
      opacity: "0",
      transition: "opacity 180ms ease",
    });
    this.__setDomStyles(this.__sheet, {
      transform: "translateY(110%)",
      transition: "transform 220ms cubic-bezier(0.4, 0, 1, 1)",
    });

    qx.event.Timer.once(
      () => {
        if (token !== this.__animationToken) return;
        this.__setDomStyles(this.__backdrop, {
          visibility: "hidden",
          pointerEvents: "none",
        });
        this.__setDomStyles(this.__sheet, {
          visibility: "hidden",
          pointerEvents: "none",
        });
        this.__isAnimating = false;
        this.__dragStartY = null;
        this.__dragOffset = 0;
      },
      this,
      240,
    );
  }

  public toggle(): void {
    this.__open ? this.close() : this.open();
  }

  public isOpen(): boolean {
    return this.__open;
  }

  private __forceReflow(): void {
    const el = this.__sheet
      .getContentElement()
      .getDomElement() as HTMLElement | null;
    if (el) el.offsetHeight;
  }

  private __wireDragToClose(): void {
    this.__dragHandle.addListener(
      "pointerdown",
      (ev: qx.event.type.Pointer) => {
        if (!this.__open || this.__isAnimating) return;
        this.__dragStartY = ev.getDocumentTop();
        this.__dragOffset = 0;
        this.__setDomStyles(this.__sheet, {
          transition: "none",
        });
        ev.stopPropagation();
      },
    );

    this.addListener("pointermove", (ev: qx.event.type.Pointer) => {
      if (this.__dragStartY === null || !this.__open || this.__isAnimating)
        return;
      const y = ev.getDocumentTop();
      const delta = Math.max(0, y - this.__dragStartY);
      this.__dragOffset = delta;

      this.__setDomStyles(this.__sheet, {
        transform: `translateY(${delta}px)`,
      });

      const fadeProgress = Math.min(
        1,
        delta / Math.max(1, this.__getPanelHeight() * 0.8),
      );
      this.__setDomStyles(this.__backdrop, {
        opacity: `${1 - fadeProgress}`,
      });
    });

    const finishDrag = (ev?: qx.event.type.Pointer) => {
      if (this.__dragStartY === null) return;
      const shouldClose =
        this.__dragOffset > Math.max(80, this.__getPanelHeight() * 0.22);

      this.__dragStartY = null;
      if (ev) ev.stopPropagation();

      if (shouldClose) {
        this.close();
        return;
      }

      this.__setDomStyles(this.__sheet, {
        transition: "transform 180ms cubic-bezier(0.22, 1, 0.36, 1)",
        transform: "translateY(0px)",
      });
      this.__setDomStyles(this.__backdrop, {
        transition: "opacity 180ms ease",
        opacity: "1",
      });
      this.__dragOffset = 0;
    };

    this.addListener("pointerup", finishDrag);
    this.addListener("pointercancel", finishDrag);
  }

  private __getPanelHeight(): number {
    const element = this.__sheet
      .getContentElement()
      .getDomElement() as HTMLElement | null;
    return element?.offsetHeight ?? qx.bom.Viewport.getHeight() * 0.5;
  }

  private __setDomStyles(
    widget: qx.ui.core.Widget,
    styles: Record<string, string>,
  ): void {
    const contentElement = widget.getContentElement() as any;
    if (!contentElement || !contentElement.setStyle) return;
    for (const key in styles) {
      if (!Object.prototype.hasOwnProperty.call(styles, key)) continue;
      contentElement.setStyle(key, styles[key]);
    }
  }
}
