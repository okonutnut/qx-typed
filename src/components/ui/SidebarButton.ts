class BsSidebarButton extends qx.ui.basic.Atom {
  static events = {
    execute: "qx.event.type.Event",
  };

  private __htmlButton: qx.ui.embed.Html;
  private __iconHtml: string;
  private __buttonText: string;
  private __className: string;
  private __active = false;

  constructor(text?: string, icon?: InlineSvgIcon, className?: string) {
    super();

    this._setLayout(new qx.ui.layout.Grow());
    this.setAllowGrowX(true);

    this.__htmlButton = new qx.ui.embed.Html("");
    this.__htmlButton.setAllowGrowX(true);

    this.__iconHtml = icon ? icon.getHtml() : "";
    this.__buttonText = text ?? "";
    this.__className = className || "";

    this.__renderButton();

    if (icon) {
      icon.addListener("changeHtml", () => {
        this.__iconHtml = icon.getHtml();
        this.__renderButton();
      });
    }

    this.__htmlButton.addListener("tap", () => {
      this.fireEvent("execute");
    });

    this._add(this.__htmlButton);
  }

  private __renderButton(): void {
    const iconPart = this.__iconHtml ? `<span>${this.__iconHtml}</span>` : "";
    const activeClass = this.__active
      ? "btn-active bg-base-200 font-semibold"
      : "";

    this.__htmlButton.setHtml(`
      <button
        type="button"
        class="btn btn-ghost btn-sm w-full justify-start items-center gap-2 ${this.__className} ${activeClass}"
      >
        ${iconPart}
        ${this.__buttonText}
      </button>
    `);
  }

  public setActive(active: boolean): this {
    this.__active = active;
    this.__renderButton();
    return this;
  }

  public onClick(handler: () => void): this {
    this.addListener("execute", handler);
    return this;
  }
}
