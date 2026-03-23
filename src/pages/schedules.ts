/**
 * Schedules management page — CRUD with conflict detection.
 */
class SchedulesPage extends qx.ui.container.Composite {
  private __table!: AgGridTable<ScheduleModel>;
  private __semesters: SemesterModel[] = [];
  private __faculty: FacultyModel[] = [];
  private __subjects: SubjectModel[] = [];
  private __rooms: RoomModel[] = [];
  private __activeSemesterId: number | null = null;
  private __semesterSelect!: BsSelect;

  constructor() {
    super(new qx.ui.layout.VBox(10));

    const toolbar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));

    const semLabel = new qx.ui.basic.Label("Semester:");
    semLabel.setAlignY("middle");
    toolbar.add(semLabel);

    this.__semesterSelect = new BsSelect([], "select-bordered select-sm");
    this.__semesterSelect.setWidth(220);
    this.__semesterSelect.onChange(() => this.__loadSchedules());
    toolbar.add(this.__semesterSelect);

    toolbar.add(new qx.ui.core.Spacer(), { flex: 1 });

    if (isAdmin()) {
      const addBtn = new BsButton(
        "Add Schedule",
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
    refreshBtn.onClick(() => this.__loadAll());
    toolbar.add(refreshBtn);
    this.add(toolbar);

    this.__table = new AgGridTable<ScheduleModel>(
      [
        { headerName: "ID", field: "id", hide: true },
        {
          headerName: "Subject",
          minWidth: 230,
          flex: 1.3,
          valueGetter: (row) => `${row.subjectCode} — ${row.subjectName}`,
        },
        { headerName: "Faculty", field: "facultyName", minWidth: 210, flex: 1.2 },
        {
          headerName: "Room",
          minWidth: 170,
          flex: 1,
          valueGetter: (row) => `${row.roomName} (${row.building})`,
        },
        { headerName: "Day", field: "dayOfWeek", minWidth: 90, flex: 0 },
        { headerName: "Start", field: "startTime", minWidth: 95, flex: 0 },
        { headerName: "End", field: "endTime", minWidth: 95, flex: 0 },
      ],
      {
        emptyMessage: "No schedules found for the selected semester.",
        rowId: (row) => String(row.id),
      },
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

    this.__loadAll();
  }

  private __loadAll(): void {
    Promise.all([
      Api.Queries.semesters(),
      Api.Queries.faculties(),
      Api.Queries.subjects(),
      Api.Queries.rooms(),
    ]).then(([semestersResult, facultyResult, subjectsResult, roomsResult]) => {
      this.__semesters = semestersResult.semesters;
      this.__faculty = facultyResult.faculties;
      this.__subjects = subjectsResult.subjects;
      this.__rooms = roomsResult.rooms;

      const active = this.__semesters.find((s) => s.isActive);
      this.__activeSemesterId = active ? active.id : null;

      const labels = this.__semesters.map((s) => `${s.name} — ${s.schoolYear}`);
      this.__semesterSelect = this.__rebuildSelect(
        this.__semesterSelect,
        labels,
      );
      if (active) {
        this.__semesterSelect.setSelectedByLabel(
          `${active.name} — ${active.schoolYear}`,
        );
      }

      this.__loadSchedules();
    });
  }

  private __rebuildSelect(old: BsSelect, options: string[]): BsSelect {
    const parent = old.getLayoutParent() as qx.ui.container.Composite;
    if (!parent) return old;
    const idx = parent.indexOf(old);
    parent.remove(old);

    const next = new BsSelect(options, "select-bordered select-sm");
    next.setWidth(220);
    next.onChange(() => this.__loadSchedules());
    parent.addAt(next, idx);
    return next;
  }

  private __getSelectedSemesterId(): number | null {
    const label = this.__semesterSelect.getSelectedValue();
    if (!label) return this.__activeSemesterId;
    const match = this.__semesters.find(
      (s) => `${s.name} — ${s.schoolYear}` === label,
    );
    return match ? match.id : this.__activeSemesterId;
  }

  private __loadSchedules(): void {
    const semId = this.__getSelectedSemesterId();

    Api.Queries.schedules().then((result) => {
      const schedules = semId 
        ? result.schedules.filter(s => s.semesterId === semId)
        : result.schedules;
      this.__table.setRows(schedules);
    });
  }

  private __getSelectedRow(): ScheduleModel | null {
    return this.__table.getSelectedRow();
  }

  private __showFormDialog(schedule?: ScheduleModel): void {
    const isEdit = !!schedule;
    const form = new qx.ui.container.Composite(new qx.ui.layout.VBox(6));
    form.setWidth(360);

    const subjectSelect = new BsSelect(
      this.__subjects.map((s) => `${s.code} — ${s.name}`),
    );
    subjectSelect.setAllowGrowX(true);
    if (schedule) {
      subjectSelect.setSelectedByLabel(
        `${schedule.subjectCode} — ${schedule.subjectName}`,
      );
    }

    const facultySelect = new BsSelect(
      this.__faculty.map((f) => `${f.employeeId} — ${f.fullName}`),
    );
    facultySelect.setAllowGrowX(true);
    if (schedule) {
      facultySelect.setSelectedByLabel(
        `${schedule.employeeId} — ${schedule.facultyName}`,
      );
    }

    const roomSelect = new BsSelect(
      this.__rooms.map((r) => `${r.name} (${r.building})`),
    );
    roomSelect.setAllowGrowX(true);
    if (schedule) {
      roomSelect.setSelectedByLabel(
        `${schedule.roomName} (${schedule.building})`,
      );
    }

    const daySelect = new BsSelect(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    daySelect.setAllowGrowX(true);
    if (schedule) daySelect.setSelectedByLabel(schedule.dayOfWeek);

    const startInput = new BsInput(
      schedule?.startTime ?? "",
      "Start Time (HH:MM)",
    );
    startInput.setAllowGrowX(true);
    const endInput = new BsInput(schedule?.endTime ?? "", "End Time (HH:MM)");
    endInput.setAllowGrowX(true);

    form.add(new qx.ui.basic.Label("Subject"));
    form.add(subjectSelect);
    form.add(new qx.ui.basic.Label("Faculty"));
    form.add(facultySelect);
    form.add(new qx.ui.basic.Label("Room"));
    form.add(roomSelect);
    form.add(new qx.ui.basic.Label("Day"));
    form.add(daySelect);
    form.add(new qx.ui.basic.Label("Start Time"));
    form.add(startInput);
    form.add(new qx.ui.basic.Label("End Time"));
    form.add(endInput);

    BsAlertDialog.show({
      title: isEdit ? "Edit Schedule" : "Add Schedule",
      children: form,
      continueLabel: isEdit ? "Save" : "Add",
      footerButtons: "ok-cancel",
      onContinue: () => {
        const subjectLabel = subjectSelect.getSelectedValue();
        const subjectCode = subjectLabel ? subjectLabel.split(" — ")[0] : "";
        const subject = this.__subjects.find((s) => s.code === subjectCode);

        const facultyLabel = facultySelect.getSelectedValue();
        const empId = facultyLabel ? facultyLabel.split(" — ")[0] : "";
        const faculty = this.__faculty.find((f) => f.employeeId === empId);

        const roomLabel = roomSelect.getSelectedValue();
        const roomName = roomLabel ? roomLabel.split(" (")[0] : "";
        const room = this.__rooms.find((r) => r.name === roomName);

        const semId = this.__getSelectedSemesterId();

        if (!subject || !faculty || !room || !semId) {
          alert("All fields are required");
          return;
        }

        const dayOfWeek = daySelect.getSelectedValue();
        const startTime = startInput.getValue().trim();
        const endTime = endInput.getValue().trim();

        const promise = isEdit
          ? Api.Mutations.updateSchedule(schedule!.id, subject.id, faculty.id, room.id, semId, dayOfWeek, startTime, endTime)
          : Api.Mutations.createSchedule(subject.id, faculty.id, room.id, semId, dayOfWeek, startTime, endTime);

        promise
          .then(() => this.__loadSchedules())
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
      title: "Delete Schedule",
      description: `Delete ${row.subjectCode} — ${row.facultyName} on ${row.dayOfWeek} ${row.startTime}-${row.endTime}?`,
      continueLabel: "Delete",
      footerButtons: "ok-cancel",
      onContinue: () => {
        Api.Mutations.deleteSchedule(row.id)
          .then(() => this.__loadSchedules())
          .catch((err: Error) => alert(err.message));
      },
    });
  }
}
