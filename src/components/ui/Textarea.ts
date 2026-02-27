class BsTextarea extends qx.ui.basic.Atom {
  static events = {
    input: "qx.event.type.Data",
    changeValue: "qx.event.type.Data",
  };

  private __htmlTextarea: qx.ui.embed.Html;
  private __value: string;
  private __placeholder: string;
  private __className: string;
  private __rows: number;
  private __textareaEl: HTMLTextAreaElement | null = null;

  constructor(
    value?: string,
    placeholder?: string,
    className?: string,
    rows: number = 4,
  ) {
    super();

    this._setLayout(new qx.ui.layout.Grow());
    this.setAllowGrowX(true);
    this.setFocusable(true);

    this.__value = value ?? "";
    this.__placeholder = placeholder ?? "";
    this.__className = className ?? "";
    this.__rows = rows;

    this.__htmlTextarea = new qx.ui.embed.Html("");
    this.__htmlTextarea.setAllowGrowX(true);

    this.__render();
    this._add(this.__htmlTextarea);

    this.__htmlTextarea.addListenerOnce("appear", () => {
      this.__bindNativeTextarea();
    });

    this.addListener("focusin", () => this.__textareaEl?.focus());
    this.addListener("changeTabIndex", () => this.__syncTabIndex());
  }

  private __bindNativeTextarea(): void {
    const root = this.__htmlTextarea.getContentElement().getDomElement();
    this.__textareaEl =
      (root?.querySelector("textarea") as HTMLTextAreaElement) ?? null;
    if (!this.__textareaEl) return;

    this.__syncTabIndex();

    this.__textareaEl.oninput = () => {
      const next = this.__textareaEl?.value ?? "";
      const prev = this.__value;
      this.__value = next;

      this.fireDataEvent("input", next);
      if (prev !== next) this.fireDataEvent("changeValue", next);
    };
  }

  private __syncTabIndex(): void {
    if (!this.__textareaEl) return;
    const idx = this.getTabIndex();
    if (idx == null) this.__textareaEl.removeAttribute("tabindex");
    else this.__textareaEl.setAttribute("tabindex", String(idx));
  }

  private __escapeAttr(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  private __render(): void {
    const classes = `textarea ${this.__className}`.trim();
    const value = this.__escapeAttr(this.__value);
    const placeholder = this.__escapeAttr(this.__placeholder);
    const idx = this.getTabIndex();
    const tabIndexAttr = idx == null ? "" : `tabindex="${idx}"`;

    this.__htmlTextarea.setHtml(`
      <div class="p-1">
        <textarea
          class="${classes}"
          placeholder="${placeholder}"
          rows="${this.__rows}"
          ${tabIndexAttr}
        >${value}</textarea>
      </div>
    `);

    qx.event.Timer.once(() => this.__bindNativeTextarea(), this, 0);
  }

  public getValue(): string {
    return this.__textareaEl?.value ?? this.__value;
  }

  public setValue(value: string): this {
    this.__value = value ?? "";
    if (this.__textareaEl) this.__textareaEl.value = this.__value;
    else this.__render();
    return this;
  }

  public setPlaceholder(value: string): this {
    this.__placeholder = value ?? "";
    if (this.__textareaEl) this.__textareaEl.placeholder = this.__placeholder;
    else this.__render();
    return this;
  }

  public setRows(rows: number): this {
    this.__rows = rows;
    if (this.__textareaEl) this.__textareaEl.rows = rows;
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
