class BsSidebarButton extends qx.ui.basic.Atom {
  static events = {
    execute: "qx.event.type.Event",
  };

  private __htmlButton: qx.ui.embed.Html;
  private __iconHtml: string;
  private __buttonText: string;
  private __className: string;
  private __trailingHtml = "";
  private __active = false;
  private __collapsed = false;
  private __centered = false;
  private __buttonEl: HTMLButtonElement | null = null;
  private __renderPending = false;

  constructor(text?: string, icon?: InlineSvgIcon, className?: string) {
    super();

    this._setLayout(new qx.ui.layout.Grow());
    this.setAllowGrowX(true);

    this.__htmlButton = new qx.ui.embed.Html("");
    this.__htmlButton.setAllowGrowX(true);

    this.__iconHtml = icon ? icon.getHtml() : "";
    this.__buttonText = text ?? "";
    this.__className = className ?? "";

    this.__renderButton();
    this._add(this.__htmlButton);

    this.__htmlButton.addListener("tap", () => this.fireEvent("execute"));

    this.__htmlButton.addListenerOnce("appear", () => {
      this.__bindNativeButton();
    });

    if (icon) {
      icon.addListener("changeHtml", () => {
        this.__iconHtml = icon.getHtml();
        this.__renderButton();
      });
    }
  }

  private __bindNativeButton(): void {
    const root = this.__htmlButton.getContentElement().getDomElement();
    const btn = root?.querySelector("button") ?? null;
    this.__buttonEl = btn as HTMLButtonElement | null;
    if (!this.__buttonEl) return;
  }

  private __renderButton(): void {
    const iconPart = this.__iconHtml ? `<span>${this.__iconHtml}</span>` : "";
    const textPart = this.__collapsed ? "" : this.__buttonText;
    const trailingPart =
      !this.__collapsed && this.__trailingHtml
        ? `<span style="margin-left:auto;opacity:0.75;line-height:1">${this.__trailingHtml}</span>`
        : "";
    const activeClass = this.__active
      ? "font-semibold btn-sm-primary"
      : "btn-sm-ghost";
    const layoutClass = this.__collapsed
      ? "justify-center"
      : this.__centered
        ? "justify-center relative"
        : "justify-start";
    const classes = [
      "w-full",
      "items-center",
      "gap-2",
      "transition",
      "duration-200",
      "ease-in-out",
      "border-sidebar-border",
      "select-none",
      layoutClass,
      activeClass,
      this.__className,
    ]
      .filter(Boolean)
      .join(" ");

    const centeredIconPart =
      this.__centered && this.__iconHtml
        ? `<span style="position:absolute;left:8px;display:flex;align-items:center">${this.__iconHtml}</span>`
        : iconPart;

    this.__htmlButton.setHtml(`
      <div class="p-1">
        <button
          type="button"
          class="${classes}"
        >
          ${centeredIconPart}
          ${textPart}
          ${trailingPart}
        </button>
      </div>
    `);

    qx.event.Timer.once(() => this.__bindNativeButton(), this, 0);
  }

  public setActive(active: boolean): this {
    if (this.__active === active) return this;
    this.__active = active;
    this.__scheduleRender();
    return this;
  }

  public setCollapsed(collapsed: boolean): this {
    if (this.__collapsed === collapsed) return this;
    this.__collapsed = collapsed;
    this.__scheduleRender();
    return this;
  }

  public onClick(handler: () => void): this {
    this.addListener("execute", handler);
    return this;
  }

  public setText(text: string): this {
    if (this.__buttonText === text) return this;
    this.__buttonText = text;
    this.__scheduleRender();
    return this;
  }

  public setCentered(centered: boolean): this {
    if (this.__centered === centered) return this;
    this.__centered = centered;
    this.__scheduleRender();
    return this;
  }

  public setTrailingHtml(html: string): this {
    if (this.__trailingHtml === html) return this;
    this.__trailingHtml = html;
    this.__scheduleRender();
    return this;
  }

  private __scheduleRender(): void {
    if (this.__renderPending) return;
    this.__renderPending = true;
    queueMicrotask(() => {
      this.__renderPending = false;
      this.__renderButton();
    });
  }
}
