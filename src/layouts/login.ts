class LoginLayout extends qx.ui.container.Composite {
  static events = {
    login: "qx.event.type.Event",
  };

  constructor() {
    super(
      new qx.ui.layout.VBox(12).set({ alignX: "center", alignY: "middle" }),
    );
    this.setBackgroundColor(AppColors.background());

    const card = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
    card.setWidth(350);
    card.setAllowGrowX(false);
    card.setPadding(20);
    card.setBackgroundColor(AppColors.card());
    card.setDecorator(
      new qx.ui.decoration.Decorator().set({
        width: 1,
        style: "solid",
        color: AppColors.border(),
        radius: 10,
      }),
    );

    const schoolLogo = new qx.ui.basic.Image("resource/app/ac_logo.png");
    schoolLogo.setAlignX("center");
    schoolLogo.set({
      scale: true,
      width: 64,
      height: 64,
    });
    card.add(schoolLogo);

    const title = new qx.ui.basic.Label("Aldersgate College Inc.");
    title.setTextAlign("center");
    title.setAlignX("center");
    title.setAllowGrowX(true);
    title.setFont(
      // @ts-ignore
      new qx.bom.Font(16, ["Inter", "sans-serif"]).set({ bold: true }),
    );
    title.setTextColor(AppColors.foreground());
    title.setMarginBottom(10);
    card.add(title);

    const location = new qx.ui.basic.Label("Solano, Nueva Vizcaya");
    location.setTextAlign("center");
    location.setAlignX("center");
    location.setAllowGrowX(true);
    location.setFont(
      // @ts-ignore
      new qx.bom.Font(12, ["Inter", "sans-serif"]).set({ bold: true }),
    );
    location.setTextColor(AppColors.foreground());
    location.setMarginBottom(30);
    card.add(location);

    const username = new BsInput("", "Username");
    const password = new BsPassword("", "Password");
    card.add(username);
    card.add(password);

    const loginError = new qx.ui.basic.Label("");
    loginError.setVisibility("excluded");
    loginError.setTextAlign("center");
    loginError.setTextColor(AppColors.destructive());
    loginError.setMarginTop(4);
    card.add(loginError);

    const triggerLogin = () => {
      const user = username.getValue().trim();
      const pass = password.getValue();
      if (!user || !pass) {
        loginError.setValue("Username and password are required");
        loginError.show();
        return;
      }
      loginError.exclude();
      submit.setEnabled(false);

      Api.Queries.user(1).then((result) => {
          globalThis.username = result.user!.username;
          globalThis.userRole = result.user!.role;
          globalThis.userFullName = result.user!.fullName;
          this.fireEvent("login");
        })
        .catch((err: ApiError) => {
          console.error("[Login] Error:", err);
          loginError.setValue(err.message || "Login failed");
          loginError.show();
          submit.setEnabled(true);
        });
    };

    const submit = new BsButton("Sign in", undefined, { variant: "default", className: "w-full" });
    submit.setAllowGrowX(true);
    submit.onClick(triggerLogin);
    card.add(submit);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;

      const activeElement = document.activeElement;
      const cardElement = card.getContentElement().getDomElement();
      if (
        !activeElement ||
        !cardElement ||
        !cardElement.contains(activeElement)
      )
        return;

      event.preventDefault();
      triggerLogin();
    };

    document.addEventListener("keydown", onKeyDown);
    this.addListenerOnce("disappear", () => {
      document.removeEventListener("keydown", onKeyDown);
    });

    this.add(card);
  }
}
