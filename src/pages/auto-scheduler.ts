interface ProposedSchedule {
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  employeeId: string;
  roomName: string;
  building: string;
  day: string;
  startTime: string;
  endTime: string;
  units: number;
  id?: number;
}

class AutoSchedulerWindow extends qx.ui.window.Window {
  private __subjects: SubjectModel[] = [];
  private __facultySubjects: FacultySubjectModel[] = [];
  private __faculty: FacultyModel[] = [];
  private __rooms: RoomModel[] = [];
  private __semesters: SemesterModel[] = [];
  private __existingSchedules: ScheduleModel[] = [];
  private __proposedSchedules: ProposedSchedule[] = [];
  private __table!: Table<ProposedSchedule>;
  private __loadingLabel!: qx.ui.basic.Label;
  private __isGenerating: boolean = false;

  constructor() {
    super("Auto-Schedule", undefined);

    this.setWidth(900);
    this.setHeight(600);
    this.setModal(true);
    this.setShowClose(true);
    this.setShowMaximize(false);
    this.setShowMinimize(false);

    this.setLayout(new qx.ui.layout.VBox(8));

    this.setBackgroundColor(AppColors.card());

    this.__setupUI();

    this.addListenerOnce("appear", () => {
      this.__loadData();
    });
  }

  private __setupUI(): void {
    this.__loadingLabel = new qx.ui.basic.Label("Generating schedule...");
    this.add(this.__loadingLabel);

    this.__table = new Table<ProposedSchedule>([
      { headerName: "ID", field: "id", hide: true },
      { headerName: "Subject Code", field: "subjectCode", width: 120 },
      { headerName: "Subject Name", field: "subjectName", width: 180 },
      { headerName: "Faculty", field: "facultyName", width: 150 },
      { headerName: "Room", field: "roomName", width: 100 },
      { headerName: "Building", field: "building", width: 100 },
      { headerName: "Day", field: "day", width: 100 },
      { headerName: "Start", field: "startTime", width: 80 },
      { headerName: "End", field: "endTime", width: 80 },
    ]);
    this.add(this.__table, { flex: 1 });

    const actionBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));

    const deleteBtn = new BsButton("Delete Selected", new InlineSvgIcon("trash-2", 16), {
      size: "sm",
      variant: "destructive",
    });
    deleteBtn.onClick(() => this.__deleteSelectedSchedule());
    actionBar.add(deleteBtn);

    actionBar.add(new qx.ui.core.Spacer(), { flex: 1 });

    const cancelBtn = new BsButton("Cancel", undefined, {
      size: "sm",
      variant: "outline",
    });
    cancelBtn.onClick(() => this.close());
    actionBar.add(cancelBtn);

    const confirmBtn = new BsButton("Confirm Schedule", new InlineSvgIcon("check", 16), {
      size: "sm",
      variant: "default",
    });
    confirmBtn.onClick(() => this.__saveAllSchedules());
    actionBar.add(confirmBtn);

    this.add(actionBar);
  }

  private async __loadData(): Promise<void> {
    const [subjectsResult, facultySubjectsResult, facultyResult, roomsResult, schedulesResult, semestersResult] =
      await Promise.all([
        Api.Queries.subjects(),
        Api.Queries.facultySubjects(),
        Api.Queries.faculties(),
        Api.Queries.rooms(),
        Api.Queries.schedules(),
        Api.Queries.semesters(),
      ]);

    this.__subjects = subjectsResult.subjects;
    this.__facultySubjects = facultySubjectsResult.facultySubjects;
    this.__faculty = facultyResult.faculties;
    this.__rooms = roomsResult.rooms;
    this.__semesters = semestersResult.semesters;
    this.__existingSchedules = schedulesResult.schedules;

    this.__filterByActiveSemester();
    this.__generateSchedules();
  }

  private __filterByActiveSemester(): void {
    const active = this.__semesters.find((s) => s.isActive);
    if (active) {
      this.__existingSchedules = this.__existingSchedules.filter(
        (s) => s.semesterId === active.id,
      );
    }
  }

  private __generateSchedules(): void {
    if (this.__isGenerating) return;
    this.__isGenerating = true;

    try {
      const params: AISchedulerParams = {
        subjects: this.__subjects,
        facultySubjects: this.__facultySubjects,
        faculty: this.__faculty,
        rooms: this.__rooms,
        existingSchedules: this.__existingSchedules,
      };

      const generated = SchedulerLocal.generate(params);
      this.__proposedSchedules = generated.map((s, i) => ({ ...s, id: i }));

      this.__table.setRows(this.__proposedSchedules);

      const scheduled = this.__proposedSchedules.length;
      const total = this.__subjects.length - this.__existingSchedules.length;
      if (scheduled < total) {
        BsToast.info(`${scheduled} of ${total} unscheduled subjects scheduled`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to generate schedule";
      BsToast.error(msg);
    } finally {
      this.__isGenerating = false;
      if (this.__loadingLabel) {
        this.__loadingLabel.destroy();
      }
    }
  }

  private async __saveAllSchedules(): Promise<void> {
    if (this.__proposedSchedules.length === 0) {
      BsToast.error("No schedules to save");
      return;
    }

    const semesterId = await this.__getActiveSemesterId();
    if (!semesterId) {
      BsToast.error("No active semester found");
      return;
    }

    let saved = 0;
    let failed = 0;

    for (const schedule of this.__proposedSchedules) {
      const subject = this.__subjects.find((s) => s.code === schedule.subjectCode);
      const faculty = this.__faculty.find((f) => f.fullName === schedule.facultyName);
      const room = this.__rooms.find((r) => r.name === schedule.roomName);

      if (!subject || !faculty || !room) {
        failed++;
        continue;
      }

      try {
        await Api.Mutations.createSchedule(
          subject.id,
          faculty.id,
          room.id,
          semesterId,
          [schedule.day],
          schedule.startTime,
          schedule.endTime,
        );
        saved++;
      } catch (e) {
        console.error("Failed to save schedule:", schedule, e);
        failed++;
      }
    }

    if (saved > 0) {
      BsToast.success(`Saved ${saved} schedule(s) successfully`);
    }
    if (failed > 0) {
      BsToast.error(`Failed to save ${failed} schedule(s)`);
    }

    if (saved > 0) {
      this.close();
    }
  }

  private __editSelectedSchedule(): void {
    const selected = this.__table.getSelectedRow();
    if (!selected) {
      BsToast.error("Please select a schedule to edit");
      return;
    }

    const index = this.__proposedSchedules.findIndex((s) => s.id === selected.id);
    if (index === -1) return;

    const schedule = this.__proposedSchedules[index];
    this.__showEditDialog(schedule, index);
  }

  private __deleteSelectedSchedule(): void {
    const selected = this.__table.getSelectedRow();
    if (!selected) {
      BsToast.error("Please select a schedule to delete");
      return;
    }

    const index = this.__proposedSchedules.findIndex((s) => s.id === selected.id);
    if (index === -1) return;

    this.__proposedSchedules.splice(index, 1);
    this.__table.setRows(this.__proposedSchedules);
    BsToast.success("Schedule deleted");
  }

  private __showEditDialog(schedule: ProposedSchedule, index: number): void {
    const form = new qx.ui.container.Composite(new qx.ui.layout.VBox(6));
    form.setWidth(320);

    const facultyLabels = this.__faculty.map(
      (f) => `${f.employeeId} — ${f.fullName}`,
    );
    const facultySelect = new BsSelect(facultyLabels);
    facultySelect.setAllowGrowX(true);
    const facultyMatch = this.__faculty.find(
      (f) => f.fullName === schedule.facultyName,
    );
    if (facultyMatch) {
      facultySelect.setSelectedByLabel(`${facultyMatch.employeeId} — ${facultyMatch.fullName}`);
    }

    const roomLabels = this.__rooms.map(
      (r) => `${r.name} (${r.building})`,
    );
    const roomSelect = new BsSelect(roomLabels);
    roomSelect.setAllowGrowX(true);
    const roomMatch = this.__rooms.find(
      (r) => r.name === schedule.roomName,
    );
    if (roomMatch) {
      roomSelect.setSelectedByLabel(`${roomMatch.name} (${roomMatch.building})`);
    }

    const daySelect = new BsSelect(DAYS_OF_WEEK);
    daySelect.setAllowGrowX(true);
    if (DAYS_OF_WEEK.indexOf(schedule.day) >= 0) {
      daySelect.setSelectedByLabel(schedule.day);
    }

    const startTimeInput = new qx.ui.embed.Html(
      `<input type="time" class="input bg-card text-foreground border-border w-full p-2 rounded-md" value="${schedule.startTime}">`,
    );
    startTimeInput.setAllowGrowX(true);

    const endTimeInput = new qx.ui.embed.Html(
      `<input type="time" class="input bg-card text-foreground border-border w-full p-2 rounded-md" value="${schedule.endTime}">`,
    );
    endTimeInput.setAllowGrowX(true);

    form.add(new qx.ui.basic.Label("Faculty"));
    form.add(facultySelect);
    form.add(new qx.ui.basic.Label("Room"));
    form.add(roomSelect);
    form.add(new qx.ui.basic.Label("Day"));
    form.add(daySelect);
    form.add(new qx.ui.basic.Label("Start Time"));
    form.add(startTimeInput);
    form.add(new qx.ui.basic.Label("End Time"));
    form.add(endTimeInput);

    BsAlertDialog.show({
      title: "Edit Schedule",
      children: form,
      continueLabel: "Save",
      footerButtons: "ok-cancel",
      onContinue: () => {
        const facLabel = facultySelect.getSelectedValue();
        const fac = this.__faculty.find(
          (f) => `${f.employeeId} — ${f.fullName}` === facLabel,
        );

        const roomLabel = roomSelect.getSelectedValue();
        const room = this.__rooms.find(
          (r) => `${r.name} (${r.building})` === roomLabel,
        );

        const startEl = startTimeInput
          .getContentElement()
          .getDomElement()
          ?.querySelector("input") as HTMLInputElement;
        const endEl = endTimeInput
          .getContentElement()
          .getDomElement()
          ?.querySelector("input") as HTMLInputElement;

        if (!fac || !room) {
          BsToast.error("Invalid faculty or room");
          return;
        }

        schedule.facultyName = fac.fullName;
        schedule.employeeId = fac.employeeId;
        schedule.roomName = room.name;
        schedule.building = room.building;
        schedule.day = daySelect.getSelectedValue() || schedule.day;
        schedule.startTime = startEl?.value || schedule.startTime;
        schedule.endTime = endEl?.value || schedule.endTime;

        this.__table.setRows(this.__proposedSchedules);
      },
    });
  }

  private async __getActiveSemesterId(): Promise<number | null> {
    const result = await Api.Queries.semesters();
    const active = result.semesters.find((s: SemesterModel) => s.isActive);
    return active ? active.id : null;
  }
}

function showAutoSchedulerWindow(): void {
  const win = new AutoSchedulerWindow();
  qx.core.Init.getApplication().getRoot().add(win);
  win.center();
  win.open();
}