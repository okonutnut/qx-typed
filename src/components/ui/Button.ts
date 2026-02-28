class BsButton extends qx.ui.basic.Atom {
  static events = {
    execute: "qx.event.type.Event",
  };

  private __htmlButton: qx.ui.embed.Html;
  private __iconHtml: string;
  private __buttonText: string;
  private __className: string;
  private __buttonEl: HTMLButtonElement | null = null;

  constructor(text?: string, icon?: InlineSvgIcon, className?: string) {
    super();

    this._setLayout(new qx.ui.layout.Grow());
    this.setAllowGrowX(true);
    this.setFocusable(true);

    this.__iconHtml = icon ? icon.getHtml() : "";
    this.__buttonText = text ?? "";
    this.__className = className ?? "";

    this.__htmlButton = new qx.ui.embed.Html("");
    this.__htmlButton.setAllowGrowX(true);

    this.__renderButton();
    this._add(this.__htmlButton);

    this.__htmlButton.addListener("tap", () => this.fireEvent("execute"));

    this.__htmlButton.addListenerOnce("appear", () => {
      this.__bindNativeButton();
    });

    this.addListener("focusin", () => this.__buttonEl?.focus());
    this.addListener("changeTabIndex", () => this.__syncTabIndex());

    if (icon) {
      icon.addListener("changeHtml", () => {
        this.__iconHtml = icon.getHtml();
        this.__renderButton();
      });
    }
  }

  private __bindNativeButton(): void {
    const root = this.__htmlButton.getContentElement().getDomElement();
    this.__buttonEl =
      (root?.querySelector("button") as HTMLButtonElement) ?? null;
    if (!this.__buttonEl) return;

    this.__syncTabIndex();
  }

  private __syncTabIndex(): void {
    if (!this.__buttonEl) return;

    const idx = this.getTabIndex();
    if (idx == null) {
      this.__buttonEl.removeAttribute("tabindex");
    } else {
      this.__buttonEl.setAttribute("tabindex", String(idx));
    }
  }

  private __renderButton(): void {
    const iconPart = this.__iconHtml ? `<span>${this.__iconHtml}</span>` : "";
    const idx = this.getTabIndex();
    const tabIndexAttr = idx == null ? "" : `tabindex="${idx}"`;
    const classes = [
      "btn",
      "w-full",
      "bg-card",
      "text-foreground",
      "border",
      "border-border",
      this.__className,
    ]
      .filter(Boolean)
      .join(" ");

    this.__htmlButton.setHtml(`
      <div class="p-1">
        <button type="button" class="${classes}" ${tabIndexAttr}>
          ${iconPart}
          ${this.__buttonText}
        </button>
      </div>
    `);

    // setHtml replaces DOM; rebind native events
    qx.event.Timer.once(() => this.__bindNativeButton(), this, 0);
  }

  public onClick(handler: () => void): this {
    this.addListener("execute", handler);
    return this;
  }
}
