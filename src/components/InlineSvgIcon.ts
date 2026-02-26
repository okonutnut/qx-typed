class InlineSvgIcon extends qx.ui.embed.Html {
  private __name: string;
  private __size: number;

  constructor(name: string, size = 20) {
    super("");
    this.__name = name;
    this.__size = size;

    this.set({
      width: size,
      height: size,
      minWidth: size,
      minHeight: size,
      selectable: false,
    });

    this.__loadAndRender();
  }

  setIcon(name: string) {
    this.__name = name;
    this.__loadAndRender();
  }

  setSize(size: number) {
    this.__size = size;
    this.setWidth(size);
    this.setHeight(size);
    this.setMinWidth(size);
    this.setMinHeight(size);
    this.__loadAndRender();
  }

  private __loadAndRender() {
    const url = "resource/app/icons/" + this.__name + ".svg";

    fetch(url)
      .then((r) => r.text())
      .then((svg) => {
        // Force width/height and make sure it uses currentColor
        // (If your SVG already has stroke="currentColor", this is harmless.)
        let out = svg;

        // Ensure currentColor (covers hardcoded strokes)
        out = out.replace(/stroke="[^"]*"/g, `stroke="currentColor"`);

        // Ensure sizing (remove existing width/height then inject ours)
        out = out.replace(/\swidth="[^"]*"/g, "");
        out = out.replace(/\sheight="[^"]*"/g, "");
        out = out.replace(
          "<svg",
          `<svg width="${this.__size}" height="${this.__size}" style="display:block;"`,
        );

        this.setHtml(out);

        // Qooxdoo nudge after DOM update
        this.invalidateLayoutCache();
      })
      .catch(() => this.setHtml(""));
  }
}
