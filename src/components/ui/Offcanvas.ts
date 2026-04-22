class BsOffcanvas extends qx.ui.container.Composite {
  private __open = false;
  private __backdrop: qx.ui.core.Widget;
  private __panel: qx.ui.embed.Html;
  private __content: qx.ui.core.Widget;
  private __isAnimating = false;
  private __animationToken = 0;
  private __placement: "start" | "end" | "top" | "bottom";

  constructor(content: qx.ui.core.Widget, placement: "start" | "end" | "top" | "bottom" = "end") {
    super(new qx.ui.layout.Canvas());

    this.__placement = placement;
    this.__content = content;

    this.__backdrop = new qx.ui.core.Widget();
    this.__backdrop.set({
      backgroundColor: AppColors.overlay(0.45),
      zIndex: 40,
    });
    this.__backdrop.addListener("tap", () => this.close());
    this.add(this.__backdrop, { left: 0, right: 0, top: 0, bottom: 0 });

    this.__panel = new qx.ui.embed.Html("");
    this.__panel.set({
      zIndex: 50,
      backgroundColor: AppColors.card(),
    });
    this.__panel.getContentElement().addClass("offcanvas-panel");

    this.add(this.__panel, this.__getPanelPosition());

    this.__hideImmediate();

    this.__initStyles();
  }

  private __getPanelPosition(): any {
    switch (this.__placement) {
      case "start":
        return { left: 0, top: 0, bottom: 0 };
      case "end":
        return { right: 0, top: 0, bottom: 0 };
      case "top":
        return { left: 0, right: 0, top: 0 };
      case "bottom":
        return { left: 0, right: 0, bottom: 0 };
    }
  }

  private __initStyles(): void {
    const el = this.__panel.getContentElement().getDomElement() as HTMLElement;
    if (!el) {
      this.__panel.addListenerOnce("appear", () => this.__initStyles());
      return;
    }

    const panel = el as HTMLElement;
    panel.classList.add("offcanvas-panel");

    const style = document.createElement("style");
    style.textContent = `
      .offcanvas-panel {
        width: 400px;
        max-width: 100vw;
        height: 100%;
        display: flex;
        flex-direction: column;
        box-shadow: -4px 0 24px rgba(0,0,0,0.15);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .offcanvas-panel.start {
        box-shadow: 4px 0 24px rgba(0,0,0,0.15);
      }
      .offcanvas-panel.top,
      .offcanvas-panel.bottom {
        width: 100%;
        height: 50vh;
        box-shadow: 0 4px 24px rgba(0,0,0,0.15);
      }
      .offcanvas-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.45);
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
        z-index: 40;
      }
      .offcanvas-backdrop.show {
        opacity: 1;
        visibility: visible;
      }
      .offcanvas-hidden .offcanvas-backdrop,
      .offcanvas-hidden .offcanvas-panel {
        transform: translateX(100%);
      }
      .offcanvas-hidden.start .offcanvas-panel {
        transform: translateX(-100%);
      }
      .offcanvas-hidden.top .offcanvas-panel {
        transform: translateY(-100%);
      }
      .offcanvas-hidden.bottom .offcanvas-panel {
        transform: translateY(100%);
      }
      .offcanvas-panel.end.show {
        transform: translateX(0);
      }
    `;
    document.head.appendChild(style);
  }

  private __hideImmediate(): void {
    const el = (this.__panel as any).getContentElement()?.getDomElement();
    const body = document.body;
    if (el) {
      el.classList.remove("show");
      el.classList.add("offcanvas-hidden");
      el.classList.add(this.__placement);
    }
    let backdrop = body.querySelector(".offcanvas-backdrop");
    if (backdrop) {
      backdrop.classList.remove("show");
    }
  }

  public open(): void {
    if (this.__open) return;
    this.__open = true;
    this.__isAnimating = true;
    const token = ++this.__animationToken;

    let backdrop = document.body.querySelector(".offcanvas-backdrop") as HTMLElement;
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "offcanvas-backdrop";
      backdrop.addEventListener("click", () => this.close());
      document.body.appendChild(backdrop);
    }

    const el = this.__panel.getContentElement().getDomElement() as HTMLElement;
    if (el) {
      el.classList.remove("offcanvas-hidden");
      el.classList.add(this.__placement);
      el.classList.add("show");
    }

    requestAnimationFrame(() => {
      backdrop?.classList.add("show");
    });

    qx.event.Timer.once(
      () => {
        if (token !== this.__animationToken) return;
        this.__isAnimating = false;
      },
      this,
      300,
    );
  }

  public close(): void {
    if (!this.__open) return;
    this.__open = false;
    this.__isAnimating = true;
    const token = ++this.__animationToken;

    const el = this.__panel.getContentElement().getDomElement() as HTMLElement;
    const backdrop = document.body.querySelector(".offcanvas-backdrop") as HTMLElement;

    if (el) {
      el.classList.remove("show");
      el.classList.add("offcanvas-hidden");
    }
    if (backdrop) {
      backdrop.classList.remove("show");
    }

    qx.event.Timer.once(
      () => {
        if (token !== this.__animationToken) return;
        this.__isAnimating = false;
      },
      this,
      300,
    );
  }

  public toggle(): void {
    this.__open ? this.close() : this.open();
  }

  public isOpen(): boolean {
    return this.__open;
  }
}