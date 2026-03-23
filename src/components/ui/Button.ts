type BsButtonVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";
type BsButtonSize = "default" | "sm" | "lg" | "icon";

class BsButton extends qx.ui.basic.Atom {
  static events = {
    execute: "qx.event.type.Event",
  };

  private __htmlButton: qx.ui.embed.Html;
  private __iconHtml: string;
  private __buttonText: string;
  private __className: string;
  private __variant: BsButtonVariant = "default";
  private __size: BsButtonSize = "default";
  private __buttonEl: HTMLButtonElement | null = null;

  constructor(
    text?: string,
    icon?: InlineSvgIcon,
    options?: {
      variant?: BsButtonVariant;
      size?: BsButtonSize;
      className?: string;
    },
  ) {
    super();

    this._setLayout(new qx.ui.layout.Grow());
    this.setAllowGrowX(true);
    this.setFocusable(true);

    this.__iconHtml = icon ? icon.getHtml() : "";
    this.__buttonText = text ?? "";
    this.__className = options?.className ?? "";
    this.__variant = options?.variant ?? "default";
    this.__size = options?.size ?? "default";

    this.__htmlButton = new qx.ui.embed.Html("");

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
    const iconPart = this.__iconHtml
      ? `<span class="me-2">${this.__iconHtml}</span>`
      : "";
    const tabIndexAttr = 'tabindex="-1"';
    const variantClass = this.__resolveVariantClass();
    const sizeClass = this.__resolveSizeClass();
    const classes = ["btn", this.__className, variantClass, sizeClass]
      .filter(Boolean)
      .join(" ");

    this.__htmlButton.setHtml(`
      <button type="button" class="${classes}" ${tabIndexAttr}>
        ${iconPart}
        ${this.__buttonText}
      </button>
    `);

    qx.event.Timer.once(() => this.__bindNativeButton(), this, 0);
  }

  private __resolveVariantClass(): string {
    const variantClassMap: Record<BsButtonVariant, string> = {
      default: "btn-primary",
      secondary: "btn-secondary",
      destructive: "btn-destructive",
      outline: "btn-outline",
      ghost: "btn-ghost",
      link: "btn-link",
    };

    return variantClassMap[this.__variant];
  }

  private __resolveSizeClass(): string {
    const sizeClassMap: Record<BsButtonSize, string> = {
      default: "",
      sm: "btn-sm",
      lg: "btn-lg",
      icon: "btn-icon",
    };

    return sizeClassMap[this.__size];
  }

  public getVariant(): BsButtonVariant {
    return this.__variant;
  }

  public getSize(): BsButtonSize {
    return this.__size;
  }

  public onClick(handler: () => void): this {
    this.addListener("execute", handler);
    return this;
  }
}