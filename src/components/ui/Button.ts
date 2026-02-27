class BsButton extends qx.ui.basic.Atom {
  // ✅ Declare supported events (important for qx)
  static events = {
    execute: "qx.event.type.Event",
  };

  constructor(text?: string, icon?: InlineSvgIcon, className?: string) {
    super();
    this._setLayout(new qx.ui.layout.Grow());
    this.setAllowGrowX(true);

    const htmlButton = new qx.ui.embed.Html("");
    htmlButton.setAllowGrowX(true);

    let iconHtml = icon ? icon.getHtml() : "";
    const buttonText = text ?? "";

    const renderButton = () => {
      const iconPart = iconHtml ? `<span>${iconHtml}</span>` : "";

      htmlButton.setHtml(`
        <button type="button" class="btn ${className || ""}">
          ${iconPart}
          ${buttonText}
        </button>
      `);
    };

    renderButton();

    if (icon) {
      icon.addListener("changeHtml", () => {
        iconHtml = icon.getHtml();
        renderButton();
      });
    }

    // Fire execute event when tapped
    this.addListener("tap", () => {
      this.fireEvent("execute");
    });

    this._add(htmlButton);
  }

  // Optional convenience method
  public onClick(handler: () => void): this {
    this.addListener("execute", handler);
    return this;
  }
}
