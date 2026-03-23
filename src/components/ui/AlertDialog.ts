type BsAlertDialogConfig = {
  title: string;
  description?: string;
  cancelLabel?: string;
  continueLabel?: string;
  onContinue?: () => void;
  children?: qx.ui.core.Widget;
  footerButtons?: "ok" | "ok-cancel" | "cancel";
};

/**
 * Singleton modal dialog. One shared <dialog> element is reused for every
 * invocation — content, title, and buttons are swapped dynamically.
 * Footer buttons use event delegation via data-action attributes.
 */
class BsAlertDialog {
  private static __dialog: HTMLDialogElement | null = null;
  private static __titleEl: HTMLHeadingElement | null = null;
  private static __body: HTMLDivElement | null = null;
  private static __footer: HTMLElement | null = null;
  private static __bodyRoot: qx.ui.root.Inline | null = null;
  private static __onContinue: (() => void) | null = null;

  private constructor() {}

  static show(config: BsAlertDialogConfig): void {
    const dialog = BsAlertDialog.__getOrCreateDialog();

    // Dispose previous qooxdoo widget tree
    BsAlertDialog.__disposeBody();

    // Title
    BsAlertDialog.__titleEl!.textContent = config.title;

    // Body
    const body = BsAlertDialog.__body!;
    if (config.children) {
      dialog.removeAttribute("aria-describedby");
      const bodyHost = document.createElement("div");
      body.appendChild(bodyHost);

      BsAlertDialog.__bodyRoot = new qx.ui.root.Inline(bodyHost);
      BsAlertDialog.__bodyRoot.setLayout(new qx.ui.layout.Grow());
      BsAlertDialog.__bodyRoot.add(config.children);
    } else if (config.description) {
      dialog.setAttribute("aria-describedby", "bs-dialog-desc");
      const p = document.createElement("p");
      p.id = "bs-dialog-desc";
      p.textContent = config.description;
      body.appendChild(p);
    }

    // Footer buttons (rebuilt each time for correct labels)
    const footer = BsAlertDialog.__footer!;
    footer.innerHTML = "";
    const buttons = config.footerButtons ?? "ok-cancel";
    const cancelLabel = config.cancelLabel ?? "Cancel";
    const continueLabel = config.continueLabel ?? "Continue";

    if (buttons === "ok-cancel" || buttons === "cancel") {
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "btn-sm-primary";
      cancelBtn.textContent = cancelLabel;
      cancelBtn.type = "button";
      cancelBtn.dataset.action = "cancel";
      footer.appendChild(cancelBtn);
    }
    if (buttons === "ok-cancel" || buttons === "ok") {
      const continueBtn = document.createElement("button");
      continueBtn.className = "btn-sm-primary";
      continueBtn.textContent = continueLabel;
      continueBtn.type = "button";
      continueBtn.dataset.action = "continue";
      footer.appendChild(continueBtn);
    }

    BsAlertDialog.__onContinue = config.onContinue ?? null;
    dialog.showModal();
  }

  private static __disposeBody(): void {
    if (BsAlertDialog.__bodyRoot) {
      BsAlertDialog.__bodyRoot.removeAll();
      BsAlertDialog.__bodyRoot.destroy();
      BsAlertDialog.__bodyRoot = null;
    }
    BsAlertDialog.__body!.innerHTML = "";
  }

  private static __getOrCreateDialog(): HTMLDialogElement {
    if (BsAlertDialog.__dialog) return BsAlertDialog.__dialog;

    const dialog = document.createElement("dialog");
    dialog.id = "bs-global-dialog";
    dialog.className = "dialog";
    dialog.setAttribute("aria-labelledby", "bs-dialog-title");

    const wrapper = document.createElement("div");

    const header = document.createElement("header");
    const title = document.createElement("h2");
    title.id = "bs-dialog-title";
    header.appendChild(title);

    const body = document.createElement("div");
    const footer = document.createElement("footer");

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    wrapper.appendChild(footer);
    dialog.appendChild(wrapper);
    document.body.appendChild(dialog);

    // Event delegation — single handler for all footer button clicks
    footer.addEventListener("click", (e) => {
      const target = (e.target as HTMLElement).closest<HTMLButtonElement>(
        "button[data-action]",
      );
      if (!target) return;

      const action = target.dataset.action;
      if (action === "cancel") {
        dialog.close();
      } else if (action === "continue") {
        dialog.close();
        BsAlertDialog.__onContinue?.();
      }
    });

    BsAlertDialog.__dialog = dialog;
    BsAlertDialog.__titleEl = title;
    BsAlertDialog.__body = body;
    BsAlertDialog.__footer = footer;

    return dialog;
  }
}
