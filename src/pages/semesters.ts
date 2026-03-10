/**
 * Semesters management page — CRUD + set active semester.
 */
class SemestersPage extends qx.ui.container.Composite {
  private __table!: qx.ui.table.Table;
  private __tableModel!: qx.ui.table.model.Simple;
  private __rows: SemesterModel[] = [];

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

    this.__tableModel = new qx.ui.table.model.Simple();
    this.__tableModel.setColumns(["ID", "Name", "School Year", "Active"]);

    this.__table = new qx.ui.table.Table(this.__tableModel);
    this.__table.set({ height: 400, decorator: null });
    this.__table.getTableColumnModel().setColumnVisible(0, false);
    this.__table
      .getTableColumnModel()
      .setDataCellRenderer(3, new qx.ui.table.cellrenderer.Boolean());
    this.__table
      .getSelectionModel()
      .setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
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
    Api.get<SemesterModel[]>("semesters.php").then((data) => {
      this.__rows = data;
      this.__tableModel.setData(
        data.map((s) => [s.id, s.name, s.school_year, !!s.is_active]),
      );
    });
  }

  private __getSelectedRow(): SemesterModel | null {
    const sel = this.__table.getSelectionModel();
    const ranges = sel.getSelectedRanges();
    if (!ranges || ranges.length === 0) return null;
    const rowIndex = ranges[0].minIndex;
    const id = this.__tableModel.getValue(0, rowIndex) as number;
    return this.__rows.find((r) => r.id === id) ?? null;
  }

  private __showFormDialog(semester?: SemesterModel): void {
    const isEdit = !!semester;
    const form = new qx.ui.container.Composite(new qx.ui.layout.VBox(6));
    form.setWidth(300);

    const nameSelect = new BsSelect(["1st Semester", "2nd Semester", "Summer"]);
    nameSelect.setAllowGrowX(true);
    if (semester) nameSelect.setSelectedByLabel(semester.name);

    const yearInput = new BsInput(
      semester?.school_year ?? "",
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
        const body = {
          name: nameSelect.getSelectedValue(),
          school_year: yearInput.getValue().trim(),
        };
        if (!body.name || !body.school_year) {
          alert("All fields are required");
          return;
        }
        const promise = isEdit
          ? Api.put(`semesters.php?id=${semester!.id}`, body)
          : Api.post("semesters.php", body);

        promise
          .then(() => this.__loadData())
          .catch((err: ApiError) => alert(err.message));
      },
    });
  }

  private __activateSelected(): void {
    const row = this.__getSelectedRow();
    if (!row) return;

    Api.put(`semesters.php?id=${row.id}&activate=1`, {})
      .then(() => this.__loadData())
      .catch((err: ApiError) => alert(err.message));
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
      description: `Are you sure you want to delete "${row.name} (${row.school_year})"?`,
      continueLabel: "Delete",
      footerButtons: "ok-cancel",
      onContinue: () => {
        Api.del(`semesters.php?id=${row.id}`)
          .then(() => this.__loadData())
          .catch((err: ApiError) => alert(err.message));
      },
    });
  }
}
