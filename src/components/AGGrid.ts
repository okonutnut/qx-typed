type AGGridColumn = {
  headerName: string;
  field?: string;
  width?: number;
  minWidth?: number;
  hide?: boolean;
  valueGetter?: (params: any) => any;
  valueFormatter?: (params: any) => string;
  filter?: boolean | string;
  sortable?: boolean;
  resizable?: boolean;
};

type AGGridOptions = {
  emptyMessage?: string;
  rowId?: (row: any) => string;
  pagination?: boolean;
  pageSize?: number;
};

class AGGrid<T> extends qx.ui.container.Composite {
  private __columns: AGGridColumn[];
  private __rows: T[] = [];
  private __selectedRow: T | null = null;
  private __options: AGGridOptions;
  private __gridContainer!: qx.ui.embed.Html;
  private __gridApi: any = null;
  private __gridDivId: string;

  constructor(columns: AGGridColumn[], options?: AGGridOptions) {
    super(new qx.ui.layout.VBox(0));

    this.__columns = columns;
    this.__options = options ?? {};
    this.__gridDivId = "ag-grid-" + Math.random().toString(36).substr(2, 9);

    this.setLayout(new qx.ui.layout.VBox(0));

    this.__buildGrid();
  }

  private __buildGrid(): void {
    this.__gridContainer = new qx.ui.embed.Html("");
    this.__gridContainer.setAllowGrowX(true);
    this.__gridContainer.setAllowGrowY(true);

    this.add(this.__gridContainer, { flex: 1 });

    this.__gridContainer.addListenerOnce("appear", () => {
      this.__initAGGrid();
    });
  }

  private __initAGGrid(): void {
    const domEl = this.__gridContainer.getContentElement()?.getDomElement();
    if (!domEl) return;

    const gridDiv = document.createElement("div");
    gridDiv.id = this.__gridDivId;
    gridDiv.className = "ag-theme-quartz";
    gridDiv.style.height = "100%";
    gridDiv.style.width = "100%";
    domEl.appendChild(gridDiv);

    const visibleColumns = this.__columns.filter((col) => !col.hide);

    const columnDefs = visibleColumns.map((col) => {
      const colDef: any = {
        headerName: col.headerName,
        field: col.field || col.headerName,
      };

      if (col.width) colDef.width = col.width;
      if (col.minWidth) colDef.minWidth = col.minWidth;
      if (col.filter !== undefined) colDef.filter = col.filter;
      else colDef.filter = true;

      if (col.sortable !== false) colDef.sortable = true;
      if (col.resizable !== false) colDef.resizable = true;

      if (col.valueGetter) {
        colDef.valueGetter = col.valueGetter;
      }

      if (col.valueFormatter) {
        colDef.valueFormatter = col.valueFormatter;
      }

      return colDef;
    });

    const gridOptions: any = {
      columnDefs: columnDefs,
      rowData: this.__rows,
      rowSelection: "single",
      animateRows: true,
      theme: "legacy",
      defaultColDef: {
        sortable: true,
        resizable: true,
        filter: true,
      },
      onSelectionChanged: (event: any) => {
        const selectedRows = event.api.getSelectedRows();
        this.__selectedRow = selectedRows.length > 0 ? selectedRows[0] : null;
      },
      onGridReady: (event: any) => {
        this.__gridApi = event.api;
        event.api.sizeColumnsToFit();
      },
    };

    if (this.__options.pagination) {
      gridOptions.pagination = true;
      gridOptions.paginationPageSize = this.__options.pageSize || 25;
    }

    (window as any).agGrid.createGrid(gridDiv, gridOptions);
  }

  setRows(rows: T[]): void {
    this.__rows = rows.slice();
    this.__selectedRow = null;

    if (this.__gridApi) {
      this.__gridApi.setGridOption("rowData", this.__rows);
    }
  }

  getSelectedRow(): T | null {
    return this.__selectedRow;
  }

  refreshData(): void {
    if (this.__gridApi) {
      this.__gridApi.setGridOption("rowData", this.__rows);
    }
  }
}
