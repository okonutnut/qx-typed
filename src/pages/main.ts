class MainPage extends qx.ui.container.Composite {
  constructor() {
    super();
    this.setLayout(new qx.ui.layout.Grow());
    this.setBackgroundColor(AppColors.background());

    const center = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(12).set({ alignY: "middle" }),
    );
    center.setAlignX("center");

    const welcomeCard = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
    welcomeCard.setWidth(520);
    welcomeCard.setPadding(24);
    welcomeCard.setBackgroundColor(AppColors.card());

    const title = new qx.ui.basic.Label("Welcome to SIAS 10.x");
    title.setTextColor(AppColors.mutedForeground());
    title.setTextAlign("center");
    title.setFont(
      // @ts-ignore
      new qx.bom.Font(26).set({ bold: true }),
    );

    const subtitle = new qx.ui.basic.Label(
      "Your workspace is ready. Use the sidebar to explore components and pages.",
    );
    subtitle.setTextColor(AppColors.mutedForeground());
    subtitle.setTextAlign("center");
    subtitle.setWrap(true);

    welcomeCard.add(title);
    welcomeCard.add(subtitle);

    center.add(welcomeCard);
    this.add(center);
  }
}
