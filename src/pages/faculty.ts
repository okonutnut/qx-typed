/**
 * Faculty management page — CRUD for faculty members + subject assignments.
 */
class FacultyPage extends qx.ui.container.Composite {
  private __table!: AgGridTable<FacultyModel>;

  constructor() {
    super(new qx.ui.layout.VBox(10));

    const toolbar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
    if (isAdmin()) {
      const addBtn = new BsButton(
        "Add New",
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

    this.__table = new AgGridTable<FacultyModel>(
      [
        { headerName: "ID", field: "id", hide: true },
        {
          headerName: "Employee ID",
          field: "employeeId",
          minWidth: 140,
          flex: 0,
        },
        { headerName: "Full Name", field: "fullName", minWidth: 220, flex: 1.2 },
        { headerName: "Department", field: "department", minWidth: 180, flex: 1 },
        {
          headerName: "Specialization",
          field: "specialization",
          minWidth: 220,
          flex: 1.2,
        },
      ],
      {
        emptyMessage: "No faculty records found.",
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
      const assignBtn = new BsButton(
        "Assign",
        undefined,
        { size: "sm", variant: "secondary" },
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
    Api.Queries.faculties().then((result) => {
      this.__table.setRows(result.faculties);
    });
  }

  private __getSelectedRow(): FacultyModel | null {
    return this.__table.getSelectedRow();
  }

  private __showFormDialog(faculty?: FacultyModel): void {
    const isEdit = !!faculty;
    const form = new qx.ui.container.Composite(new qx.ui.layout.VBox(6));
    form.setWidth(320);

    const eidInput = new BsInput(faculty?.employeeId ?? "", "Employee ID");
    eidInput.setAllowGrowX(true);
    const nameInput = new BsInput(faculty?.fullName ?? "", "Full Name");
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
        const employeeId = eidInput.getValue().trim();
        const fullName = nameInput.getValue().trim();
        const department = deptInput.getValue().trim();
        const specialization = specInput.getValue().trim();

        const promise = isEdit
          ? Api.Mutations.updateFaculty(faculty!.id, faculty!.userId, employeeId, fullName, department, specialization)
          : Api.Mutations.createFaculty(null, employeeId, fullName, department, specialization);

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
      title: "Delete Faculty",
      description: `Are you sure you want to delete "${row.fullName}"?`,
      continueLabel: "Delete",
      footerButtons: "ok-cancel",
      onContinue: () => {
        Api.Mutations.deleteFaculty(row.id)
          .then(() => this.__loadData())
          .catch((err: Error) => alert(err.message));
      },
    });
  }

  private __assignSubjects(): void {
    const row = this.__getSelectedRow();
    if (!row) return;

    Promise.all([
      Api.Queries.facultySubjectsByFaculty(row.id),
      Api.Queries.subjects(),
    ]).then(([assignedResult, subjectsResult]) => {
      const assigned = assignedResult.facultySubjectsByFaculty;
      const allSubjects = subjectsResult.subjects;
      const assignedIds = new Set(assigned.map((a) => a.subjectId));

      const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(4));
      container.setWidth(360);

      const info = new qx.ui.basic.Label(
        `Manage subject assignments for ${row.fullName}`,
      );
      info.setWrap(true);
      info.setTextColor(AppColors.mutedForeground());
      container.add(info);

      const currentLabel = new qx.ui.basic.Label("Current Assignments:");
      currentLabel.setFont(
        //@ts-ignore
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
              { size: "sm", variant: "destructive" },
            );
            removeBtn.onClick(() => {
              const idx = currentAssigned.indexOf(a);
              if (idx !== -1) {
                currentAssigned.splice(idx, 1);
                assignedIds.delete(a.subjectId);
              }
              renderAssignments(currentAssigned);
            });
            rowWidget.add(label, { flex: 1 });
            rowWidget.add(removeBtn);
            assignmentList.add(rowWidget);
          });
        }
      };
      renderAssignments(assigned);
      container.add(assignmentList);

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
          { size: "sm", variant: "default" },
        );
        addAssignBtn.onClick(() => {
          const selectedLabel = subjectSelect.getSelectedValue();
          if (!selectedLabel) return;
          const selectedCode = selectedLabel.split(" — ")[0];
          const subject = allSubjects.find((s) => s.code === selectedCode);
          if (!subject) return;

          assignedIds.add(subject.id);
          assigned.push({
            id: Date.now(),
            facultyId: row.id,
            subjectId: subject.id,
            code: subject.code,
            name: subject.name,
            units: subject.units,
          });
          renderAssignments(assigned);
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
