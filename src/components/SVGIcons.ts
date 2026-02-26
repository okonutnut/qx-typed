class SvgIcon extends qx.ui.basic.Image {
  private __name: string;
  private __size: number;

  // Change this once to match your app namespace/folder
  static BASE = "resource/app/icons/";

  constructor(name: string, size = 24) {
    super(SvgIcon.BASE + name + ".svg");
    this.__name = name;
    this.__size = size;

    this.set({
      width: size,
      height: size,
      scale: true, // allow scaling SVG to widget size
      allowGrowX: false,
      allowGrowY: false,
      allowShrinkX: false,
      allowShrinkY: false,
    });
  }

  setIcon(name: string) {
    if (this.__name === name) return;
    this.__name = name;
    this.setSource(SvgIcon.BASE + name + ".svg");
  }

  setSize(size: number) {
    if (this.__size === size) return;
    this.__size = size;
    this.setWidth(size);
    this.setHeight(size);
  }
}
