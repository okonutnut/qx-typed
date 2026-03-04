type BsAlertDialogConfig = {
  id: string;
  title: string;
  description?: string;
  cancelLabel?: string;
  continueLabel?: string;
  onContinue?: () => void;
  children?: qx.ui.core.Widget;
  footerButtons?: "ok" | "ok-cancel" | "cancel";
};

class BsAlertDialog {
  private __id: string;
  private __title: string;
  private __description: string;
  private __cancelLabel: string;
  private __continueLabel: string;
  private __onContinue?: () => void;
  private __children?: qx.ui.core.Widget;
  private __bodyRoot?: qx.ui.root.Inline;
  private __footerButtons: "ok" | "ok-cancel" | "cancel";

  constructor(config: BsAlertDialogConfig) {
    this.__id = config.id;
    this.__title = config.title;
    this.__description = config.description ?? "";
    this.__cancelLabel = config.cancelLabel ?? "Cancel";
    this.__continueLabel = config.continueLabel ?? "Continue";
    this.__onContinue = config.onContinue;
    this.__children = config.children;
    this.__footerButtons = config.footerButtons ?? "ok-cancel";
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
    if (!this.__children && this.__description) {
      dialog.setAttribute("aria-describedby", descriptionId);
    }

    const wrapper = document.createElement("div");

    const header = document.createElement("header");
    const title = document.createElement("h2");
    title.id = titleId;
    title.textContent = this.__title;
    header.appendChild(title);

    const body = document.createElement("div");

    if (this.__children) {
      const bodyHost = document.createElement("div");
      body.appendChild(bodyHost);

      this.__bodyRoot = new qx.ui.root.Inline(bodyHost);
      this.__bodyRoot.setLayout(new qx.ui.layout.Grow());
      this.__bodyRoot.add(this.__children);
    } else if (this.__description) {
      const description = document.createElement("p");
      description.id = descriptionId;
      description.textContent = this.__description;
      body.appendChild(description);
    }

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

    if (this.__footerButtons === "ok-cancel" || this.__footerButtons === "cancel") {
      footer.appendChild(cancelBtn);
    }
    if (this.__footerButtons === "ok-cancel" || this.__footerButtons === "ok") {
      footer.appendChild(continueBtn);
    }

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    wrapper.appendChild(footer);
    dialog.appendChild(wrapper);
    document.body.appendChild(dialog);

    return dialog;
  }
}
