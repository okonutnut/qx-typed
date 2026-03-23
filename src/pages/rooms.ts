/**
 * Rooms management page — CRUD for rooms.
 */
class RoomsPage extends qx.ui.container.Composite {
  private __table!: AgGridTable<RoomModel>;

  constructor() {
    super(new qx.ui.layout.VBox(10));

    const toolbar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
    if (isAdmin()) {
      const addBtn = new BsButton(
        "Add Room",
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

    this.__table = new AgGridTable<RoomModel>(
      [
        { headerName: "ID", field: "id", hide: true },
        { headerName: "Name", field: "name", minWidth: 140, flex: 1 },
        { headerName: "Building", field: "building", minWidth: 160, flex: 1 },
        { headerName: "Capacity", field: "capacity", minWidth: 110, flex: 0 },
      ],
      { emptyMessage: "No rooms available.", rowId: (row) => String(row.id) },
    );
    this.add(this.__table, { flex: 1 });

    if (isAdmin()) {
      const actionBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
      const editBtn = new BsButton("Edit", undefined, { size: "sm", variant: "outline" });
      editBtn.onClick(() => this.__editSelected());
      const deleteBtn = new BsButton(
        "Delete",
        undefined,
        { size: "sm", variant: "destructive" },
      );
      deleteBtn.onClick(() => this.__deleteSelected());
      actionBar.add(editBtn);
      actionBar.add(deleteBtn);
      this.add(actionBar);
    }

    this.__loadData();
  }

  private __loadData(): void {
    Api.Queries.rooms().then((result) => {
      this.__table.setRows(result.rooms);
    });
  }

  private __getSelectedRow(): RoomModel | null {
    return this.__table.getSelectedRow();
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

    BsAlertDialog.show({
      title: isEdit ? "Edit Room" : "Add Room",
      children: form,
      continueLabel: isEdit ? "Save" : "Add",
      footerButtons: "ok-cancel",
      onContinue: () => {
        const name = nameInput.getValue().trim();
        const building = buildingInput.getValue().trim();
        const capacity = parseInt(capInput.getValue().trim(), 10) || 0;

        const promise = isEdit
          ? Api.Mutations.updateRoom(room!.id, name, building, capacity)
          : Api.Mutations.createRoom(name, building, capacity);

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
      title: "Delete Room",
      description: `Are you sure you want to delete "${row.name}"?`,
      continueLabel: "Delete",
      footerButtons: "ok-cancel",
      onContinue: () => {
        Api.Mutations.deleteRoom(row.id)
          .then(() => this.__loadData())
          .catch((err: Error) => alert(err.message));
      },
    });
  }
}
