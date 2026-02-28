/**
 * Create a sample form.
 */
class FormPage extends qx.ui.container.Composite {
  constructor() {
    super(new qx.ui.layout.VBox(3));

    const nameGroup = new BsInputGroup(
      "Name",
      "Enter your name",
      "",
      "input-bordered w-full",
    );
    const passwordGroup = new BsInputGroup(
      "Password",
      "Enter your password",
      "",
      "input-bordered w-full",
    );
    const ageGroup = new BsInputGroup(
      "Age",
      "Enter your age",
      "50",
      "input-bordered w-full",
    );
    const countryGroup = new BsInputGroup(
      "Country",
      "Enter your country",
      "",
      "input-bordered w-full",
    );
    const bioGroup = new BsInputGroup(
      "Bio",
      "Tell us about yourself",
      "",
      "input-bordered w-full",
    );

    const genderLabel = new qx.ui.basic.Label("Gender");
    const genderSelect = new BsSelect(
      ["Man", "Woman", "Genderqueer/Non-Binary", "Prefer not to disclose"],
      "select-bordered w-full",
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
    const sendButton = new BsButton(
      "Send",
      undefined,
      "btn-primary btn-sm w-full",
    );
    const resetButton = new BsButton(
      "Reset",
      undefined,
      "btn-outline btn-sm w-full",
    );

    sendButton.onClick(() => {
      let hasError = false;

      const name = nameGroup.getValue().trim();
      const password = passwordGroup.getValue().trim();
      const ageValue = ageGroup.getValue().trim();
      const gender = genderSelect.getSelectedValue();

      if (!name) {
        nameGroup.setError("Name is required");
        hasError = true;
      } else nameGroup.clearError();

      if (!password) {
        passwordGroup.setError("Password is required");
        hasError = true;
      } else if (password.length < 6) {
        passwordGroup.setError("Password must be at least 6 characters");
        hasError = true;
      } else passwordGroup.clearError();

      const age = Number(ageValue);
      if (!ageValue) {
        ageGroup.setError("Age is required");
        hasError = true;
      } else if (Number.isNaN(age) || age < 0 || age > 120) {
        ageGroup.setError("Age must be between 0 and 120");
        hasError = true;
      } else ageGroup.clearError();

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
      nameGroup.setValue("").clearError();
      passwordGroup.setValue("").clearError();
      ageGroup.setValue("50").clearError();
      countryGroup.setValue("").clearError();
      bioGroup.setValue("");
      genderSelect.resetSelection();
      genderError.setValue("");
      genderError.exclude();
    });

    actions.add(sendButton);
    actions.add(resetButton);

    this.add(nameGroup);
    this.add(passwordGroup);
    this.add(ageGroup);
    this.add(countryGroup);

    this.add(genderLabel);
    this.add(genderSelect);
    this.add(genderError);

    this.add(bioGroup);
    this.add(actions);
  }
}
