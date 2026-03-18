/**
 * Semesters management page — CRUD + set active semester.
 */
class SemestersPage extends qx.ui.container.Composite {
  private __table!: AgGridTable<SemesterModel>;

  constructor() {
    super(new qx.ui.layout.VBox(10));

    const toolbar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
    if (isAdmin()) {
      const addBtn = new BsButton(
        "Add Semester",
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
      "btn-sm",
      "outline",
    );
    refreshBtn.onClick(() => this.__loadData());
    toolbar.add(refreshBtn);
    this.add(toolbar);

    this.__table = new AgGridTable<SemesterModel>(
      [
        { headerName: "ID", field: "id", hide: true },
        { headerName: "Name", field: "name", minWidth: 180, flex: 1 },
        {
          headerName: "School Year",
          field: "schoolYear",
          minWidth: 160,
          flex: 1,
        },
        {
          headerName: "Status",
          field: "isActive",
          minWidth: 120,
          flex: 0,
          valueFormatter: (value) => (value ? "Active" : "Inactive"),
        },
      ],
      {
        emptyMessage: "No semesters configured.",
        rowId: (row) => String(row.id),
      },
    );
    this.add(this.__table, { flex: 1 });

    if (isAdmin()) {
      const actionBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
      const activateBtn = new BsButton(
        "Set Active",
        undefined,
        "btn-sm",
        "primary",
      );
      activateBtn.onClick(() => this.__activateSelected());
      const editBtn = new BsButton("Edit", undefined, "btn-sm", "outline");
      editBtn.onClick(() => this.__editSelected());
      const deleteBtn = new BsButton(
        "Delete",
        undefined,
        "btn-sm",
        "destructive",
      );
      deleteBtn.onClick(() => this.__deleteSelected());
      actionBar.add(activateBtn);
      actionBar.add(editBtn);
      actionBar.add(deleteBtn);
      this.add(actionBar);
    }

    this.__loadData();
  }

  private __loadData(): void {
    Api.Queries.semesters().then((result) => {
      this.__table.setRows(result.semesters);
    });
  }

  private __getSelectedRow(): SemesterModel | null {
    return this.__table.getSelectedRow();
  }

  private __showFormDialog(semester?: SemesterModel): void {
    const isEdit = !!semester;
    const form = new qx.ui.container.Composite(new qx.ui.layout.VBox(6));
    form.setWidth(300);

    const nameSelect = new BsSelect(["1st Semester", "2nd Semester", "Summer"]);
    nameSelect.setAllowGrowX(true);
    if (semester) nameSelect.setSelectedByLabel(semester.name);

    const yearInput = new BsInput(
      semester?.schoolYear ?? "",
      "School Year (e.g. 2025-2026)",
    );
    yearInput.setAllowGrowX(true);

    form.add(new qx.ui.basic.Label("Semester"));
    form.add(nameSelect);
    form.add(new qx.ui.basic.Label("School Year"));
    form.add(yearInput);

    BsAlertDialog.show({
      title: isEdit ? "Edit Semester" : "Add Semester",
      children: form,
      continueLabel: isEdit ? "Save" : "Add",
      footerButtons: "ok-cancel",
      onContinue: () => {
        const name = nameSelect.getSelectedValue();
        const schoolYear = yearInput.getValue().trim();
        if (!name || !schoolYear) {
          alert("All fields are required");
          return;
        }
        const promise = isEdit
          ? Api.Mutations.updateSemester(semester!.id, name, schoolYear, semester!.isActive)
          : Api.Mutations.createSemester(name, schoolYear, 0);

        promise
          .then(() => this.__loadData())
          .catch((err: Error) => alert(err.message));
      },
    });
  }

  private __activateSelected(): void {
    const row = this.__getSelectedRow();
    if (!row) return;

    Api.Mutations.updateSemester(row.id, row.name, row.schoolYear, 1)
      .then(() => this.__loadData())
      .catch((err: Error) => alert(err.message));
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
      title: "Delete Semester",
      description: `Are you sure you want to delete "${row.name} (${row.schoolYear})"?`,
      continueLabel: "Delete",
      footerButtons: "ok-cancel",
      onContinue: () => {
        Api.Mutations.deleteSemester(row.id)
          .then(() => this.__loadData())
          .catch((err: Error) => alert(err.message));
      },
    });
  }
}
