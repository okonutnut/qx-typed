type AgGridValueGetter<T> = (row: T) => any;

type AgGridTableColumn<T> = {
  headerName: string;
  field?: keyof T & string;
  hide?: boolean;
  minWidth?: number;
  width?: number;
  flex?: number;
  sortable?: boolean;
  filter?: boolean;
  valueGetter?: AgGridValueGetter<T>;
  valueFormatter?: (value: any, row: T) => string;
};

type AgGridTableOptions<T> = {
  emptyMessage?: string;
  rowId?: (row: T) => string;
};

class AgGridTable<T> extends qx.ui.container.Composite {
  private __html: qx.ui.embed.Html;
  private __columns: AgGridTableColumn<T>[];
  private __rows: T[] = [];
  private __gridApi: any = null;
  private __selectedRow: T | null = null;
  private __options: AgGridTableOptions<T>;
  private __gridId = `ag-grid-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  constructor(columns: AgGridTableColumn<T>[], options?: AgGridTableOptions<T>) {
    super(new qx.ui.layout.Grow());

    this.__columns = columns;
    this.__options = options ?? {};

    this.__html = new qx.ui.embed.Html(`
      <div class="app-ag-grid-shell">
        <div id="${this.__gridId}" class="ag-theme-quartz app-ag-grid-theme"></div>
      </div>
    `);
    this.__html.setMinHeight(420);
    this.add(this.__html);

    this.addListenerOnce("appear", () => this.__ensureGrid());
    this.addListener("resize", () => this.__sizeColumnsToFit());
  }

  setRows(rows: T[]): void {
    this.__rows = rows.slice();
    if (this.__gridApi) {
      this.__gridApi.setGridOption("rowData", this.__rows);
      this.__syncSelection();
      this.__updateOverlay();
      this.__sizeColumnsToFit();
    }
  }

  getSelectedRow(): T | null {
    return this.__selectedRow;
  }

  private __ensureGrid(): void {
    if (this.__gridApi) {
      return;
    }

    const root = this.__html.getContentElement().getDomElement();
    const gridElement = root?.querySelector(`#${this.__gridId}`) as HTMLElement | null;
    if (!gridElement) {
      qx.event.Timer.once(() => this.__ensureGrid(), this, 0);
      return;
    }

    if (!window.agGrid?.createGrid) {
      this.__html.setHtml(`
        <div class="app-ag-grid-shell">
          <div class="app-ag-grid-error">
            AG Grid failed to load. Check the local asset paths in index.html.
          </div>
        </div>
      `);
      return;
    }

    const columnDefs = this.__columns.map((column) => ({
      headerName: column.headerName,
      field: column.field,
      hide: column.hide ?? false,
      minWidth: column.minWidth ?? 120,
      width: column.width,
      flex: column.flex ?? (column.width ? undefined : 1),
      sortable: column.sortable ?? true,
      filter: column.filter ?? true,
      resizable: true,
      valueGetter: column.valueGetter
        ? (params: any) => column.valueGetter!(params.data as T)
        : undefined,
      valueFormatter: column.valueFormatter
        ? (params: any) =>
            column.valueFormatter!(params.value, params.data as T)
        : undefined,
    }));

    this.__gridApi = window.agGrid.createGrid(gridElement, {
      theme: "legacy",
      columnDefs,
      rowData: this.__rows,
      rowSelection: {
        mode: "singleRow",
        enableClickSelection: true,
      },
      defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        floatingFilter: false,
      },
      animateRows: true,
      suppressCellFocus: true,
      pagination: true,
      paginationPageSize: 10,
      paginationPageSizeSelector: [10, 20, 50],
      overlayNoRowsTemplate: `<span>${this.__options.emptyMessage ?? "No records found."}</span>`,
      getRowId: this.__options.rowId
        ? (params: any) => this.__options.rowId!(params.data as T)
        : undefined,
      onSelectionChanged: () => {
        const selectedRows = this.__gridApi.getSelectedRows() as T[];
        this.__selectedRow = selectedRows[0] ?? null;
      },
      onGridReady: () => {
        this.__updateOverlay();
        this.__sizeColumnsToFit();
      },
    });

    this.__updateOverlay();
    this.__sizeColumnsToFit();
  }

  private __syncSelection(): void {
    if (!this.__selectedRow || !this.__gridApi) {
      return;
    }

    const selectedRow = this.__selectedRow;
    let matchFound = false;
    this.__gridApi.forEachNode((node: any) => {
      const isMatch = node.data === selectedRow;
      node.setSelected(isMatch);
      if (isMatch) {
        matchFound = true;
      }
    });

    if (!matchFound) {
      this.__selectedRow = null;
    }
  }

  private __updateOverlay(): void {
    if (!this.__gridApi) {
      return;
    }
    this.__gridApi.setGridOption(
      "activeOverlay",
      this.__rows.length === 0 ? "agNoRowsOverlay" : undefined,
    );
  }

  private __sizeColumnsToFit(): void {
    if (!this.__gridApi) {
      return;
    }
    qx.event.Timer.once(() => {
      if (this.__gridApi && !this.__gridApi.isDestroyed()) {
        this.__gridApi.sizeColumnsToFit();
      }
    }, this, 0);
  }
}
