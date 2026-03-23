/**
 * Subjects management page — CRUD for academic subjects.
 */
class SubjectsPage extends qx.ui.container.Composite {
  private __table!: AgGridTable<SubjectModel>;

  constructor() {
    super(new qx.ui.layout.VBox(10));

    const toolbar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
    if (isAdmin()) {
      const addBtn = new BsButton(
        "New",
        new InlineSvgIcon("plus", 16),
        { size: "sm", variant: "default" },
      );
      addBtn.onClick(() => this.__showFormDialog());
      toolbar.add(addBtn);
    }

    const refreshBtn = new BsButton(
      "Refresh",
      new InlineSvgIcon("refresh-cw", 16),
      { size: "sm", variant: "outline" },
    );
    refreshBtn.onClick(() => this.__loadData());
    toolbar.add(refreshBtn);
    this.add(toolbar);

    this.__table = new AgGridTable<SubjectModel>(
      [
        { headerName: "ID", field: "id", hide: true },
        { headerName: "Code", field: "code", minWidth: 120, flex: 0 },
        { headerName: "Name", field: "name", minWidth: 220, flex: 1.3 },
        { headerName: "Units", field: "units", minWidth: 90, flex: 0 },
        {
          headerName: "Description",
          field: "description",
          minWidth: 260,
          flex: 1.8,
        },
      ],
      { emptyMessage: "No subjects available.", rowId: (row) => String(row.id) },
    );
    this.add(this.__table, { flex: 1 });

    if (isAdmin()) {
      const actionBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
      const editBtn = new BsButton(
        "Edit",
        undefined,
        { size: "sm", variant: "outline" },
      );
      editBtn.setWidth(120);
      editBtn.onClick(() => this.__editSelected());
      const deleteBtn = new BsButton(
        "Delete",
        undefined,
        { size: "sm", variant: "destructive" },
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
    Api.Queries.subjects().then((result) => {
      this.__table.setRows(result.subjects);
    });
  }

  private __getSelectedRow(): SubjectModel | null {
    return this.__table.getSelectedRow();
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
        const code = codeInput.getValue().trim();
        const name = nameInput.getValue().trim();
        const units = parseInt(unitsInput.getValue().trim(), 10) || 3;
        const description = descInput.getValue().trim();

        const promise = isEdit
          ? Api.Mutations.updateSubject(subject!.id, code, name, units, description)
          : Api.Mutations.createSubject(code, name, units, description);

        promise
          .then(() => this.__loadData())
          .catch((err: Error) => alert(err.message));
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
        Api.Mutations.deleteSubject(row.id)
          .then(() => this.__loadData())
          .catch((err: Error) => alert(err.message));
      },
    });
  }
}
