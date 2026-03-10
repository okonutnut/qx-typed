/**
 * Subjects management page — CRUD for academic subjects.
 */
class SubjectsPage extends qx.ui.container.Composite {
  private __table!: qx.ui.table.Table;
  private __tableModel!: qx.ui.table.model.Simple;
  private __rows: SubjectModel[] = [];

  constructor() {
    super(new qx.ui.layout.VBox(10));

    const toolbar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
    if (isAdmin()) {
      const addBtn = new BsButton(
        "Add New",
        new InlineSvgIcon("plus", 16),
        "btn-sm",
        "primary",
      );
      addBtn.onClick(() => this.__showFormDialog());
      toolbar.add(addBtn);
    }

    const refreshBtn = new BsButton(
      "Refresh",
      new InlineSvgIcon("refresh-cw", 16),
      "btn-sm-outline",
    );
    refreshBtn.onClick(() => this.__loadData());
    toolbar.add(refreshBtn);
    this.add(toolbar);

    this.__tableModel = new qx.ui.table.model.Simple();
    this.__tableModel.setColumns([
      "ID",
      "Code",
      "Name",
      "Units",
      "Description",
    ]);

    this.__table = new qx.ui.table.Table(this.__tableModel);
    this.__table.set({ height: 400, decorator: null });
    this.__table.getTableColumnModel().setColumnVisible(0, false);
    this.__table
      .getSelectionModel()
      .setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
    this.add(this.__table, { flex: 1 });

    if (isAdmin()) {
      const actionBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
      const editBtn = new BsButton(
        "Edit",
        undefined,
        "btn-sm-outline",
        "outline",
      );
      editBtn.setWidth(120);
      editBtn.onClick(() => this.__editSelected());
      const deleteBtn = new BsButton(
        "Delete",
        undefined,
        "btn-sm-destructive",
        "destructive",
      );
      deleteBtn.setWidth(120);
      deleteBtn.onClick(() => this.__deleteSelected());
      actionBar.add(editBtn);
      actionBar.add(deleteBtn);
      this.add(actionBar);
    }

    this.__loadData();
  }

  private __loadData(): void {
    Api.get<SubjectModel[]>("subjects.php").then((data) => {
      this.__rows = data;
      this.__tableModel.setData(
        data.map((s) => [s.id, s.code, s.name, s.units, s.description]),
      );
    });
  }

  private __getSelectedRow(): SubjectModel | null {
    const sel = this.__table.getSelectionModel();
    const ranges = sel.getSelectedRanges();
    if (!ranges || ranges.length === 0) return null;
    const rowIndex = ranges[0].minIndex;
    const id = this.__tableModel.getValue(0, rowIndex) as number;
    return this.__rows.find((r) => r.id === id) ?? null;
  }

  private __showFormDialog(subject?: SubjectModel): void {
    const isEdit = !!subject;

    const form = new qx.ui.container.Composite(new qx.ui.layout.VBox(6));
    form.setWidth(320);

    const codeInput = new BsInput(
      subject?.code ?? "",
      "Subject Code (e.g. CS101)",
    );
    codeInput.setAllowGrowX(true);
    const nameInput = new BsInput(subject?.name ?? "", "Subject Name");
    nameInput.setAllowGrowX(true);
    const unitsInput = new BsInput(String(subject?.units ?? 3), "Units");
    unitsInput.setAllowGrowX(true);
    const descInput = new BsInput(subject?.description ?? "", "Description");
    descInput.setAllowGrowX(true);

    form.add(new qx.ui.basic.Label("Code"));
    form.add(codeInput);
    form.add(new qx.ui.basic.Label("Name"));
    form.add(nameInput);
    form.add(new qx.ui.basic.Label("Units"));
    form.add(unitsInput);
    form.add(new qx.ui.basic.Label("Description"));
    form.add(descInput);

    BsAlertDialog.show({
      title: isEdit ? "Edit Subject" : "Add Subject",
      children: form,
      continueLabel: isEdit ? "Save" : "Add",
      footerButtons: "ok-cancel",
      onContinue: () => {
        const body = {
          code: codeInput.getValue().trim(),
          name: nameInput.getValue().trim(),
          units: parseInt(unitsInput.getValue().trim(), 10) || 3,
          description: descInput.getValue().trim(),
        };
        const promise = isEdit
          ? Api.put(`subjects.php?id=${subject!.id}`, body)
          : Api.post("subjects.php", body);

        promise
          .then(() => this.__loadData())
          .catch((err: ApiError) => alert(err.message));
      },
    });
  }

  private __editSelected(): void {
    const row = this.__getSelectedRow();
    if (!row) return;
    this.__showFormDialog(row);
  }

  private __deleteSelected(): void {
    const row = this.__getSelectedRow();
    if (!row) return;

    BsAlertDialog.show({
      title: "Delete Subject",
      description: `Are you sure you want to delete "${row.code} — ${row.name}"?`,
      continueLabel: "Delete",
      footerButtons: "ok-cancel",
      onContinue: () => {
        Api.del(`subjects.php?id=${row.id}`)
          .then(() => this.__loadData())
          .catch((err: ApiError) => alert(err.message));
      },
    });
  }
}
