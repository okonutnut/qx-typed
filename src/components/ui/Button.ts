type BsButtonVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";
type BsButtonSize = "default" | "sm" | "lg" | "icon" | "sm-icon" | "lg-icon";

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
    const isIconSize = this.__size === "icon" || this.__size === "sm-icon";
    const iconPart = this.__iconHtml
      ? `<span class="${isIconSize ? "" : "me-2"}">${this.__iconHtml}</span>`
      : "";
    const tabIndexAttr = 'tabindex="-1"';
    const variantClass = this.__resolveVariantClass();
    const sizeClass = this.__resolveSizeClass();
    const classes = [variantClass, sizeClass, this.__className]
      .filter(Boolean)
      .join(" ");

    this.__htmlButton.setHtml(`
      <div class="p-1">
        <button type="button" class="w-full ${classes}" ${tabIndexAttr}>
          ${iconPart}
          ${this.__buttonText}
        </button>
      </div>
    `);

    qx.event.Timer.once(() => this.__bindNativeButton(), this, 0);
  }

  private __resolveVariantClass(): string {
    const variantMap: Record<BsButtonVariant, string> = {
      default: "primary",
      secondary: "secondary",
      destructive: "destructive",
      outline: "outline",
      ghost: "ghost",
      link: "link",
    };

    const variantSuffix = variantMap[this.__variant];
    const isIconSize = this.__size === "icon" || this.__size === "sm-icon" || this.__size === "lg-icon";
    const sizePrefix = isIconSize ? "icon" : this.__size;

    if (sizePrefix === "default") {
      return `btn-${variantSuffix}`;
    }
    return `btn-${sizePrefix}-${variantSuffix}`;
  }

  private __resolveSizeClass(): string {
    return "";
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

  public updateIcon(icon: InlineSvgIcon): void {
    this.__iconHtml = icon.getHtml();
    this.__renderButton();
    icon.addListener("changeHtml", () => {
      this.__iconHtml = icon.getHtml();
      this.__renderButton();
    });
  }
}