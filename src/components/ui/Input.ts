class BsInput extends qx.ui.basic.Atom {
  static events = {
    input: "qx.event.type.Data",
    changeValue: "qx.event.type.Data",
  };

  private __htmlInput: qx.ui.embed.Html;
  private __value: string;
  private __placeholder: string;
  private __className: string;
  private __inputEl: HTMLInputElement | null = null;

  constructor(value?: string, placeholder?: string, className?: string) {
    super();

    this._setLayout(new qx.ui.layout.Grow());
    this.setAllowGrowX(true);

    // important for qooxdoo focus manager
    this.setFocusable(true);

    this.__value = value ?? "";
    this.__placeholder = placeholder ?? "";
    this.__className = className ?? "";

    this.__htmlInput = new qx.ui.embed.Html("");
    this.__htmlInput.setAllowGrowX(true);

    this.__render();
    this._add(this.__htmlInput);

    this.__htmlInput.addListenerOnce("appear", () => {
      const root = this.__htmlInput.getContentElement().getDomElement();
      this.__inputEl = root?.querySelector("input") ?? null;
      if (!this.__inputEl) return;

      this.__syncTabIndex();

      this.__inputEl.addEventListener("input", () => {
        const next = this.__inputEl?.value ?? "";
        const prev = this.__value;
        this.__value = next;

        this.fireDataEvent("input", next);
        if (prev !== next) this.fireDataEvent("changeValue", next);
      });
    });

    // when widget gets focus from Tab, move focus to native input
    this.addListener("focusin", () => {
      this.__inputEl?.focus();
    });

    // keep native tabindex in sync
    this.addListener("changeTabIndex", () => {
      this.__syncTabIndex();
    });
  }

  private __syncTabIndex(): void {
    if (!this.__inputEl) return;
    const idx = this.getTabIndex();
    if (idx == null) {
      this.__inputEl.removeAttribute("tabindex");
    } else {
      this.__inputEl.setAttribute("tabindex", String(idx));
    }
  }

  private __escapeAttr(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  private __render(): void {
    const classes = `input ${this.__className}`.trim();
    const value = this.__escapeAttr(this.__value);
    const placeholder = this.__escapeAttr(this.__placeholder);
    const idx = this.getTabIndex();
    const tabIndexAttr = idx == null ? "" : `tabindex="${idx}"`;

    this.__htmlInput.setHtml(`
        <div class="p-1">
            <input
            type="text"
            class="${classes}"
            value="${value}"
            placeholder="${placeholder}"
            ${tabIndexAttr}
            />
        </div>
    `);
  }

  public getValue(): string {
    return this.__inputEl?.value ?? this.__value;
  }

  public setValue(value: string): this {
    this.__value = value ?? "";
    if (this.__inputEl) this.__inputEl.value = this.__value;
    else this.__render();
    return this;
  }

  public setPlaceholder(value: string): this {
    this.__placeholder = value ?? "";
    if (this.__inputEl) this.__inputEl.placeholder = this.__placeholder;
    else this.__render();
    return this;
  }

  public onInput(handler: (value: string) => void): this {
    this.addListener("input", (ev: qx.event.type.Data) => {
      handler((ev.getData() as string) ?? "");
    });
    return this;
  }
}
