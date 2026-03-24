type TableColumn = {
  headerName: string;
  field?: string;
  width?: number;
  minWidth?: number;
  flex?: number;
  hide?: boolean;
  valueGetter?: (row: any) => any;
  valueFormatter?: (value: any, row: any) => string;
};

type TableOptions = {
  emptyMessage?: string;
  rowId?: (row: any) => string;
};

class AgGridTable<T> extends qx.ui.container.Composite {
  private __columns: TableColumn[];
  private __rows: T[] = [];
  private __table: qx.ui.table.Table;
  private __tableModel: qx.ui.table.model.Simple;
  private __selectedRow: T | null = null;
  private __options: TableOptions;

  constructor(columns: TableColumn[], options?: TableOptions) {
    super(new qx.ui.layout.Grow());

    this.__columns = columns;
    this.__options = options ?? {};

    this.__tableModel = new qx.ui.table.model.Simple();
    const model = this.__tableModel as any;
    model.setColumns(
      this.__columns.map((c) => c.headerName),
      this.__columns.map((c) => c.field ?? "")
    );

    this.__table = new qx.ui.table.Table(this.__tableModel);
    this.__table.setShowCellFocusIndicator(true);
    this.__table.setRowHeight(32);
    this.__table.setHeaderCellHeight(36);

    const columnModel = this.__table.getTableColumnModel() as any;
    this.__columns.forEach((col, idx) => {
      if (col.width) {
        columnModel.setColumnWidth(idx, col.width);
      }
    });

    this.__table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
    
    this.__table.getSelectionModel().addListener("changeSelection", () => {
      const selModel = this.__table.getSelectionModel();
      
      let selectedIndex = -1;
      selModel.iterateSelection((idx: number) => {
        selectedIndex = idx;
        return false;
      }, this);
      
      console.log("[AgGridTable] Selection changed, index:", selectedIndex, "rows:", this.__rows.length);
      if (selectedIndex >= 0 && this.__rows[selectedIndex]) {
        this.__selectedRow = this.__rows[selectedIndex];
        console.log("[AgGridTable] Selected row:", this.__selectedRow);
      } else {
        this.__selectedRow = null;
      }
    });

    this.add(this.__table);
    console.log("[AgGridTable] Table created");
  }

  setRows(rows: T[]): void {
    this.__rows = rows.slice();
    console.log("[AgGridTable] setRows called with", rows.length, "rows");
    console.log("[AgGridTable] First row sample:", this.__rows[0]);
    
    const data = this.__rows.map((row) => {
      return this.__columns.map((col) => {
        if (col.hide) {
          return "";
        }
        if (col.valueGetter) {
          const value = col.valueGetter(row);
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
      });
    });
    
    console.log("[AgGridTable] Setting data:", data.length, "rows");
    this.__tableModel.setData(data);
  }

  getSelectedRow(): T | null {
    console.log("[AgGridTable] getSelectedRow returning:", this.__selectedRow);
    return this.__selectedRow;
  }
}
