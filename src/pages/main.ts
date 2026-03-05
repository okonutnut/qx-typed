class MainPage extends qx.ui.container.Composite {
  constructor() {
    super();
    this.setLayout(new qx.ui.layout.Grow());
    this.setBackgroundColor(AppColors.background());

    const center = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(12).set({ alignX: "center", alignY: "middle" }),
    );

    const welcomeCard = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(8).set({ alignX: "center" }),
    );
    welcomeCard.setMaxWidth(520);
    welcomeCard.setMinWidth(0);
    welcomeCard.setAllowGrowX(true);
    welcomeCard.setPadding(24);
    welcomeCard.setBackgroundColor(AppColors.background());

    const name = typeof userFullName !== "undefined" ? userFullName : "User";
    const title = new qx.ui.basic.Label(`Welcome, ${name}`);
    title.setTextColor(AppColors.mutedForeground());
    title.setTextAlign("center");
    title.setAlignX("center");
    title.setFont(
      // @ts-ignore
      new qx.bom.Font(26).set({ bold: true }),
    );

    const subtitle = new qx.ui.basic.Label(
      "SIAS Online — Class Scheduling & Faculty Management. Use the sidebar to manage subjects, faculty, rooms, semesters, and class schedules.",
    );
    subtitle.setWidth(400);
    subtitle.setTextColor(AppColors.mutedForeground());
    subtitle.setTextAlign("center");
    subtitle.setWrap(true);
    subtitle.setAlignX("center");

    welcomeCard.add(title);
    welcomeCard.add(subtitle);

    const syncWelcomeCardWidth = () => {
      const width = Math.max(
        240,
        Math.min(520, qx.bom.Viewport.getWidth() - 32),
      );
      welcomeCard.setWidth(width);
    };
    qx.event.Registration.addListener(window, "resize", syncWelcomeCardWidth);
    syncWelcomeCardWidth();

    center.add(welcomeCard);
    this.add(center);
  }
}
