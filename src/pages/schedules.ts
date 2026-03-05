/**
 * Schedules management page — CRUD with conflict detection.
 */
class SchedulesPage extends qx.ui.container.Composite {
  private __table!: qx.ui.table.Table;
  private __tableModel!: qx.ui.table.model.Simple;
  private __rows: ScheduleModel[] = [];
  private __semesters: SemesterModel[] = [];
  private __faculty: FacultyModel[] = [];
  private __subjects: SubjectModel[] = [];
  private __rooms: RoomModel[] = [];
  private __activeSemesterId: number | null = null;
  private __semesterSelect!: BsSelect;

  constructor() {
    super(new qx.ui.layout.VBox(10));

    // Toolbar: semester filter + actions
    const toolbar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));

    const semLabel = new qx.ui.basic.Label("Semester:");
    semLabel.setAlignY("middle");
    toolbar.add(semLabel);

    this.__semesterSelect = new BsSelect([], "select-bordered select-sm");
    this.__semesterSelect.setWidth(220);
    this.__semesterSelect.onChange(() => this.__loadSchedules());
    toolbar.add(this.__semesterSelect);

    toolbar.add(new qx.ui.core.Spacer(), { flex: 1 });

    const addBtn = new BsButton(
      "Add Schedule",
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
    refreshBtn.onClick(() => this.__loadAll());
    toolbar.add(refreshBtn);
    this.add(toolbar);

    // Table
    this.__tableModel = new qx.ui.table.model.Simple();
    this.__tableModel.setColumns([
      "ID",
      "Subject",
      "Faculty",
      "Room",
      "Day",
      "Start",
      "End",
    ]);

    this.__table = new qx.ui.table.Table(this.__tableModel);
    this.__table.set({ height: 400, decorator: null });
    this.__table.getTableColumnModel().setColumnVisible(0, false);
    this.__table
      .getSelectionModel()
      .setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
    this.add(this.__table, { flex: 1 });

    // Action bar
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

    this.__loadAll();
  }

  private __loadAll(): void {
    Promise.all([
      Api.get<SemesterModel[]>("semesters.php"),
      Api.get<FacultyModel[]>("faculty.php"),
      Api.get<SubjectModel[]>("subjects.php"),
      Api.get<RoomModel[]>("rooms.php"),
    ]).then(([semesters, faculty, subjects, rooms]) => {
      this.__semesters = semesters;
      this.__faculty = faculty;
      this.__subjects = subjects;
      this.__rooms = rooms;

      const active = semesters.find((s) => s.is_active);
      this.__activeSemesterId = active ? active.id : null;

      // Rebuild semester select options
      const labels = semesters.map((s) => `${s.name} — ${s.school_year}`);
      this.__semesterSelect = this.__rebuildSelect(
        this.__semesterSelect,
        labels,
      );
      if (active) {
        this.__semesterSelect.setSelectedByLabel(
          `${active.name} — ${active.school_year}`,
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
      (s) => `${s.name} — ${s.school_year}` === label,
    );
    return match ? match.id : this.__activeSemesterId;
  }

  private __loadSchedules(): void {
    const semId = this.__getSelectedSemesterId();
    const url = semId ? `schedules.php?semester_id=${semId}` : "schedules.php";

    Api.get<ScheduleModel[]>(url).then((data) => {
      this.__rows = data;
      this.__tableModel.setData(
        data.map((s) => [
          s.id,
          `${s.subject_code} — ${s.subject_name}`,
          s.faculty_name,
          `${s.room_name} (${s.building})`,
          s.day_of_week,
          s.start_time,
          s.end_time,
        ]),
      );
    });
  }

  private __getSelectedRow(): ScheduleModel | null {
    const sel = this.__table.getSelectionModel();
    const ranges = sel.getSelectedRanges();
    if (!ranges || ranges.length === 0) return null;
    const rowIndex = ranges[0].minIndex;
    const id = this.__tableModel.getValue(0, rowIndex) as number;
    return this.__rows.find((r) => r.id === id) ?? null;
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
        `${schedule.subject_code} — ${schedule.subject_name}`,
      );
    }

    const facultySelect = new BsSelect(
      this.__faculty.map((f) => `${f.employee_id} — ${f.full_name}`),
    );
    facultySelect.setAllowGrowX(true);
    if (schedule) {
      facultySelect.setSelectedByLabel(
        `${schedule.employee_id} — ${schedule.faculty_name}`,
      );
    }

    const roomSelect = new BsSelect(
      this.__rooms.map((r) => `${r.name} (${r.building})`),
    );
    roomSelect.setAllowGrowX(true);
    if (schedule) {
      roomSelect.setSelectedByLabel(
        `${schedule.room_name} (${schedule.building})`,
      );
    }

    const daySelect = new BsSelect(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    daySelect.setAllowGrowX(true);
    if (schedule) daySelect.setSelectedByLabel(schedule.day_of_week);

    const startInput = new BsInput(
      schedule?.start_time ?? "",
      "Start Time (HH:MM)",
    );
    startInput.setAllowGrowX(true);
    const endInput = new BsInput(schedule?.end_time ?? "", "End Time (HH:MM)");
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

    const dialog = new BsAlertDialog({
      id: isEdit ? "edit-schedule-dlg" : "add-schedule-dlg",
      title: isEdit ? "Edit Schedule" : "Add Schedule",
      children: form,
      continueLabel: isEdit ? "Save" : "Add",
      footerButtons: "ok-cancel",
      onContinue: () => {
        // Resolve IDs from select labels
        const subjectLabel = subjectSelect.getSelectedValue();
        const subjectCode = subjectLabel ? subjectLabel.split(" — ")[0] : "";
        const subject = this.__subjects.find((s) => s.code === subjectCode);

        const facultyLabel = facultySelect.getSelectedValue();
        const empId = facultyLabel ? facultyLabel.split(" — ")[0] : "";
        const faculty = this.__faculty.find((f) => f.employee_id === empId);

        const roomLabel = roomSelect.getSelectedValue();
        const roomName = roomLabel ? roomLabel.split(" (")[0] : "";
        const room = this.__rooms.find((r) => r.name === roomName);

        const semId = this.__getSelectedSemesterId();

        if (!subject || !faculty || !room || !semId) {
          alert("All fields are required");
          return;
        }

        const body = {
          subject_id: subject.id,
          faculty_id: faculty.id,
          room_id: room.id,
          semester_id: semId,
          day_of_week: daySelect.getSelectedValue(),
          start_time: startInput.getValue().trim(),
          end_time: endInput.getValue().trim(),
        };

        const promise = isEdit
          ? Api.put(`schedules.php?id=${schedule!.id}`, body)
          : Api.post("schedules.php", body);

        promise
          .then(() => this.__loadSchedules())
          .catch((err: ApiError) => {
            // Show conflict details if available
            if (err.data && err.data.conflicts) {
              alert(err.data.conflicts.join("\n"));
            } else {
              alert(err.message);
            }
          });
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
      id: "delete-schedule-dlg",
      title: "Delete Schedule",
      description: `Delete ${row.subject_code} — ${row.faculty_name} on ${row.day_of_week} ${row.start_time}-${row.end_time}?`,
      continueLabel: "Delete",
      footerButtons: "ok-cancel",
      onContinue: () => {
        Api.del(`schedules.php?id=${row.id}`)
          .then(() => this.__loadSchedules())
          .catch((err: ApiError) => alert(err.message));
      },
    });
    dialog.show();
  }
}
