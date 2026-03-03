type BsAlertDialogConfig = {
  id: string;
  title: string;
  description?: string;
  cancelLabel?: string;
  continueLabel?: string;
  onContinue?: () => void;
};

class BsAlertDialog {
  private __id: string;
  private __title: string;
  private __description: string;
  private __cancelLabel: string;
  private __continueLabel: string;
  private __onContinue?: () => void;

  constructor(config: BsAlertDialogConfig) {
    this.__id = config.id;
    this.__title = config.title;
    this.__description = config.description ?? "";
    this.__cancelLabel = config.cancelLabel ?? "Cancel";
    this.__continueLabel = config.continueLabel ?? "Continue";
    this.__onContinue = config.onContinue;
  }

  public show(): void {
    const dialog = this.__getOrCreateDialog();
    dialog.showModal();
  }

  private __getOrCreateDialog(): HTMLDialogElement {
    const existing = document.getElementById(
      this.__id,
    ) as HTMLDialogElement | null;
    if (existing) return existing;

    const titleId = `${this.__id}-title`;
    const descriptionId = `${this.__id}-description`;

    const dialog = document.createElement("dialog");
    dialog.id = this.__id;
    dialog.className = "dialog";
    dialog.setAttribute("aria-labelledby", titleId);
    dialog.setAttribute("aria-describedby", descriptionId);

    const wrapper = document.createElement("div");

    const header = document.createElement("header");
    const title = document.createElement("h2");
    title.id = titleId;
    title.textContent = this.__title;
    header.appendChild(title);

    const description = document.createElement("p");
    description.id = descriptionId;
    description.textContent = this.__description;
    header.appendChild(description);

    const footer = document.createElement("footer");

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "btn-outline";
    cancelBtn.textContent = this.__cancelLabel;
    cancelBtn.type = "button";
    cancelBtn.onclick = () => dialog.close();

    const continueBtn = document.createElement("button");
    continueBtn.className = "btn-primary";
    continueBtn.textContent = this.__continueLabel;
    continueBtn.type = "button";
    continueBtn.onclick = () => {
      dialog.close();
      this.__onContinue?.();
    };

    footer.appendChild(cancelBtn);
    footer.appendChild(continueBtn);

    wrapper.appendChild(header);
    wrapper.appendChild(footer);
    dialog.appendChild(wrapper);
    document.body.appendChild(dialog);

    return dialog;
  }
}
