type TableColumn = {
  headerName: string;
  field?: string;
  width?: number;
  minWidth?: number;
  flex?: number;
  hide?: boolean;
  valueGetter?: (row: any) => any;
  valueFormatter?: (value: any, row: any) => string;
  filterable?: boolean;
};

type TableOptions = {
  emptyMessage?: string;
  rowId?: (row: any) => string;
  pageSize?: number;
};

class Table<T> extends qx.ui.container.Composite {
  private __columns: TableColumn[];
  private __rows: T[] = [];
  private __filteredRows: T[] = [];
  private __selectedRow: T | null = null;
  private __options: TableOptions;
  private __table!: qx.ui.table.Table;
  private __tableModel!: qx.ui.table.model.Simple;

  constructor(columns: TableColumn[], options?: TableOptions) {
    super(new qx.ui.layout.VBox(0));

    this.__columns = columns;
    this.__options = options ?? {};

    this.setLayout(new qx.ui.layout.VBox(0));

    this.__buildTable();
  }

  private __buildTable(): void {
    const visibleColumns = this.__columns.filter((col) => !col.hide);
    const columnNames = visibleColumns.map((col) => col.headerName);
    const columnIds = visibleColumns.map((col) => col.field || col.headerName);

    this.__tableModel = new qx.ui.table.model.Simple();
    this.__tableModel.setColumns(columnNames, columnIds);

    this.__table = new qx.ui.table.Table(this.__tableModel, {
      tableColumnModel: (table: qx.ui.table.Table) => {
        return new qx.ui.table.columnmodel.Basic();
      },
    });

    this.__table.setShowCellFocusIndicator(true);
    this.__table.setStatusBarVisible(true);

    visibleColumns.forEach((col, idx) => {
      if (col.width) {
        this.__table.setColumnWidth(idx, col.width);
      } else if (col.minWidth) {
        this.__table.setColumnWidth(idx, col.minWidth);
      }
    });

    const selectionModel = this.__table.getSelectionModel();
    selectionModel.setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);

    selectionModel.addListener("change", () => {
      this.__selectedRow = null;
      const selectedRanges = selectionModel.getSelectedRanges();
      if (selectedRanges.length > 0) {
        const range = selectedRanges[0];
        const rowIndex = range.minIndex;
        if (rowIndex >= 0 && rowIndex < this.__filteredRows.length) {
          this.__selectedRow = this.__filteredRows[rowIndex];
        }
      }
    });

    this.add(this.__table, { flex: 1 });
  }

  private __getCellValue(row: T, col: TableColumn): string {
    if (col.valueGetter) {
      const value = col.valueGetter(row);
      if (col.valueFormatter && value !== undefined && value !== null) {
        return col.valueFormatter(value, row);
      }
      return value !== undefined && value !== null ? String(value) : "";
    }
    if (col.field) {
      const value = (row as any)[col.field];
      if (col.valueFormatter && value !== undefined && value !== null) {
        return col.valueFormatter(value, row);
      }
      return value !== undefined && value !== null ? String(value) : "";
    }
    return "";
  }

  private __updateTableData(): void {
    const visibleColumns = this.__columns.filter((col) => !col.hide);

    const rowData: string[][] = this.__filteredRows.map((row) => {
      return visibleColumns.map((col) => this.__getCellValue(row, col));
    });

    this.__tableModel.setData(rowData);
  }

  setRows(rows: T[]): void {
    this.__rows = rows.slice();
    this.__filteredRows = rows.slice();
    this.__selectedRow = null;
    this.__table.resetSelection();

    this.__updateTableData();
  }

  getSelectedRow(): T | null {
    return this.__selectedRow;
  }
}
