class BsInputGroup extends qx.ui.container.Composite {
  private __label: qx.ui.basic.Label;
  private __input: BsInput;
  private __error: qx.ui.basic.Label;

  constructor(
    labelText: string,
    placeholder?: string,
    initialValue?: string,
    inputClassName?: string,
  ) {
    super(new qx.ui.layout.VBox(6));
    this.setAllowGrowX(true);

    this.__label = new qx.ui.basic.Label(labelText);

    this.__input = new BsInput(
      initialValue ?? "",
      placeholder ?? "",
      inputClassName,
    );
    this.__input.setAllowGrowX(true);

    this.__error = new qx.ui.basic.Label("");
    this.__error.setVisibility("excluded");

    this.add(this.__label);
    this.add(this.__input);
    this.add(this.__error);
  }

  public onInput(handler: (value: string) => void): this {
    this.__input.onInput(handler);
    return this;
  }

  public getValue(): string {
    return this.__input.getValue() ?? "";
  }

  public setValue(value: string): this {
    this.__input.setValue(value);
    return this;
  }

  public setError(message?: string): this {
    const text = (message ?? "").trim();
    this.__error.setValue(text);

    if (text) {
      this.__error.show();
    } else {
      this.__error.exclude();
    }

    return this;
  }

  public clearError(): this {
    return this.setError("");
  }

  public getInputWidget(): BsInput {
    return this.__input;
  }
}
