class ButtonsPage extends qx.ui.container.Composite {
  constructor() {
    super(new qx.ui.layout.VBox(10));

    const container = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
    let isRowLayout = true;

    const primaryBtn = new BsButton("Primary", null, "btn-sm", "primary");
    const secondaryBtn = new BsButton("Secondary", null, "btn-sm", "secondary");
    const ghostBtn = new BsButton("Ghost", null, "btn-sm-ghost", "ghost");
    const btnLink = new BsButton("Link", null, "btn-sm-link", "link");
    const destructiveBtn = new BsButton("Error", null, "btn-sm", "destructive");
    const outlineBtn = new BsButton(
      "Outline",
      null,
      "btn-sm-outline",
      "outline",
    );
    const toastBtn = new BsButton(
      "Show Toast",
      null,
      "btn-sm-outline",
      "outline",
    );

    primaryBtn.setTabIndex(1);
    secondaryBtn.setTabIndex(2);
    ghostBtn.setTabIndex(3);
    btnLink.setTabIndex(4);
    destructiveBtn.setTabIndex(5);
    outlineBtn.setTabIndex(6);
    toastBtn.setTabIndex(7);

    primaryBtn.onClick(() => {
      alert("Hello World!");
    });
    secondaryBtn.onClick(() => {
      alert("Hello World1");
    });
    ghostBtn.onClick(() => {
      alert("Hello World2");
    });
    outlineBtn.onClick(() => {
      isRowLayout = !isRowLayout;
      container.setLayout(
        isRowLayout ? new qx.ui.layout.HBox(10) : new qx.ui.layout.VBox(10),
      );
    });
    toastBtn.onClick(() => {
      document.dispatchEvent(
        new CustomEvent("basecoat:toast", {
          detail: {
            config: {
              category: "success",
              title: "Success",
              description: "A success toast called from the front-end.",
              cancel: {
                label: "Dismiss",
              },
            },
          },
        }),
      );
    });

    container.setAllowGrowX(true);

    container.add(primaryBtn, { flex: 1 });
    container.add(secondaryBtn, { flex: 1 });
    container.add(ghostBtn, { flex: 1 });
    container.add(btnLink, { flex: 1 });
    container.add(destructiveBtn, { flex: 1 });
    container.add(outlineBtn, { flex: 1 });
    container.add(toastBtn, { flex: 1 });

    this.add(container);
  }
}
