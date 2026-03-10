/**
 * Faculty management page — CRUD for faculty members + subject assignments.
 */
class FacultyPage extends qx.ui.container.Composite {
  private __table!: qx.ui.table.Table;
  private __tableModel!: qx.ui.table.model.Simple;
  private __rows: FacultyModel[] = [];

  constructor() {
    super(new qx.ui.layout.VBox(10));

    const toolbar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
    if (isAdmin()) {
      const addBtn = new BsButton(
        "Add Faculty",
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
    this.__tableModel.setColumns([
      "ID",
      "Employee ID",
      "Full Name",
      "Department",
      "Specialization",
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
      const editBtn = new BsButton("Edit", undefined, "btn-sm", "outline");
      editBtn.onClick(() => this.__editSelected());
      const deleteBtn = new BsButton(
        "Delete",
        undefined,
        "btn-sm",
        "destructive",
      );
      deleteBtn.onClick(() => this.__deleteSelected());
      const assignBtn = new BsButton(
        "Assign Subjects",
        undefined,
        "btn-sm",
        "secondary",
      );
      assignBtn.onClick(() => this.__assignSubjects());
      actionBar.add(editBtn);
      actionBar.add(deleteBtn);
      actionBar.add(assignBtn);
      this.add(actionBar);
    }

    this.__loadData();
  }

  private __loadData(): void {
    Api.get<FacultyModel[]>("faculty.php").then((data) => {
      this.__rows = data;
      this.__tableModel.setData(
        data.map((f) => [
          f.id,
          f.employee_id,
          f.full_name,
          f.department,
          f.specialization,
        ]),
      );
    });
  }

  private __getSelectedRow(): FacultyModel | null {
    const sel = this.__table.getSelectionModel();
    const ranges = sel.getSelectedRanges();
    if (!ranges || ranges.length === 0) return null;
    const rowIndex = ranges[0].minIndex;
    const id = this.__tableModel.getValue(0, rowIndex) as number;
    return this.__rows.find((r) => r.id === id) ?? null;
  }

  private __showFormDialog(faculty?: FacultyModel): void {
    const isEdit = !!faculty;
    const form = new qx.ui.container.Composite(new qx.ui.layout.VBox(6));
    form.setWidth(320);

    const eidInput = new BsInput(faculty?.employee_id ?? "", "Employee ID");
    eidInput.setAllowGrowX(true);
    const nameInput = new BsInput(faculty?.full_name ?? "", "Full Name");
    nameInput.setAllowGrowX(true);
    const deptInput = new BsInput(faculty?.department ?? "", "Department");
    deptInput.setAllowGrowX(true);
    const specInput = new BsInput(
      faculty?.specialization ?? "",
      "Specialization",
    );
    specInput.setAllowGrowX(true);

    form.add(new qx.ui.basic.Label("Employee ID"));
    form.add(eidInput);
    form.add(new qx.ui.basic.Label("Full Name"));
    form.add(nameInput);
    form.add(new qx.ui.basic.Label("Department"));
    form.add(deptInput);
    form.add(new qx.ui.basic.Label("Specialization"));
    form.add(specInput);

    BsAlertDialog.show({
      title: isEdit ? "Edit Faculty" : "Add Faculty",
      children: form,
      continueLabel: isEdit ? "Save" : "Add",
      footerButtons: "ok-cancel",
      onContinue: () => {
        const body = {
          employee_id: eidInput.getValue().trim(),
          full_name: nameInput.getValue().trim(),
          department: deptInput.getValue().trim(),
          specialization: specInput.getValue().trim(),
        };
        const promise = isEdit
          ? Api.put(`faculty.php?id=${faculty!.id}`, body)
          : Api.post("faculty.php", body);

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
      title: "Delete Faculty",
      description: `Are you sure you want to delete "${row.full_name}"?`,
      continueLabel: "Delete",
      footerButtons: "ok-cancel",
      onContinue: () => {
        Api.del(`faculty.php?id=${row.id}`)
          .then(() => this.__loadData())
          .catch((err: ApiError) => alert(err.message));
      },
    });
  }

  private __assignSubjects(): void {
    const row = this.__getSelectedRow();
    if (!row) return;

    Promise.all([
      Api.get<FacultySubjectModel[]>(
        `faculty-subjects.php?faculty_id=${row.id}`,
      ),
      Api.get<SubjectModel[]>("subjects.php"),
    ]).then(([assigned, allSubjects]) => {
      const assignedIds = new Set(assigned.map((a) => a.subject_id));

      const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(4));
      container.setWidth(360);

      const info = new qx.ui.basic.Label(
        `Manage subject assignments for ${row.full_name}`,
      );
      info.setWrap(true);
      info.setTextColor(AppColors.mutedForeground());
      container.add(info);

      // Current assignments list
      const currentLabel = new qx.ui.basic.Label("Current Assignments:");
      currentLabel.setFont(
        // @ts-ignore
        new qx.bom.Font(12).set({ bold: true }),
      );
      container.add(currentLabel);

      const assignmentList = new qx.ui.container.Composite(
        new qx.ui.layout.VBox(2),
      );

      const renderAssignments = (currentAssigned: FacultySubjectModel[]) => {
        assignmentList.removeAll();
        if (currentAssigned.length === 0) {
          const none = new qx.ui.basic.Label("No subjects assigned");
          none.setTextColor(AppColors.mutedForeground());
          assignmentList.add(none);
        } else {
          currentAssigned.forEach((a) => {
            const rowWidget = new qx.ui.container.Composite(
              new qx.ui.layout.HBox(4).set({ alignY: "middle" }),
            );
            const label = new qx.ui.basic.Label(`${a.code} — ${a.name}`);
            const removeBtn = new BsButton(
              "Remove",
              undefined,
              "btn-sm",
              "destructive",
            );
            removeBtn.onClick(() => {
              Api.del(`faculty-subjects.php?id=${a.id}`).then(() => {
                const idx = currentAssigned.indexOf(a);
                if (idx !== -1) currentAssigned.splice(idx, 1);
                assignedIds.delete(a.subject_id);
                renderAssignments(currentAssigned);
              });
            });
            rowWidget.add(label, { flex: 1 });
            rowWidget.add(removeBtn);
            assignmentList.add(rowWidget);
          });
        }
      };
      renderAssignments(assigned);
      container.add(assignmentList);

      // Add new assignment
      const unassigned = allSubjects.filter((s) => !assignedIds.has(s.id));
      if (unassigned.length > 0) {
        const addLabel = new qx.ui.basic.Label("Add Subject:");
        addLabel.setMarginTop(8);
        addLabel.setFont(
          // @ts-ignore
          new qx.bom.Font(12).set({ bold: true }),
        );
        container.add(addLabel);

        const subjectSelect = new BsSelect(
          unassigned.map((s) => `${s.code} — ${s.name}`),
        );
        subjectSelect.setAllowGrowX(true);
        container.add(subjectSelect);

        const addAssignBtn = new BsButton(
          "Assign",
          undefined,
          "btn-sm",
          "primary",
        );
        addAssignBtn.onClick(() => {
          const selectedLabel = subjectSelect.getSelectedValue();
          if (!selectedLabel) return;
          const selectedCode = selectedLabel.split(" — ")[0];
          const subject = allSubjects.find((s) => s.code === selectedCode);
          if (!subject) return;

          Api.post("faculty-subjects.php", {
            faculty_id: row.id,
            subject_id: subject.id,
          }).then((result) => {
            assignedIds.add(subject.id);
            assigned.push({
              id: result.id,
              faculty_id: row.id,
              subject_id: subject.id,
              code: subject.code,
              name: subject.name,
              units: subject.units,
            });
            renderAssignments(assigned);
          });
        });
        container.add(addAssignBtn);
      }

      BsAlertDialog.show({
        title: "Assign Subjects",
        children: container,
        footerButtons: "cancel",
        cancelLabel: "Close",
      });
    });
  }
}
