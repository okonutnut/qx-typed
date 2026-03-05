/**
 * Rooms management page — CRUD for rooms.
 */
class RoomsPage extends qx.ui.container.Composite {
  private __table!: qx.ui.table.Table;
  private __tableModel!: qx.ui.table.model.Simple;
  private __rows: RoomModel[] = [];

  constructor() {
    super(new qx.ui.layout.VBox(10));

    const toolbar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
    const addBtn = new BsButton(
      "Add Room",
      new InlineSvgIcon("plus", 16),
      "btn-sm",
      "primary",
    );
    addBtn.onClick(() => this.__showFormDialog());
    toolbar.add(addBtn);

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
    this.__tableModel.setColumns(["ID", "Name", "Building", "Capacity"]);

    this.__table = new qx.ui.table.Table(this.__tableModel);
    this.__table.set({ height: 400, decorator: null });
    this.__table.getTableColumnModel().setColumnVisible(0, false);
    this.__table
      .getSelectionModel()
      .setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
    this.add(this.__table, { flex: 1 });

    const actionBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
    const editBtn = new BsButton("Edit", undefined, "btn-sm", "outline");
    editBtn.onClick(() => this.__editSelected());
    const deleteBtn = new BsButton(
      "Delete",
      undefined,
      "btn-sm",
      "destructive",
    );
    deleteBtn.onClick(() => this.__deleteSelected());
    actionBar.add(editBtn);
    actionBar.add(deleteBtn);
    this.add(actionBar);

    this.__loadData();
  }

  private __loadData(): void {
    Api.get<RoomModel[]>("rooms.php").then((data) => {
      this.__rows = data;
      this.__tableModel.setData(
        data.map((r) => [r.id, r.name, r.building, r.capacity]),
      );
    });
  }

  private __getSelectedRow(): RoomModel | null {
    const sel = this.__table.getSelectionModel();
    const ranges = sel.getSelectedRanges();
    if (!ranges || ranges.length === 0) return null;
    const rowIndex = ranges[0].minIndex;
    const id = this.__tableModel.getValue(0, rowIndex) as number;
    return this.__rows.find((r) => r.id === id) ?? null;
  }

  private __showFormDialog(room?: RoomModel): void {
    const isEdit = !!room;
    const form = new qx.ui.container.Composite(new qx.ui.layout.VBox(6));
    form.setWidth(300);

    const nameInput = new BsInput(room?.name ?? "", "Room Name");
    nameInput.setAllowGrowX(true);
    const buildingInput = new BsInput(room?.building ?? "", "Building");
    buildingInput.setAllowGrowX(true);
    const capInput = new BsInput(String(room?.capacity ?? 0), "Capacity");
    capInput.setAllowGrowX(true);

    form.add(new qx.ui.basic.Label("Name"));
    form.add(nameInput);
    form.add(new qx.ui.basic.Label("Building"));
    form.add(buildingInput);
    form.add(new qx.ui.basic.Label("Capacity"));
    form.add(capInput);

    const dialog = new BsAlertDialog({
      id: isEdit ? "edit-room-dlg" : "add-room-dlg",
      title: isEdit ? "Edit Room" : "Add Room",
      children: form,
      continueLabel: isEdit ? "Save" : "Add",
      footerButtons: "ok-cancel",
      onContinue: () => {
        const body = {
          name: nameInput.getValue().trim(),
          building: buildingInput.getValue().trim(),
          capacity: parseInt(capInput.getValue().trim(), 10) || 0,
        };
        const promise = isEdit
          ? Api.put(`rooms.php?id=${room!.id}`, body)
          : Api.post("rooms.php", body);

        promise
          .then(() => this.__loadData())
          .catch((err: ApiError) => alert(err.message));
      },
    });
    dialog.show();
  }

  private __editSelected(): void {
    const row = this.__getSelectedRow();
    if (!row) return;
    this.__showFormDialog(row);
  }

  private __deleteSelected(): void {
    const row = this.__getSelectedRow();
    if (!row) return;

    const dialog = new BsAlertDialog({
      id: "delete-room-dlg",
      title: "Delete Room",
      description: `Are you sure you want to delete "${row.name}"?`,
      continueLabel: "Delete",
      footerButtons: "ok-cancel",
      onContinue: () => {
        Api.del(`rooms.php?id=${row.id}`)
          .then(() => this.__loadData())
          .catch((err: ApiError) => alert(err.message));
      },
    });
    dialog.show();
  }
}
