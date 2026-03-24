class BsSelect extends qx.ui.basic.Atom {
  static events = {
    changeValue: "qx.event.type.Data",
  };

  private __htmlSelect: qx.ui.embed.Html;
  private __options: string[];
  private __className: string;
  private __value = "";
  private __selectEl: HTMLSelectElement | null = null;

  constructor(options: string[] = [], className?: string) {
    super();

    this._setLayout(new qx.ui.layout.Grow());
    this.setAllowGrowX(true);
    this.setFocusable(true);

    this.__options = options;
    this.__className = className ?? "";

    this.__htmlSelect = new qx.ui.embed.Html("");
    this.__htmlSelect.setAllowGrowX(true);

    this.__render();
    this._add(this.__htmlSelect);

    this.__htmlSelect.addListenerOnce("appear", () => {
      this.__bindNativeSelect();
    });

    this.addListener("focusin", () => this.__selectEl?.focus());
    this.addListener("changeTabIndex", () => this.__syncTabIndex());
  }

  private __escape(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  private __syncTabIndex(): void {
    if (!this.__selectEl) return;
    this.__selectEl.setAttribute("tabindex", "-1");
  }

  private __bindNativeSelect(): void {
    const root = this.__htmlSelect.getContentElement().getDomElement();
    this.__selectEl =
      (root?.querySelector("select") as HTMLSelectElement) ?? null;
    if (!this.__selectEl) return;

    this.__syncTabIndex();

    this.__selectEl.onchange = () => {
      this.__value = this.__selectEl?.value ?? "";
      this.fireDataEvent("changeValue", this.__value);
    };
  }

  private __render(): void {
    const optionsHtml = [
      `<option value="">Select an option</option>`,
      ...this.__options.map((opt) => {
        const v = this.__escape(opt);
        const selected = this.__value === opt ? "selected" : "";
        return `<option value="${v}" ${selected}>${v}</option>`;
      }),
    ].join("");

    const tabIndexAttr = 'tabindex="-1"';
    const classes = ["select", this.__className].filter(Boolean).join(" ");

    this.__htmlSelect.setHtml(`
      <div class="p-1">
        <select class="w-full ${classes}" ${tabIndexAttr}>
          ${optionsHtml}
        </select>
      </div>
    `);

    qx.event.Timer.once(() => this.__bindNativeSelect(), this, 0);
  }

  public getSelectedValue(): string {
    return this.__selectEl?.value ?? this.__value;
  }

  public setSelectedByLabel(label: string): this {
    this.__value = this.__options.indexOf(label) !== -1 ? label : "";
    if (this.__selectEl) this.__selectEl.value = this.__value;
    else this.__render();
    return this;
  }

  public resetSelection(): this {
    this.__value = "";
    if (this.__selectEl) this.__selectEl.value = "";
    else this.__render();
    return this;
  }

  public onChange(handler: (value: string) => void): this {
    this.addListener("changeValue", (ev: qx.event.type.Data) => {
      handler((ev.getData() as string) ?? "");
    });
    return this;
  }
}
