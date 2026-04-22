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
  private __searchInput!: BsInput;
  private __filterInputs: Map<number, BsInput> = new Map();
  private __paginationBar!: qx.ui.container.Composite;
  private __pageLabel!: qx.ui.basic.Label;
  private __currentPage: number = 1;
  private __pageSize: number = 10;
  private __totalPages: number = 1;
  private __tableContainer!: qx.ui.embed.Html;
  private __tableBody!: HTMLElement;

  constructor(columns: TableColumn[], options?: TableOptions) {
    super(new qx.ui.layout.VBox(0));

    this.__columns = columns;
    this.__options = options ?? {};
    this.__pageSize = this.__options.pageSize ?? 10;

    this.setLayout(new qx.ui.layout.VBox(0));

    this.__buildHeader();
    this.__buildTableContainer();
    this.__buildPagination();
  }

  private __buildHeader(): void {
    const headerContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(4));
    headerContainer.setMarginBottom(8);

    const searchRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
    searchRow.setMarginBottom(4);

    const searchIcon = new InlineSvgIcon("search", 16);
    searchRow.add(searchIcon);

    this.__searchInput = new BsInput("", "Search all columns...");
    this.__searchInput.setWidth(300);
    this.__searchInput.onInput(() => this.__applyFilters());
    searchRow.add(this.__searchInput);

    headerContainer.add(searchRow);

    const filterRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
    filterRow.setMarginBottom(4);

    const filterIcon = new InlineSvgIcon("filter", 16);
    filterRow.add(filterIcon);

    this.__columns.forEach((col, idx) => {
      if (!col.hide && col.filterable !== false) {
        const filterInput = new BsInput("", `Filter ${col.headerName}...`);
        filterInput.setWidth(150);
        filterInput.onInput(() => this.__applyFilters());
        this.__filterInputs.set(idx, filterInput);
        filterRow.add(filterInput);
      }
    });

    headerContainer.add(filterRow);
    this.add(headerContainer);
  }

  private __buildTableContainer(): void {
    const tableWrapper = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
    tableWrapper.setMarginTop(8);
    tableWrapper.setMarginBottom(8);

    const headerRow = document.createElement("div");
    headerRow.className = "flex bg-muted text-muted-foreground font-medium";
    headerRow.style.padding = "8px 12px";
    headerRow.style.borderRadius = "6px 6px 0 0";

    this.__columns.forEach((col) => {
      if (col.hide) return;
      const headerCell = document.createElement("div");
      headerCell.className = "flex-1 px-3 py-2";
      headerCell.style.minWidth = `${col.minWidth || 100}px`;
      if (col.flex) {
        headerCell.style.flex = String(col.flex);
      } else {
        headerCell.style.flex = "1";
      }
      headerCell.textContent = col.headerName;
      headerRow.appendChild(headerCell);
    });

    this.__tableContainer = new qx.ui.embed.Html("");
    const html = `
      <div class="flex flex-col">
        ${headerRow.outerHTML}
        <div class="table-body"></div>
      </div>
    `;
    this.__tableContainer.setHtml(html);

    const elem = (this.__tableContainer as any).getContentElement().getDomElement();
    if (elem) {
      this.__tableBody = elem.querySelector(".table-body") as HTMLElement;
    }

    tableWrapper.add(this.__tableContainer);
    this.add(tableWrapper, { flex: 1 });
  }

  private __buildPagination(): void {
    this.__paginationBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
    this.__paginationBar.setMarginTop(8);

    const prevBtn = new BsButton(
      "Prev",
      new InlineSvgIcon("chevron-left", 14),
      { size: "sm", variant: "outline" },
    );
    prevBtn.onClick(() => this.__goToPage(this.__currentPage - 1));
    this.__paginationBar.add(prevBtn);

    this.__pageLabel = new qx.ui.basic.Label("Page 1 of 1");
    this.__pageLabel.setAlignY("middle");
    this.__paginationBar.add(this.__pageLabel);

    const nextBtn = new BsButton(
      "Next",
      new InlineSvgIcon("chevron-right", 14),
      { size: "sm", variant: "outline" },
    );
    nextBtn.onClick(() => this.__goToPage(this.__currentPage + 1));
    this.__paginationBar.add(nextBtn);

    const pageSizeSelect = new BsSelect(["10", "25", "50", "100"]);
    pageSizeSelect.setSelectedByLabel(String(this.__pageSize));
    pageSizeSelect.setWidth(80);
    pageSizeSelect.onChange(() => {
      const val = pageSizeSelect.getSelectedValue();
      if (val) {
        this.__pageSize = parseInt(val, 10);
        this.__currentPage = 1;
        this.__updateTable();
      }
    });
    this.__paginationBar.add(new qx.ui.basic.Label("Rows:"));
    this.__paginationBar.add(pageSizeSelect);

    this.__paginationBar.add(new qx.ui.core.Spacer(), { flex: 1 });

    const totalLabel = new qx.ui.basic.Label("Total: 0");
    totalLabel.setAlignY("middle");
    totalLabel.setTextColor(AppColors.mutedForeground());
    this.__paginationBar.add(totalLabel);

    this.add(this.__paginationBar);
  }

  private __goToPage(page: number): void {
    if (page < 1 || page > this.__totalPages) return;
    this.__currentPage = page;
    this.__updateTable();
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

  private __applyFilters(): void {
    const searchTerm = this.__searchInput.getValue()?.toLowerCase() ?? "";

    const columnFilters: Map<number, string> = new Map();
    this.__filterInputs.forEach((input, colIdx) => {
      const value = input.getValue()?.toLowerCase() ?? "";
      if (value) {
        columnFilters.set(colIdx, value);
      }
    });

    this.__filteredRows = this.__rows.filter((row) => {
      if (searchTerm) {
        const rowText = this.__columns
          .filter((col) => !col.hide)
          .map((col) => this.__getCellValue(row, col))
          .join(" ")
          .toLowerCase();

        if (!rowText.includes(searchTerm)) return false;
      }

      for (const [colIdx, filterValue] of columnFilters) {
        const col = this.__columns[colIdx];
        const cellValue = this.__getCellValue(row, col);
        if (!cellValue.toLowerCase().includes(filterValue)) {
          return false;
        }
      }

      return true;
    });

    this.__currentPage = 1;
    this.__updateTable();
  }

  private __updateTable(): void {
    this.__totalPages = Math.max(1, Math.ceil(this.__filteredRows.length / this.__pageSize));

    const startIdx = (this.__currentPage - 1) * this.__pageSize;
    const endIdx = Math.min(startIdx + this.__pageSize, this.__filteredRows.length);
    const pageRows = this.__filteredRows.slice(startIdx, endIdx);

    const elem = (this.__tableContainer as any).getContentElement()?.getDomElement();
    if (elem) {
      this.__tableBody = elem.querySelector(".table-body") as HTMLElement;
    }

    if (!this.__tableBody) return;

    this.__tableBody.innerHTML = "";

    if (pageRows.length === 0) {
      const emptyRow = document.createElement("div");
      emptyRow.className = "px-3 py-8 text-center text-muted-foreground";
      emptyRow.textContent = this.__options.emptyMessage || "No data available";
      this.__tableBody.appendChild(emptyRow);
    } else {
      pageRows.forEach((row, rowIdx) => {
        const rowElem = document.createElement("div");
        rowElem.className = "flex border-t border-border hover:bg-muted/50 cursor-pointer transition-colors";
        if (rowIdx % 2 === 1) {
          rowElem.classList.add("bg-muted/30");
        }

        rowElem.addEventListener("click", () => {
          this.__selectedRow = row;
          const allRows = this.__tableBody!.querySelectorAll("[data-selected]");
          allRows.forEach((r) => r.removeAttribute("data-selected"));
          allRows.forEach((r) => r.classList.remove("bg-primary/10"));
          rowElem.setAttribute("data-selected", "true");
          rowElem.classList.add("bg-primary/10");
        });

        this.__columns.forEach((col) => {
          if (col.hide) return;
          const cell = document.createElement("div");
          cell.className = "flex-1 px-3 py-2 truncate";
          cell.style.minWidth = `${col.minWidth || 100}px`;
          if (col.flex) {
            cell.style.flex = String(col.flex);
          } else {
            cell.style.flex = "1";
          }
          cell.textContent = this.__getCellValue(row, col);
          cell.title = this.__getCellValue(row, col);
          rowElem.appendChild(cell);
        });

        this.__tableBody.appendChild(rowElem);
      });
    }

    this.__pageLabel.set({ value: `Page ${this.__currentPage} of ${this.__totalPages}` });

    const children = this.__paginationBar.getChildren();
    const totalLabel = children[children.length - 1] as qx.ui.basic.Label;
    if (totalLabel && totalLabel instanceof qx.ui.basic.Label) {
      totalLabel.set({ value: `Total: ${this.__filteredRows.length}` });
    }
  }

  setRows(rows: T[]): void {
    this.__rows = rows.slice();
    this.__filteredRows = rows.slice();
    this.__currentPage = 1;
    this.__updateTable();
  }

  getSelectedRow(): T | null {
    return this.__selectedRow;
  }
}