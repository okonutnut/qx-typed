type BsAvatarShape = "full" | "rounded" | "square";

class BsAvatar extends qx.ui.basic.Atom {
  private __htmlAvatar: qx.ui.embed.Html;
  private __src: string;
  private __alt: string;
  private __fallback: string;
  private __className: string;
  private __shape: BsAvatarShape;
  private __imgEl: HTMLImageElement | null = null;
  private __fallbackEl: HTMLSpanElement | null = null;
  private __hasImageError = false;

  constructor(
    src?: string,
    alt?: string,
    fallback?: string,
    className?: string,
    shape: BsAvatarShape = "full",
  ) {
    super();

    this._setLayout(new qx.ui.layout.Grow());
    this.setAllowGrowX(true);
    this.setAllowGrowY(true);

    this.__src = src ?? "";
    this.__alt = alt ?? "User avatar";
    this.__fallback = fallback ?? "?";
    this.__className = className ?? "";
    this.__shape = shape;

    this.__htmlAvatar = new qx.ui.embed.Html("");
    this.__htmlAvatar.setAllowGrowY(true);
    this.__htmlAvatar.setOverflowY("visible");
    this.__render();
    this._add(this.__htmlAvatar);

    this.__htmlAvatar.addListenerOnce("appear", () => {
      this.__bindDom();
    });
  }

  private __escape(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  private __resolveShapeClass(): string {
    if (this.__shape === "rounded") return "rounded-md";
    if (this.__shape === "square") return "rounded-none";
    return "rounded-full";
  }

  private __bindDom(): void {
    const root = this.__htmlAvatar.getContentElement().getDomElement();
    this.__imgEl = (root?.querySelector("img") as HTMLImageElement) ?? null;
    this.__fallbackEl =
      (root?.querySelector("[data-avatar-fallback]") as HTMLSpanElement) ??
      null;

    if (!this.__imgEl) return;

    this.__imgEl.onerror = () => {
      this.__hasImageError = true;
      this.__syncVisibility();
    };

    this.__imgEl.onload = () => {
      this.__hasImageError = false;
      this.__syncVisibility();
    };

    this.__syncVisibility();
  }

  private __syncVisibility(): void {
    if (!this.__fallbackEl) return;

    const shouldShowFallback = !this.__src || this.__hasImageError;
    this.__fallbackEl.style.display = shouldShowFallback ? "flex" : "none";
  }

  private __render(): void {
    const src = this.__escape(this.__src);
    const alt = this.__escape(this.__alt);
    const fallback = this.__escape(this.__fallback);
    const shapeClass = this.__resolveShapeClass();
    const wrapperClass = [
      "relative",
      "inline-flex",
      "size-8",
      "shrink-0",
      shapeClass,
      this.__className,
    ]
      .filter(Boolean)
      .join(" ");
    const imageClass = ["size-full", "object-cover", shapeClass]
      .filter(Boolean)
      .join(" ");
    const fallbackClass = [
      "absolute",
      "inset-0",
      "items-center",
      "justify-center",
      "bg-muted",
      "text-muted-foreground",
      "text-xs",
      "font-medium",
      shapeClass,
    ]
      .filter(Boolean)
      .join(" ");

    this.__htmlAvatar.setHtml(`
			<div class="p-1">
				<span class="${wrapperClass}">
					<img
						class="${imageClass}"
						alt="${alt}"
						src="${src}"
					/>
					<span class="${fallbackClass}" data-avatar-fallback>
						${fallback}
					</span>
				</span>
			</div>
		`);

    qx.event.Timer.once(() => this.__bindDom(), this, 0);
  }

  public setSrc(src: string): this {
    this.__src = src ?? "";
    this.__hasImageError = false;
    this.__render();
    return this;
  }

  public setAlt(alt: string): this {
    this.__alt = alt ?? "User avatar";
    this.__render();
    return this;
  }

  public setFallback(fallback: string): this {
    this.__fallback = fallback ?? "?";
    this.__render();
    return this;
  }

  public setShape(shape: BsAvatarShape): this {
    this.__shape = shape;
    this.__render();
    return this;
  }
}
