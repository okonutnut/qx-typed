/**
 * Create a sample form.
 */
class FormPage extends qx.ui.container.Composite {
  constructor() {
    super(new qx.ui.layout.VBox(3));

    const setError = (errorLabel: qx.ui.basic.Label, message?: string) => {
      const text = (message ?? "").trim();
      errorLabel.setValue(text);
      if (text) {
        errorLabel.show();
      } else {
        errorLabel.exclude();
      }
    };

    const nameLabel = new qx.ui.basic.Label("Name");
    const nameInput = new BsInput("", "Enter your name", "input-bordered");
    nameInput.setAllowGrowX(true);
    const nameError = new qx.ui.basic.Label("");
    nameError.setVisibility("excluded");
    nameError.addListenerOnce("appear", () => {
      nameError.getContentElement().addClass("text-error");
    });

    const passwordLabel = new qx.ui.basic.Label("Password");
    const passwordInput = new BsInput(
      "",
      "Enter your password",
      "input-bordered",
    );
    passwordInput.setAllowGrowX(true);
    const passwordError = new qx.ui.basic.Label("");
    passwordError.setVisibility("excluded");
    passwordError.addListenerOnce("appear", () => {
      passwordError.getContentElement().addClass("text-error");
    });

    const ageLabel = new qx.ui.basic.Label("Age");
    const ageInput = new BsInput("50", "Enter your age", "input-bordered");
    ageInput.setAllowGrowX(true);
    const ageError = new qx.ui.basic.Label("");
    ageError.setVisibility("excluded");
    ageError.addListenerOnce("appear", () => {
      ageError.getContentElement().addClass("text-error");
    });

    const countryLabel = new qx.ui.basic.Label("Country");
    const countryInput = new BsInput(
      "",
      "Enter your country",
      "input-bordered",
    );
    countryInput.setAllowGrowX(true);
    const countryError = new qx.ui.basic.Label("");
    countryError.setVisibility("excluded");
    countryError.addListenerOnce("appear", () => {
      countryError.getContentElement().addClass("text-error");
    });

    const bioLabel = new qx.ui.basic.Label("Bio");
    const bioInput = new BsInput(
      "",
      "Tell us about yourself",
      "input-bordered",
    );
    bioInput.setAllowGrowX(true);
    const bioError = new qx.ui.basic.Label("");
    bioError.setVisibility("excluded");
    bioError.addListenerOnce("appear", () => {
      bioError.getContentElement().addClass("text-error");
    });

    const genderLabel = new qx.ui.basic.Label("Gender");
    const genderSelect = new BsSelect(
      ["Man", "Woman", "Genderqueer/Non-Binary", "Prefer not to disclose"],
      "select-bordered",
    );
    genderSelect.setAllowGrowX(true);

    const genderError = new qx.ui.basic.Label("");
    genderError.setVisibility("excluded");
    genderError.addListenerOnce("appear", () => {
      genderError.getContentElement().addClass("text-error");
    });

    const actions = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
    actions.setAllowGrowX(true);
    actions.setMarginTop(12);
    const sendButton = new BsButton("Send", undefined, "btn-sm", "primary");
    const resetButton = new BsButton(
      "Reset",
      undefined,
      "btn-sm-outline",
      "outline",
    );

    sendButton.onClick(() => {
      let hasError = false;

      const name = nameInput.getValue().trim();
      const password = passwordInput.getValue().trim();
      const ageValue = ageInput.getValue().trim();
      const gender = genderSelect.getSelectedValue();

      if (!name) {
        setError(nameError, "Name is required");
        hasError = true;
      } else setError(nameError);

      if (!password) {
        setError(passwordError, "Password is required");
        hasError = true;
      } else if (password.length < 6) {
        setError(passwordError, "Password must be at least 6 characters");
        hasError = true;
      } else setError(passwordError);

      const age = Number(ageValue);
      if (!ageValue) {
        setError(ageError, "Age is required");
        hasError = true;
      } else if (Number.isNaN(age) || age < 0 || age > 120) {
        setError(ageError, "Age must be between 0 and 120");
        hasError = true;
      } else setError(ageError);

      if (!countryInput.getValue().trim()) {
        setError(countryError, "Country is required");
        hasError = true;
      } else setError(countryError);

      if (!gender) {
        genderError.setValue("Gender is required");
        genderError.show();
        hasError = true;
      } else {
        genderError.setValue("");
        genderError.exclude();
      }

      if (hasError) return;
      alert("send...");
    });

    resetButton.onClick(() => {
      nameInput.setValue("");
      passwordInput.setValue("");
      ageInput.setValue("50");
      countryInput.setValue("");
      bioInput.setValue("");
      setError(nameError);
      setError(passwordError);
      setError(ageError);
      setError(countryError);
      setError(bioError);
      genderSelect.resetSelection();
      genderError.setValue("");
      genderError.exclude();
    });

    actions.add(sendButton);
    actions.add(resetButton);

    this.add(nameLabel);
    this.add(nameInput);
    this.add(nameError);

    this.add(passwordLabel);
    this.add(passwordInput);
    this.add(passwordError);

    this.add(ageLabel);
    this.add(ageInput);
    this.add(ageError);

    this.add(countryLabel);
    this.add(countryInput);
    this.add(countryError);

    this.add(genderLabel);
    this.add(genderSelect);
    this.add(genderError);

    this.add(bioLabel);
    this.add(bioInput);
    this.add(bioError);
    this.add(actions);
  }
}
