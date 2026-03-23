function showAboutDialog(): void {
  const aboutContent = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
  aboutContent.setBackgroundColor(AppColors.card());

  const aboutTable = new qx.ui.container.Composite(new qx.ui.layout.Grid(8, 14));
  const tableLayout = aboutTable.getLayout() as qx.ui.layout.Grid;
  tableLayout.setColumnFlex(1, 1);

  const headerLabel = new qx.ui.basic.Label("SIAS Online v3.7.3.2").set({
    font: new qx.bom.Font("16", ["Inter", "sans-serif"]).set({ bold: true }),
    textColor: AppColors.primary(),
  });
  const headerTitle = new qx.ui.basic.Label(
    "Copyright @ 2014 - 2020 Digital Software",
  ).set({
    font: new qx.bom.Font("14", ["Inter", "sans-serif"]).set({ bold: true })
  });

  aboutTable.add(new qx.ui.basic.Label("Chief Architect"), { row: 1, column: 0 });
  aboutTable.add(
    new qx.ui.basic.Label("Thomas C. Saddul, BSMath, MCS, MSIT").set({
      font: new qx.bom.Font("14", ["Inter", "sans-serif"]).set({ bold: true }),
    }),
    {
      row: 1,
      column: 1,
    },
  );

  aboutTable.add(new qx.ui.basic.Label("Website"), { row: 2, column: 0 });
  aboutTable.add(
    new qx.ui.basic.Label("https://www.digisoftph.com").set({
      rich: true,
      font: new qx.bom.Font("14", ["Inter", "sans-serif"]).set({ bold: true }),
    }),
    { row: 2, column: 1 },
  );

  aboutTable.add(new qx.ui.basic.Label("Facebook"), { row: 3, column: 0 });
  aboutTable.add(
    new qx.ui.basic.Label("https://www.facebook.com/digisoftph").set({
      rich: true,
      font: new qx.bom.Font("14", ["Inter", "sans-serif"]).set({ bold: true }),
    }),
    { row: 3, column: 1 },
  );

  aboutContent.add(headerLabel);
  aboutContent.add(headerTitle);
  aboutContent.add(aboutTable);

  BsAlertDialog.show({
    title: "About",
    children: aboutContent,
    cancelLabel: "Okay",
    footerButtons: "cancel",
  });
}
