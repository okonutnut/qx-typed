type BsButtonVariant =
  | "neutral"
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";

class BsButton extends qx.ui.basic.Atom {
  static events = {
    execute: "qx.event.type.Event",
  };

  private __htmlButton: qx.ui.embed.Html;
  private __iconHtml: string;
  private __buttonText: string;
  private __className: string;
  private __variant: BsButtonVariant = "neutral";
  private __disableWrapperPadding = false;
  private __buttonEl: HTMLButtonElement | null = null;

  constructor(
    text?: string,
    icon?: InlineSvgIcon,
    className?: string,
    variant?: BsButtonVariant,
    disableWrapperPadding?: boolean,
  ) {
    super();

    this._setLayout(new qx.ui.layout.Grow());
    this.setAllowGrowX(true);
    this.setFocusable(true);

    this.__iconHtml = icon ? icon.getHtml() : "";
    this.__buttonText = text ?? "";
    this.__className = className ?? "";
    this.__variant = variant ?? "neutral";
    this.__disableWrapperPadding = disableWrapperPadding ?? false;

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
    this.__buttonEl.setAttribute("tabindex", "-1");
  }

  private __renderButton(): void {
    const iconPart = this.__iconHtml ? `<span>${this.__iconHtml}</span>` : "";
    const tabIndexAttr = 'tabindex="-1"';
    const variantClass = this.__resolveVariantClass();
    const classes = ["w-full", this.__className, variantClass]
      .filter(Boolean)
      .join(" ");

    this.__htmlButton.setHtml(`
      <div class="${this.__disableWrapperPadding ? "" : "p-1"}">
        <button type="button" class="${classes}" ${tabIndexAttr}>
          ${iconPart}
          ${this.__buttonText}
        </button>
      </div>
    `);

    // setHtml replaces DOM; rebind native events
    qx.event.Timer.once(() => this.__bindNativeButton(), this, 0);
  }

  private __resolveVariantClass(): string {
    const variantClassMap: Record<BsButtonVariant, string> = {
      neutral: "",
      primary: "btn-primary",
      secondary: "btn-secondary",
      accent: "btn-accent",
      info: "btn-info",
      success: "btn-success",
      warning: "btn-warning",
      destructive: "btn-destructive",
      outline: "btn-outline",
      ghost: "btn-ghost",
      link: "btn-link",
    };

    return variantClassMap[this.__variant];
  }

  public getVariant(): BsButtonVariant {
    return this.__variant;
  }

  public onClick(handler: () => void): this {
    this.addListener("execute", handler);
    return this;
  }
}
