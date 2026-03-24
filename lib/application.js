var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class AppColors {
    static resolveCssVar(cssVarName, fallback) {
        const cacheKey = `${cssVarName}|${fallback !== null && fallback !== void 0 ? fallback : ""}`;
        const cached = this.__cache.get(cacheKey);
        if (cached)
            return cached;
        if (typeof document === "undefined" || !document.body) {
            return fallback !== null && fallback !== void 0 ? fallback : "";
        }
        const probe = document.createElement("span");
        probe.style.position = "absolute";
        probe.style.visibility = "hidden";
        probe.style.pointerEvents = "none";
        probe.style.color = `var(${cssVarName}${fallback ? `, ${fallback}` : ""})`;
        document.body.appendChild(probe);
        const computed = window.getComputedStyle(probe).color;
        probe.remove();
        const resolved = computed || fallback || "";
        this.__cache.set(cacheKey, resolved);
        return resolved;
    }
    static primary() {
        return this.resolveCssVar("--color-primary", "#f6f7f9");
    }
    static background() {
        return this.resolveCssVar("--color-background", "#f6f7f9");
    }
    static card() {
        return this.resolveCssVar("--color-card", "#fcfcfc");
    }
    static foreground() {
        return this.resolveCssVar("--color-foreground", "#0f1729");
    }
    static border() {
        return this.resolveCssVar("--color-border", "#e5e7eb");
    }
    static sidebar() {
        return this.resolveCssVar("--color-sidebar", "#fcfcfc");
    }
    static sidebarForeground() {
        return this.resolveCssVar("--color-sidebar-foreground", "#0f1729");
    }
    static sidebarBorder() {
        return this.resolveCssVar("--color-sidebar-border", "#e5e7eb");
    }
    static accent() {
        return this.resolveCssVar("--color-accent", "#f8f9fa");
    }
    static accentForeground() {
        return this.resolveCssVar("--color-accent-foreground", "#0f1729");
    }
    static destructive() {
        return this.resolveCssVar("--color-destructive", "#dc2626");
    }
    static mutedForeground() {
        return this.resolveCssVar("--color-muted-foreground", "#64748b");
    }
    static overlay(alpha = 0.35) {
        const foreground = this.foreground();
        const match = foreground.match(/rgba?\((\d+)\D+(\d+)\D+(\d+)/i);
        if (!match)
            return `rgba(15, 23, 42, ${alpha})`;
        const [, red, green, blue] = match;
        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }
}
AppColors.__cache = new Map();
function qooxdooMain(app) {
    const root = app.getRoot();
    const createMainLayout = () => {
        // Filter pages by the logged-in user's role
        const role = globalThis.userRole;
        const pageMap = new Map();
        PAGE_DEFINITIONS.forEach((definition) => {
            if (!definition.factory)
                return;
            if (definition.allowedRoles && definition.allowedRoles.indexOf(role) === -1)
                return;
            pageMap.set(definition.label, definition.factory);
        });
        const sidebarItems = manipulateSidebarItems(createSidebarItems(), pageMap);
        const initialPage = new MainPage();
        const initialTitle = "Welcome";
        const mainLayout = new MainLayout(initialPage, sidebarItems, pageMap, initialTitle);
        mainLayout.addListener("logout", () => {
            setAppLayout("login");
        });
        return mainLayout;
    };
    const createLoginLayout = () => {
        const loginLayout = new LoginLayout();
        loginLayout.addListener("login", () => {
            setAppLayout("main");
        });
        return loginLayout;
    };
    const setAppLayout = (mode) => {
        root.removeAll();
        root.add(mode === "main" ? createMainLayout() : createLoginLayout(), {
            edge: 0,
        });
    };
    const currentLayout = "login";
    setAppLayout(currentLayout);
}
qx.registry.registerMainMethod(qooxdooMain);
class Navbar extends qx.ui.container.Composite {
    constructor(pageTitle, onToggleSidebar) {
        super(new qx.ui.layout.HBox(2));
        this.__isActionsOpen = false;
        this.setAlignY("middle");
        this.setPadding(8);
        this.setHeight(55);
        this.setBackgroundColor(AppColors.background());
        this.setDecorator(new qx.ui.decoration.Decorator().set({
            widthBottom: 1,
            styleBottom: "solid",
            colorBottom: AppColors.border(),
        }));
        // SIDEBAR TRIGGER
        const collapseSidebarBtn = new BsButton("", new InlineSvgIcon("menu", 16), { size: "icon", variant: "ghost", className: "btn-sm p-1" });
        collapseSidebarBtn.setWidth(50);
        collapseSidebarBtn.onClick(() => {
            this.fireEvent("toggleSidebar");
            if (onToggleSidebar)
                onToggleSidebar();
        });
        this.add(collapseSidebarBtn);
        // PAGE TITLE
        this.__titleLabel = new qx.ui.basic.Label(pageTitle !== null && pageTitle !== void 0 ? pageTitle : "Dashboard");
        this.__titleLabel.setTextColor(AppColors.foreground());
        this.__titleLabel.setFont(
        // @ts-ignore
        new qx.bom.Font(18).set({ bold: true }));
        this.__titleLabel.setAlignY("middle");
        this.add(this.__titleLabel);
        const spacer = new qx.ui.core.Spacer();
        this.add(spacer, { flex: 1 });
        // OTHER ACTIONS
        const otherActionsBtn = new BsButton("", new InlineSvgIcon("ellipsis", 8), { size: "icon", variant: "ghost", className: "btn-sm p-1" });
        otherActionsBtn.setWidth(50);
        otherActionsBtn.onClick(() => this.__toggleActionsPopup(otherActionsBtn));
        this.add(otherActionsBtn);
        this.__actionsPopup = new qx.ui.popup.Popup(new qx.ui.layout.Grow());
        this.__actionsPopup.setAutoHide(true);
        this.__actionsPopup.setDomMove(true);
        this.__actionsPopup.setZIndex(100000);
        this.__actionsPopup.setAllowGrowX(false);
        this.__actionsPopup.setAllowGrowY(true);
        this.__actionsPopup.setPadding(0);
        this.__actionsPopup.setBackgroundColor("transparent");
        this.__actionsPopup.setDecorator(new qx.ui.decoration.Decorator().set({
            width: 1,
            style: "solid",
            color: AppColors.border(),
            radius: 10,
            shadowVerticalLength: 2,
            shadowBlurRadius: 10,
            shadowColor: AppColors.overlay(0.1),
        }));
        const actionsMenu = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
        actionsMenu.set({
            minWidth: 160,
            paddingTop: 6,
            paddingRight: 6,
            paddingBottom: 6,
            paddingLeft: 6,
            backgroundColor: AppColors.background(),
            textColor: AppColors.foreground(),
        });
        actionsMenu.add(this.__createActionsMenuButton("Support", new InlineSvgIcon("help-circle", 16), "support"));
        actionsMenu.add(this.__createActionsMenuButton("About", new InlineSvgIcon("info", 16), "show-about-dialog"));
        this.addListener("action", (ev) => {
            if (ev.getData() === "show-about-dialog") {
                showAboutDialog();
            }
        });
        this.__actionsPopup.add(actionsMenu);
        this.__actionsPopup.addListener("disappear", () => {
            this.__isActionsOpen = false;
        });
        this.addListenerOnce("disappear", () => {
            this.__actionsPopup.hide();
        });
    }
    __createActionsMenuButton(label, icon, action) {
        const button = new BsSidebarButton(label, icon, "btn-sm-outline");
        button.setAllowGrowX(true);
        button.setHeight(40);
        button.onClick(() => {
            this.fireDataEvent("action", action);
            this.__closeActionsPopup();
        });
        return button;
    }
    __toggleActionsPopup(target) {
        if (this.__isActionsOpen) {
            this.__closeActionsPopup();
            return;
        }
        this.__actionsPopup.show();
        this.__isActionsOpen = true;
        this.__actionsPopup.placeToWidget(target, true);
        qx.event.Timer.once(() => this.__actionsPopup.placeToWidget(target, true), this, 0);
    }
    __closeActionsPopup() {
        if (!this.__isActionsOpen)
            return;
        this.__isActionsOpen = false;
        this.__actionsPopup.hide();
    }
    setPageTitle(value) {
        this.__titleLabel.setValue(value);
    }
    setTitle(value) {
        this.setPageTitle(value);
    }
}
Navbar.events = {
    toggleSidebar: "qx.event.type.Event",
    action: "qx.event.type.Data",
};
class Sidebar extends qx.ui.container.Composite {
    constructor(sidebarItems, initialActiveLabel) {
        super(new qx.ui.layout.VBox(0).set({ alignX: "center" }));
        this.__collapsed = false;
        this.__drawerMode = false;
        this.__listContainer = null;
        this.__buttons = [];
        this.__buttonStates = new Map();
        this.__activeLeafLabel = null;
        this.__searchQuery = "";
        this.__isAnimating = false;
        this.__hasRendered = false;
        this.__stack = [];
        this.__rootItems = sidebarItems;
        this.__activeLeafLabel =
            initialActiveLabel !== null && initialActiveLabel !== void 0 ? initialActiveLabel : this.__findFirstLeafLabel(sidebarItems);
        this.setWidth(230);
        this.setPadding(10);
        this.setAlignX("center");
        this.setBackgroundColor(AppColors.sidebar());
        this.setDecorator(new qx.ui.decoration.Decorator().set({
            widthRight: 1,
            styleRight: "solid",
            colorRight: AppColors.sidebarBorder(),
        }));
        const schoolLogo = new qx.ui.basic.Image("resource/app/ac_logo.png");
        schoolLogo.set({
            scale: true,
            width: 42,
            height: 42,
        });
        this.__schoolLogo = schoolLogo;
        this.add(schoolLogo);
        const header = new qx.ui.basic.Label("Aldersgate College Inc.");
        this.__header = header;
        header.setFont(
        //@ts-ignore
        new qx.bom.Font(12).set({ bold: true }));
        header.setTextAlign("center");
        header.setPadding(5);
        header.setTextColor(AppColors.sidebarForeground());
        this.add(header);
        const appVersion = new qx.ui.basic.Label("Class Scheduler v1.0.0");
        this.__appVersion = appVersion;
        appVersion.setTextColor(AppColors.sidebarForeground());
        appVersion.setTextAlign("center");
        appVersion.setOpacity(0.7);
        appVersion.setFont(
        // @ts-ignore
        new qx.bom.Font(10, ["Inter", "sans-serif"]));
        appVersion.setMarginTop(6);
        appVersion.setMarginBottom(12);
        this.add(appVersion);
        this.__searchInput = new BsInput("", "Search pages...", "w-full input-sm");
        this.__searchInput.setLeadingHtml('<img src="resource/app/icons/search.svg" alt="" width="16" height="16" style="display:block;opacity:0.7" />');
        this.__searchInput.setAllowGrowX(true);
        this.__searchInput.onInput((value) => {
            this.__searchQuery = value.trim();
            this.__renderVisibleItems(false);
        });
        this.add(this.__searchInput);
        this.__backContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
        this.__backContainer.setAllowGrowX(true);
        const backButton = new BsSidebarButton("Back", new InlineSvgIcon("arrow-left", 16));
        backButton.setAllowGrowX(true);
        backButton.setWidth(230);
        backButton.setCentered(true);
        this.__backButton = backButton;
        backButton.onClick(() => {
            if (this.__stack.length === 0 || this.__isAnimating)
                return;
            this.__stack.pop();
            this.__renderVisibleItems(true);
        });
        this.__backContainer.add(backButton);
        this.add(this.__backContainer);
        this.__itemsViewport = new qx.ui.container.Composite(new qx.ui.layout.Grow());
        this.__itemsViewport.setAllowGrowX(true);
        this.__itemsViewport.setAllowGrowY(true);
        this.__itemsViewport.setMinHeight(10);
        this.add(this.__itemsViewport, { flex: 1 });
        this.__itemsViewport.addListenerOnce("appear", () => {
            this.__setDomStyles(this.__itemsViewport, {
                overflow: "hidden",
            });
        });
        const footer = new BsSidebarAccount(globalThis.username || "User", formatRoleLabel(globalThis.userRole), "resource/app/user.png", "RB");
        this.__footer = footer;
        this.__footer.onAction((action) => {
            this.fireDataEvent("action", action);
        });
        this.add(footer);
        this.__renderVisibleItems(false);
    }
    __findFirstLeafLabel(items) {
        for (const item of items) {
            if (item.children && item.children.length > 0) {
                const nestedLabel = this.__findFirstLeafLabel(item.children);
                if (nestedLabel)
                    return nestedLabel;
            }
            else {
                return item.label;
            }
        }
        return null;
    }
    __getCurrentLevelItems() {
        if (this.__stack.length === 0)
            return this.__rootItems;
        return this.__stack[this.__stack.length - 1].items;
    }
    __collectLeafEntries(source, path = [], out = []) {
        source.forEach((item) => {
            const nextPath = [...path, item.label];
            if (item.children && item.children.length > 0) {
                this.__collectLeafEntries(item.children, nextPath, out);
            }
            else {
                out.push({ item, path: nextPath });
            }
        });
        return out;
    }
    __setPathFromLeaf(path) {
        const nextStack = [];
        let source = this.__rootItems;
        for (let i = 0; i < path.length - 1; i++) {
            const label = path[i];
            const match = source.find((entry) => entry.label === label);
            if (!match || !match.children || match.children.length === 0)
                break;
            nextStack.push({ label: match.label, items: match.children });
            source = match.children;
        }
        this.__stack = nextStack;
    }
    __syncBackVisibility() {
        const shouldShow = !this.__collapsed &&
            this.__searchQuery.length === 0 &&
            this.__stack.length > 0;
        if (shouldShow) {
            const parentLabel = this.__stack[this.__stack.length - 1].label;
            this.__backButton.setText(parentLabel);
            this.__backContainer.show();
        }
        else {
            this.__backContainer.exclude();
        }
    }
    __renderVisibleItems(animated) {
        this.__syncBackVisibility();
        const nextList = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
        nextList.setAllowGrowX(true);
        this.__buttons = [];
        this.__buttonStates.clear();
        if (this.__searchQuery.length > 0) {
            const query = this.__searchQuery.toLowerCase();
            const matches = this.__collectLeafEntries(this.__rootItems).filter(({ item, path }) => {
                const haystack = `${path.join(" ")} ${item.label}`.toLowerCase();
                return haystack.includes(query);
            });
            matches.forEach(({ item, path }) => {
                const parentTrail = path.slice(0, path.length - 1).join(" / ");
                const displayLabel = parentTrail
                    ? `${item.label} - ${parentTrail}`
                    : item.label;
                const row = this.__createListRow();
                const button = this.__createSidebarButton(displayLabel, item.icon, false);
                button.onClick(() => {
                    this.__activeLeafLabel = item.label;
                    this.__searchQuery = "";
                    this.__searchInput.setValue("");
                    this.__setPathFromLeaf(path);
                    this.fireDataEvent("select", item.label);
                    this.__renderVisibleItems(false);
                });
                row.add(button, { flex: 1 });
                nextList.add(row);
            });
        }
        else {
            const currentItems = this.__getCurrentLevelItems();
            currentItems.forEach((item) => {
                const hasChildren = !!item.children && item.children.length > 0;
                const row = this.__createListRow();
                const button = this.__createSidebarButton(item.label, item.icon, hasChildren);
                if (hasChildren) {
                    button.onClick(() => {
                        if (this.__isAnimating || !item.children)
                            return;
                        this.__stack.push({ label: item.label, items: item.children });
                        this.__renderVisibleItems(true);
                    });
                }
                else {
                    button.setActive(item.label === this.__activeLeafLabel);
                    button.onClick(() => {
                        this.__activeLeafLabel = item.label;
                        this.fireDataEvent("select", item.label);
                        this.__buttonStates.forEach((entry, label) => {
                            entry.setActive(label === item.label);
                        });
                    });
                }
                row.add(button, { flex: 1 });
                nextList.add(row);
            });
        }
        if (!this.__listContainer || !animated || this.__collapsed) {
            this.__itemsViewport.removeAll();
            this.__itemsViewport.add(nextList);
            this.__listContainer = nextList;
            return;
        }
        const previousList = this.__listContainer;
        this.__isAnimating = true;
        this.__itemsViewport.add(nextList);
        this.__setDomStyles(nextList, {
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            opacity: "0",
            transform: "translateX(30px)",
            transition: "opacity 280ms cubic-bezier(0.4, 0, 0.2, 1), transform 280ms cubic-bezier(0.4, 0, 0.2, 1)",
        });
        this.__setDomStyles(previousList, {
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            opacity: "1",
            transform: "translateX(0px)",
            transition: "opacity 280ms cubic-bezier(0.4, 0, 0.2, 1), transform 280ms cubic-bezier(0.4, 0, 0.2, 1)",
        });
        qx.event.Timer.once(() => {
            this.__setDomStyles(previousList, {
                opacity: "0",
                transform: "translateX(-30px)",
            });
            this.__setDomStyles(nextList, {
                opacity: "1",
                transform: "translateX(0px)",
            });
        }, this, 20);
        qx.event.Timer.once(() => {
            this.__itemsViewport.remove(previousList);
            this.__setDomStyles(nextList, {
                position: "relative",
                transform: "none",
            });
            this.__listContainer = nextList;
            this.__isAnimating = false;
        }, this, 320);
    }
    __createListRow() {
        const row = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({ alignY: "middle" }));
        row.set({
            allowGrowX: true,
            height: 40,
        });
        return row;
    }
    __createSidebarButton(label, icon, hasChildren) {
        const button = new BsSidebarButton(label, icon);
        button.setAllowGrowX(true);
        button.setCollapsed(this.__collapsed);
        button.setWidth(this.__collapsed ? 56 : 230);
        if (hasChildren) {
            button.setTrailingHtml("&rsaquo;");
        }
        this.__buttons.push(button);
        this.__buttonStates.set(label, button);
        return button;
    }
    __setDomStyles(widget, styles) {
        const contentElement = widget.getContentElement();
        if (!contentElement || !contentElement.setStyle)
            return;
        for (const key in styles) {
            if (!Object.prototype.hasOwnProperty.call(styles, key))
                continue;
            contentElement.setStyle(key, styles[key]);
        }
    }
    setCollapsed(collapsed) {
        this.__collapsed = collapsed;
        const DURATION = 280;
        const EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
        const skipAnimation = !this.__hasRendered;
        this.__hasRendered = true;
        if (collapsed) {
            if (skipAnimation) {
                this.setWidth(0);
                this.setMinWidth(0);
                this.__setDomStyles(this, { overflow: "hidden", opacity: "0" });
                return;
            }
            this.setMinWidth(0);
            this.__setDomStyles(this, {
                overflow: "hidden",
                willChange: "width, opacity",
                transition: `width ${DURATION}ms ${EASING}, min-width ${DURATION}ms ${EASING}, opacity ${DURATION}ms ${EASING}`,
                width: "0px",
                minWidth: "0px",
                opacity: "0",
            });
            qx.event.Timer.once(() => {
                this.setWidth(0);
                this.setMinWidth(0);
                this.__setDomStyles(this, { transition: "none", willChange: "auto" });
            }, this, DURATION + 20);
            return;
        }
        if (skipAnimation) {
            this.show();
            this.setMinWidth(230);
            this.setWidth(230);
            this.__setDomStyles(this, { overflow: "visible", opacity: "1" });
        }
        else {
            this.show();
            this.setMinWidth(0);
            this.setWidth(0);
            this.__setDomStyles(this, {
                overflow: "hidden",
                opacity: "0",
                width: "0px",
                minWidth: "0px",
                willChange: "width, opacity",
                transition: "none",
            });
            qx.event.Timer.once(() => {
                this.__setDomStyles(this, {
                    transition: `width ${DURATION}ms ${EASING}, min-width ${DURATION}ms ${EASING}, opacity ${DURATION}ms ${EASING}`,
                    width: "230px",
                    minWidth: "230px",
                    opacity: "1",
                });
            }, this, 20);
            qx.event.Timer.once(() => {
                this.setMinWidth(230);
                this.setWidth(230);
                this.__setDomStyles(this, {
                    overflow: "visible",
                    transition: "none",
                    willChange: "auto",
                });
            }, this, DURATION + 40);
        }
        this.__applyChromeMode();
    }
    setDrawerMode(enabled) {
        this.__drawerMode = enabled;
        if (this.__collapsed)
            return;
        this.__applyChromeMode();
        this.__renderVisibleItems(false);
    }
    __applyChromeMode() {
        if (this.__drawerMode) {
            this.setPadding(8);
            this.__schoolLogo.exclude();
            this.__header.exclude();
            this.__appVersion.exclude();
            this.__footer.exclude();
            this.__searchInput.show();
            this.__syncBackVisibility();
            return;
        }
        this.setPadding(10);
        this.__schoolLogo.show();
        this.__header.show();
        this.__appVersion.show();
        this.__footer.show();
        this.__syncBackVisibility();
    }
    isCollapsed() {
        return this.__collapsed;
    }
}
Sidebar.events = {
    select: "qx.event.type.Data",
    action: "qx.event.type.Data",
};
class AgGridTable extends qx.ui.container.Composite {
    constructor(columns, options) {
        super(new qx.ui.layout.Grow());
        this.__rows = [];
        this.__gridApi = null;
        this.__selectedRow = null;
        this.__gridId = `ag-grid-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        this.__columns = columns;
        this.__options = options !== null && options !== void 0 ? options : {};
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
    setRows(rows) {
        this.__rows = rows.slice();
        if (this.__gridApi) {
            this.__gridApi.setGridOption("rowData", this.__rows);
            this.__syncSelection();
            this.__updateOverlay();
            this.__sizeColumnsToFit();
        }
    }
    getSelectedRow() {
        return this.__selectedRow;
    }
    __ensureGrid() {
        var _a, _b;
        if (this.__gridApi) {
            return;
        }
        const root = this.__html.getContentElement().getDomElement();
        const gridElement = root === null || root === void 0 ? void 0 : root.querySelector(`#${this.__gridId}`);
        if (!gridElement) {
            qx.event.Timer.once(() => this.__ensureGrid(), this, 0);
            return;
        }
        if (!((_a = window.agGrid) === null || _a === void 0 ? void 0 : _a.createGrid)) {
            this.__html.setHtml(`
        <div class="app-ag-grid-shell">
          <div class="app-ag-grid-error">
            AG Grid failed to load. Check the local asset paths in index.html.
          </div>
        </div>
      `);
            return;
        }
        const columnDefs = this.__columns.map((column) => {
            var _a, _b, _c, _d, _e;
            return ({
                headerName: column.headerName,
                field: column.field,
                hide: (_a = column.hide) !== null && _a !== void 0 ? _a : false,
                minWidth: (_b = column.minWidth) !== null && _b !== void 0 ? _b : 120,
                width: column.width,
                flex: (_c = column.flex) !== null && _c !== void 0 ? _c : (column.width ? undefined : 1),
                sortable: (_d = column.sortable) !== null && _d !== void 0 ? _d : true,
                filter: (_e = column.filter) !== null && _e !== void 0 ? _e : true,
                resizable: true,
                valueGetter: column.valueGetter
                    ? (params) => column.valueGetter(params.data)
                    : undefined,
                valueFormatter: column.valueFormatter
                    ? (params) => column.valueFormatter(params.value, params.data)
                    : undefined,
            });
        });
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
            overlayNoRowsTemplate: `<span>${(_b = this.__options.emptyMessage) !== null && _b !== void 0 ? _b : "No records found."}</span>`,
            getRowId: this.__options.rowId
                ? (params) => this.__options.rowId(params.data)
                : undefined,
            onSelectionChanged: () => {
                var _a;
                const selectedRows = this.__gridApi.getSelectedRows();
                this.__selectedRow = (_a = selectedRows[0]) !== null && _a !== void 0 ? _a : null;
            },
            onGridReady: () => {
                this.__updateOverlay();
                this.__sizeColumnsToFit();
            },
        });
        this.__updateOverlay();
        this.__sizeColumnsToFit();
    }
    __syncSelection() {
        if (!this.__selectedRow || !this.__gridApi) {
            return;
        }
        const selectedRow = this.__selectedRow;
        let matchFound = false;
        this.__gridApi.forEachNode((node) => {
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
    __updateOverlay() {
        if (!this.__gridApi) {
            return;
        }
        this.__gridApi.setGridOption("activeOverlay", this.__rows.length === 0 ? "agNoRowsOverlay" : undefined);
    }
    __sizeColumnsToFit() {
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
class InlineSvgIcon extends qx.ui.embed.Html {
    constructor(name, size = 20) {
        super("");
        this.__name = name;
        this.__size = size;
        this.set({
            width: size,
            height: size,
            minWidth: size,
            minHeight: size,
            selectable: false,
        });
        this.__loadAndRender();
    }
    setIcon(name) {
        this.__name = name;
        this.__loadAndRender();
    }
    setSize(size) {
        this.__size = size;
        this.setWidth(size);
        this.setHeight(size);
        this.setMinWidth(size);
        this.setMinHeight(size);
        this.__loadAndRender();
    }
    __loadAndRender() {
        const url = "resource/app/icons/" + this.__name + ".svg";
        fetch(url)
            .then((r) => r.text())
            .then((svg) => {
            // Force width/height and make sure it uses currentColor
            // (If your SVG already has stroke="currentColor", this is harmless.)
            let out = svg;
            // Ensure currentColor (covers hardcoded strokes)
            out = out.replace(/stroke="[^"]*"/g, `stroke="currentColor"`);
            // Ensure sizing on root <svg> only (do not touch child element sizes)
            out = out.replace(/<svg\b[^>]*>/, (tag) => {
                const cleanedTag = tag
                    .replace(/\swidth="[^"]*"/g, "")
                    .replace(/\sheight="[^"]*"/g, "")
                    .replace(/\sstyle="[^"]*"/g, "");
                return cleanedTag.replace("<svg", `<svg width="${this.__size}" height="${this.__size}" style="display:block;"`);
            });
            this.setHtml(out);
            // Qooxdoo nudge after DOM update
            this.invalidateLayoutCache();
        })
            .catch(() => this.setHtml(""));
    }
}
class SvgIcon extends qx.ui.basic.Image {
    constructor(name, size = 24) {
        super(SvgIcon.BASE + name + ".svg");
        this.__name = name;
        this.__size = size;
        this.set({
            width: size,
            height: size,
            scale: true, // allow scaling SVG to widget size
            allowGrowX: false,
            allowGrowY: false,
            allowShrinkX: false,
            allowShrinkY: false,
        });
    }
    setIcon(name) {
        if (this.__name === name)
            return;
        this.__name = name;
        this.setSource(SvgIcon.BASE + name + ".svg");
    }
    setSize(size) {
        if (this.__size === size)
            return;
        this.__size = size;
        this.setWidth(size);
        this.setHeight(size);
    }
}
// Change this once to match your app namespace/folder
SvgIcon.BASE = "resource/app/icons/";
/**
 * Singleton modal dialog. One shared <dialog> element is reused for every
 * invocation — content, title, and buttons are swapped dynamically.
 * Footer buttons use event delegation via data-action attributes.
 */
class BsAlertDialog {
    constructor() { }
    static show(config) {
        var _a, _b, _c, _d;
        const dialog = BsAlertDialog.__getOrCreateDialog();
        // Dispose previous qooxdoo widget tree
        BsAlertDialog.__disposeBody();
        // Title
        BsAlertDialog.__titleEl.textContent = config.title;
        // Body
        const body = BsAlertDialog.__body;
        if (config.children) {
            dialog.removeAttribute("aria-describedby");
            const bodyHost = document.createElement("div");
            body.appendChild(bodyHost);
            BsAlertDialog.__bodyRoot = new qx.ui.root.Inline(bodyHost);
            BsAlertDialog.__bodyRoot.setLayout(new qx.ui.layout.Grow());
            BsAlertDialog.__bodyRoot.add(config.children);
        }
        else if (config.description) {
            dialog.setAttribute("aria-describedby", "bs-dialog-desc");
            const p = document.createElement("p");
            p.id = "bs-dialog-desc";
            p.textContent = config.description;
            body.appendChild(p);
        }
        // Footer buttons (rebuilt each time for correct labels)
        const footer = BsAlertDialog.__footer;
        footer.innerHTML = "";
        const buttons = (_a = config.footerButtons) !== null && _a !== void 0 ? _a : "ok-cancel";
        const cancelLabel = (_b = config.cancelLabel) !== null && _b !== void 0 ? _b : "Cancel";
        const continueLabel = (_c = config.continueLabel) !== null && _c !== void 0 ? _c : "Continue";
        if (buttons === "ok-cancel" || buttons === "cancel") {
            const cancelBtn = document.createElement("button");
            cancelBtn.className = "btn-sm-primary";
            cancelBtn.textContent = cancelLabel;
            cancelBtn.type = "button";
            cancelBtn.dataset.action = "cancel";
            footer.appendChild(cancelBtn);
        }
        if (buttons === "ok-cancel" || buttons === "ok") {
            const continueBtn = document.createElement("button");
            continueBtn.className = "btn-sm-primary";
            continueBtn.textContent = continueLabel;
            continueBtn.type = "button";
            continueBtn.dataset.action = "continue";
            footer.appendChild(continueBtn);
        }
        BsAlertDialog.__onContinue = (_d = config.onContinue) !== null && _d !== void 0 ? _d : null;
        dialog.showModal();
    }
    static __disposeBody() {
        if (BsAlertDialog.__bodyRoot) {
            BsAlertDialog.__bodyRoot.removeAll();
            BsAlertDialog.__bodyRoot.destroy();
            BsAlertDialog.__bodyRoot = null;
        }
        BsAlertDialog.__body.innerHTML = "";
    }
    static __getOrCreateDialog() {
        if (BsAlertDialog.__dialog)
            return BsAlertDialog.__dialog;
        const dialog = document.createElement("dialog");
        dialog.id = "bs-global-dialog";
        dialog.className = "dialog";
        dialog.setAttribute("aria-labelledby", "bs-dialog-title");
        const wrapper = document.createElement("div");
        const header = document.createElement("header");
        const title = document.createElement("h2");
        title.id = "bs-dialog-title";
        header.appendChild(title);
        const body = document.createElement("div");
        const footer = document.createElement("footer");
        wrapper.appendChild(header);
        wrapper.appendChild(body);
        wrapper.appendChild(footer);
        dialog.appendChild(wrapper);
        document.body.appendChild(dialog);
        // Event delegation — single handler for all footer button clicks
        footer.addEventListener("click", (e) => {
            var _a;
            const target = e.target.closest("button[data-action]");
            if (!target)
                return;
            const action = target.dataset.action;
            if (action === "cancel") {
                dialog.close();
            }
            else if (action === "continue") {
                dialog.close();
                (_a = BsAlertDialog.__onContinue) === null || _a === void 0 ? void 0 : _a.call(BsAlertDialog);
            }
        });
        BsAlertDialog.__dialog = dialog;
        BsAlertDialog.__titleEl = title;
        BsAlertDialog.__body = body;
        BsAlertDialog.__footer = footer;
        return dialog;
    }
}
BsAlertDialog.__dialog = null;
BsAlertDialog.__titleEl = null;
BsAlertDialog.__body = null;
BsAlertDialog.__footer = null;
BsAlertDialog.__bodyRoot = null;
BsAlertDialog.__onContinue = null;
class BsAvatar extends qx.ui.basic.Atom {
    constructor(src, alt, fallback, className, shape = "full") {
        super();
        this.__imgEl = null;
        this.__fallbackEl = null;
        this.__hasImageError = false;
        this._setLayout(new qx.ui.layout.Grow());
        this.__src = src !== null && src !== void 0 ? src : "";
        this.__alt = alt !== null && alt !== void 0 ? alt : "User avatar";
        this.__fallback = fallback !== null && fallback !== void 0 ? fallback : "?";
        this.__className = className !== null && className !== void 0 ? className : "";
        this.__shape = shape;
        this.__htmlAvatar = new qx.ui.embed.Html("");
        this.__render();
        this._add(this.__htmlAvatar);
        this.__htmlAvatar.addListenerOnce("appear", () => {
            this.__bindDom();
        });
    }
    __escape(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
    __resolveShapeClass() {
        if (this.__shape === "rounded")
            return "rounded-md";
        if (this.__shape === "square")
            return "rounded-none";
        return "rounded-full";
    }
    __bindDom() {
        var _a, _b;
        const root = this.__htmlAvatar.getContentElement().getDomElement();
        this.__imgEl = (_a = root === null || root === void 0 ? void 0 : root.querySelector("img")) !== null && _a !== void 0 ? _a : null;
        this.__fallbackEl =
            (_b = root === null || root === void 0 ? void 0 : root.querySelector("[data-avatar-fallback]")) !== null && _b !== void 0 ? _b : null;
        if (!this.__imgEl)
            return;
        this.__imgEl.onerror = () => {
            this.__hasImageError = true;
            this.__syncVisibility();
        };
        this.__imgEl.onload = () => {
            this.__hasImageError = false;
            this.__syncVisibility();
        };
        this.__syncVisibility();
    }
    __syncVisibility() {
        if (!this.__fallbackEl)
            return;
        const shouldShowFallback = !this.__src || this.__hasImageError;
        this.__fallbackEl.style.display = shouldShowFallback ? "flex" : "none";
    }
    __render() {
        const src = this.__escape(this.__src);
        const alt = this.__escape(this.__alt);
        const fallback = this.__escape(this.__fallback);
        const shapeClass = this.__resolveShapeClass();
        const wrapperClass = [
            "relative",
            "inline-flex",
            "size-8",
            "shrink-0",
            shapeClass,
            this.__className,
        ]
            .filter(Boolean)
            .join(" ");
        const imageClass = ["size-full", "object-cover", shapeClass]
            .filter(Boolean)
            .join(" ");
        const fallbackClass = [
            "absolute",
            "inset-0",
            "items-center",
            "justify-center",
            "bg-muted",
            "text-muted-foreground",
            "text-xs",
            "font-medium",
            shapeClass,
        ]
            .filter(Boolean)
            .join(" ");
        this.__htmlAvatar.setHtml(`
			<div class="p-1">
				<span class="${wrapperClass}">
					<img
						class="${imageClass}"
						alt="${alt}"
						src="${src}"
					/>
					<span class="${fallbackClass}" data-avatar-fallback>
						${fallback}
					</span>
				</span>
			</div>
		`);
        qx.event.Timer.once(() => this.__bindDom(), this, 0);
    }
    setSrc(src) {
        this.__src = src !== null && src !== void 0 ? src : "";
        this.__hasImageError = false;
        this.__render();
        return this;
    }
    setAlt(alt) {
        this.__alt = alt !== null && alt !== void 0 ? alt : "User avatar";
        this.__render();
        return this;
    }
    setFallback(fallback) {
        this.__fallback = fallback !== null && fallback !== void 0 ? fallback : "?";
        this.__render();
        return this;
    }
    setShape(shape) {
        this.__shape = shape;
        this.__render();
        return this;
    }
}
class BsButton extends qx.ui.basic.Atom {
    constructor(text, icon, options) {
        var _a, _b, _c;
        super();
        this.__variant = "default";
        this.__size = "default";
        this.__buttonEl = null;
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        this.setFocusable(true);
        this.__iconHtml = icon ? icon.getHtml() : "";
        this.__buttonText = text !== null && text !== void 0 ? text : "";
        this.__className = (_a = options === null || options === void 0 ? void 0 : options.className) !== null && _a !== void 0 ? _a : "";
        this.__variant = (_b = options === null || options === void 0 ? void 0 : options.variant) !== null && _b !== void 0 ? _b : "default";
        this.__size = (_c = options === null || options === void 0 ? void 0 : options.size) !== null && _c !== void 0 ? _c : "default";
        this.__htmlButton = new qx.ui.embed.Html("");
        this.__renderButton();
        this._add(this.__htmlButton);
        this.__htmlButton.addListener("tap", () => this.fireEvent("execute"));
        this.__htmlButton.addListenerOnce("appear", () => {
            this.__bindNativeButton();
        });
        this.addListener("focusin", () => { var _a; return (_a = this.__buttonEl) === null || _a === void 0 ? void 0 : _a.focus(); });
        this.addListener("changeTabIndex", () => this.__syncTabIndex());
        if (icon) {
            icon.addListener("changeHtml", () => {
                this.__iconHtml = icon.getHtml();
                this.__renderButton();
            });
        }
    }
    __bindNativeButton() {
        var _a;
        const root = this.__htmlButton.getContentElement().getDomElement();
        this.__buttonEl =
            (_a = root === null || root === void 0 ? void 0 : root.querySelector("button")) !== null && _a !== void 0 ? _a : null;
        if (!this.__buttonEl)
            return;
        this.__syncTabIndex();
    }
    __syncTabIndex() {
        if (!this.__buttonEl)
            return;
        this.__buttonEl.setAttribute("tabindex", "-1");
    }
    __renderButton() {
        const isIconSize = this.__size === "icon" || this.__size === "sm-icon";
        const iconPart = this.__iconHtml
            ? `<span class="${isIconSize ? "" : "me-2"}">${this.__iconHtml}</span>`
            : "";
        const tabIndexAttr = 'tabindex="-1"';
        const variantClass = this.__resolveVariantClass();
        const sizeClass = this.__resolveSizeClass();
        const classes = [variantClass, sizeClass, this.__className]
            .filter(Boolean)
            .join(" ");
        this.__htmlButton.setHtml(`
      <div class="p-1">
        <button type="button" class="w-full ${classes}" ${tabIndexAttr}>
          ${iconPart}
          ${this.__buttonText}
        </button>
      </div>
    `);
        qx.event.Timer.once(() => this.__bindNativeButton(), this, 0);
    }
    __resolveVariantClass() {
        const variantMap = {
            default: "primary",
            secondary: "secondary",
            destructive: "destructive",
            outline: "outline",
            ghost: "ghost",
            link: "link",
        };
        const variantSuffix = variantMap[this.__variant];
        const isIconSize = this.__size === "icon" || this.__size === "sm-icon" || this.__size === "lg-icon";
        const sizePrefix = isIconSize ? "icon" : this.__size;
        if (sizePrefix === "default") {
            return `btn-${variantSuffix}`;
        }
        return `btn-${sizePrefix}-${variantSuffix}`;
    }
    __resolveSizeClass() {
        return "";
    }
    getVariant() {
        return this.__variant;
    }
    getSize() {
        return this.__size;
    }
    onClick(handler) {
        this.addListener("execute", handler);
        return this;
    }
}
BsButton.events = {
    execute: "qx.event.type.Event",
};
class BsDrawer extends qx.ui.container.Composite {
    constructor(content, drawerPanel) {
        var _a, _b;
        super(new qx.ui.layout.Canvas());
        this.__open = false;
        this.__isAnimating = false;
        this.__animationToken = 0;
        this.__dragStartY = null;
        this.__dragOffset = 0;
        this.add(content, { left: 0, right: 0, top: 0, bottom: 0 });
        this.__backdrop = new qx.ui.core.Widget();
        this.__backdrop.set({
            backgroundColor: AppColors.overlay(0.45),
            zIndex: 20,
        });
        this.__backdrop.addListener("tap", () => this.close());
        this.add(this.__backdrop, { left: 0, right: 0, top: 0, bottom: 0 });
        this.__drawerPanel = drawerPanel;
        (_b = (_a = this.__drawerPanel).resetWidth) === null || _b === void 0 ? void 0 : _b.call(_a);
        this.__drawerPanel.setAllowGrowX(true);
        this.__drawerPanel.setAllowGrowY(true);
        const handleRow = new qx.ui.container.Composite(new qx.ui.layout.HBox());
        handleRow.set({
            alignY: "middle",
            paddingTop: 10,
            paddingBottom: 8,
        });
        const spacerLeft = new qx.ui.core.Spacer();
        const spacerRight = new qx.ui.core.Spacer();
        this.__dragHandle = new qx.ui.core.Widget();
        this.__dragHandle.set({
            width: 56,
            height: 6,
            backgroundColor: AppColors.primary(),
            cursor: "ns-resize",
        });
        this.__dragHandle.setDecorator(new qx.ui.decoration.Decorator().set({
            radius: 999,
        }));
        handleRow.add(spacerLeft, { flex: 1 });
        handleRow.add(this.__dragHandle);
        handleRow.add(spacerRight, { flex: 1 });
        this.__bodyScroll = new qx.ui.container.Scroll();
        this.__bodyScroll.add(this.__drawerPanel);
        const sheetHeight = Math.floor(qx.bom.Viewport.getHeight() * 0.5);
        this.__sheet = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        this.__sheet.set({
            zIndex: 30,
            minHeight: sheetHeight,
            maxHeight: sheetHeight,
        });
        this.__sheet.add(handleRow);
        this.__sheet.add(this.__bodyScroll, { flex: 1 });
        this.add(this.__sheet, { left: 0, right: 0, bottom: 0 });
        this.__sheet.setDecorator(new qx.ui.decoration.Decorator().set({
            radiusTopLeft: 16,
            radiusTopRight: 16,
            shadowBlurRadius: 45,
            shadowVerticalLength: -20,
            shadowColor: "rgba(0,0,0,0.22)",
        }));
        this.__sheet.setBackgroundColor(AppColors.sidebar());
        // Start hidden off-screen
        this.__hideImmediate();
        this.__wireDragToClose();
    }
    __hideImmediate() {
        this.__setDomStyles(this.__backdrop, {
            opacity: "0",
            visibility: "hidden",
            pointerEvents: "none",
            transition: "none",
        });
        this.__setDomStyles(this.__sheet, {
            transform: "translateY(110%)",
            visibility: "hidden",
            pointerEvents: "none",
            transition: "none",
            willChange: "transform",
        });
    }
    open() {
        if (this.__open)
            return;
        this.__open = true;
        this.__isAnimating = true;
        const token = ++this.__animationToken;
        // Make visible at off-screen position, no transition yet
        this.__setDomStyles(this.__backdrop, {
            visibility: "visible",
            pointerEvents: "auto",
            opacity: "0",
            transition: "none",
        });
        this.__setDomStyles(this.__sheet, {
            visibility: "visible",
            pointerEvents: "auto",
            transform: "translateY(110%)",
            transition: "none",
        });
        // Force reflow so the browser registers the initial position
        this.__forceReflow();
        // Now enable transitions and animate to final position
        this.__setDomStyles(this.__backdrop, {
            opacity: "1",
            transition: "opacity 200ms ease",
        });
        this.__setDomStyles(this.__sheet, {
            transform: "translateY(0px)",
            transition: "transform 260ms cubic-bezier(0.16, 1, 0.3, 1)",
        });
        qx.event.Timer.once(() => {
            if (token !== this.__animationToken)
                return;
            this.__isAnimating = false;
        }, this, 280);
    }
    close() {
        if (!this.__open)
            return;
        this.__open = false;
        this.__isAnimating = true;
        const token = ++this.__animationToken;
        this.__setDomStyles(this.__backdrop, {
            opacity: "0",
            transition: "opacity 180ms ease",
        });
        this.__setDomStyles(this.__sheet, {
            transform: "translateY(110%)",
            transition: "transform 220ms cubic-bezier(0.4, 0, 1, 1)",
        });
        qx.event.Timer.once(() => {
            if (token !== this.__animationToken)
                return;
            this.__setDomStyles(this.__backdrop, {
                visibility: "hidden",
                pointerEvents: "none",
            });
            this.__setDomStyles(this.__sheet, {
                visibility: "hidden",
                pointerEvents: "none",
            });
            this.__isAnimating = false;
            this.__dragStartY = null;
            this.__dragOffset = 0;
        }, this, 240);
    }
    toggle() {
        this.__open ? this.close() : this.open();
    }
    isOpen() {
        return this.__open;
    }
    __forceReflow() {
        const el = this.__sheet
            .getContentElement()
            .getDomElement();
        if (el)
            el.offsetHeight;
    }
    __wireDragToClose() {
        this.__dragHandle.addListener("pointerdown", (ev) => {
            if (!this.__open || this.__isAnimating)
                return;
            this.__dragStartY = ev.getDocumentTop();
            this.__dragOffset = 0;
            this.__setDomStyles(this.__sheet, {
                transition: "none",
            });
            ev.stopPropagation();
        });
        this.addListener("pointermove", (ev) => {
            if (this.__dragStartY === null || !this.__open || this.__isAnimating)
                return;
            const y = ev.getDocumentTop();
            const delta = Math.max(0, y - this.__dragStartY);
            this.__dragOffset = delta;
            this.__setDomStyles(this.__sheet, {
                transform: `translateY(${delta}px)`,
            });
            const fadeProgress = Math.min(1, delta / Math.max(1, this.__getPanelHeight() * 0.8));
            this.__setDomStyles(this.__backdrop, {
                opacity: `${1 - fadeProgress}`,
            });
        });
        const finishDrag = (ev) => {
            if (this.__dragStartY === null)
                return;
            const shouldClose = this.__dragOffset > Math.max(80, this.__getPanelHeight() * 0.22);
            this.__dragStartY = null;
            if (ev)
                ev.stopPropagation();
            if (shouldClose) {
                this.close();
                return;
            }
            this.__setDomStyles(this.__sheet, {
                transition: "transform 180ms cubic-bezier(0.22, 1, 0.36, 1)",
                transform: "translateY(0px)",
            });
            this.__setDomStyles(this.__backdrop, {
                transition: "opacity 180ms ease",
                opacity: "1",
            });
            this.__dragOffset = 0;
        };
        this.addListener("pointerup", finishDrag);
        this.addListener("pointercancel", finishDrag);
    }
    __getPanelHeight() {
        var _a;
        const element = this.__sheet
            .getContentElement()
            .getDomElement();
        return (_a = element === null || element === void 0 ? void 0 : element.offsetHeight) !== null && _a !== void 0 ? _a : qx.bom.Viewport.getHeight() * 0.5;
    }
    __setDomStyles(widget, styles) {
        const contentElement = widget.getContentElement();
        if (!contentElement || !contentElement.setStyle)
            return;
        for (const key in styles) {
            if (!Object.prototype.hasOwnProperty.call(styles, key))
                continue;
            contentElement.setStyle(key, styles[key]);
        }
    }
}
class BsInput extends qx.ui.basic.Atom {
    constructor(value, placeholder, className) {
        super();
        this.__leadingHtml = "";
        this.__inputEl = null;
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        // important for qooxdoo focus manager
        this.setFocusable(true);
        this.__value = value !== null && value !== void 0 ? value : "";
        this.__placeholder = placeholder !== null && placeholder !== void 0 ? placeholder : "";
        this.__className = className !== null && className !== void 0 ? className : "";
        this.__htmlInput = new qx.ui.embed.Html("");
        this.__htmlInput.setAllowGrowX(true);
        this.__render();
        this._add(this.__htmlInput);
        this.__htmlInput.addListenerOnce("appear", () => {
            var _a;
            const root = this.__htmlInput.getContentElement().getDomElement();
            this.__inputEl = (_a = root === null || root === void 0 ? void 0 : root.querySelector("input")) !== null && _a !== void 0 ? _a : null;
            if (!this.__inputEl)
                return;
            this.__syncTabIndex();
            this.__inputEl.addEventListener("input", () => {
                var _a, _b;
                const next = (_b = (_a = this.__inputEl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : "";
                const prev = this.__value;
                this.__value = next;
                this.fireDataEvent("input", next);
                if (prev !== next)
                    this.fireDataEvent("changeValue", next);
            });
        });
        // when widget gets focus from Tab, move focus to native input
        this.addListener("focusin", () => {
            var _a;
            (_a = this.__inputEl) === null || _a === void 0 ? void 0 : _a.focus();
        });
        // keep native tabindex in sync
        this.addListener("changeTabIndex", () => {
            this.__syncTabIndex();
        });
    }
    __syncTabIndex() {
        if (!this.__inputEl)
            return;
        this.__inputEl.setAttribute("tabindex", "1");
    }
    __escapeAttr(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
    __render() {
        const hasLeadingIcon = this.__leadingHtml.length > 0;
        const classes = [
            "input",
            "bg-card",
            "text-foreground",
            "border-border",
            "placeholder:text-muted-foreground",
            hasLeadingIcon ? "pl-9" : "",
            this.__className,
        ]
            .filter(Boolean)
            .join(" ");
        const value = this.__escapeAttr(this.__value);
        const placeholder = this.__escapeAttr(this.__placeholder);
        const tabIndexAttr = 'tabindex="-1"';
        this.__htmlInput.setHtml(`
        <div class="relative p-1">
            ${hasLeadingIcon
            ? `<span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">${this.__leadingHtml}</span>`
            : ""}
            <input
            type="text"
            class="${classes}"
            value="${value}"
            placeholder="${placeholder}"
            ${tabIndexAttr}
            />
        </div>
    `);
    }
    getValue() {
        var _a, _b;
        return (_b = (_a = this.__inputEl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : this.__value;
    }
    setValue(value) {
        this.__value = value !== null && value !== void 0 ? value : "";
        if (this.__inputEl)
            this.__inputEl.value = this.__value;
        else
            this.__render();
        return this;
    }
    setPlaceholder(value) {
        this.__placeholder = value !== null && value !== void 0 ? value : "";
        if (this.__inputEl)
            this.__inputEl.placeholder = this.__placeholder;
        else
            this.__render();
        return this;
    }
    setLeadingHtml(html) {
        this.__leadingHtml = html !== null && html !== void 0 ? html : "";
        this.__render();
        return this;
    }
    onInput(handler) {
        this.addListener("input", (ev) => {
            var _a;
            handler((_a = ev.getData()) !== null && _a !== void 0 ? _a : "");
        });
        return this;
    }
}
BsInput.events = {
    input: "qx.event.type.Data",
    changeValue: "qx.event.type.Data",
};
class BsInputGroup extends qx.ui.container.Composite {
    constructor(labelText, placeholder, initialValue, inputClassName) {
        super(new qx.ui.layout.VBox(3));
        this.setAllowGrowX(true);
        this.__label = new qx.ui.basic.Label(labelText);
        this.__input = new BsInput(initialValue !== null && initialValue !== void 0 ? initialValue : "", placeholder !== null && placeholder !== void 0 ? placeholder : "", inputClassName);
        this.__input.setAllowGrowX(true);
        this.__error = new qx.ui.basic.Label("");
        this.__error.setVisibility("excluded");
        this.add(this.__label);
        this.add(this.__input);
        this.add(this.__error);
    }
    onInput(handler) {
        this.__input.onInput(handler);
        return this;
    }
    getValue() {
        var _a;
        return (_a = this.__input.getValue()) !== null && _a !== void 0 ? _a : "";
    }
    setValue(value) {
        this.__input.setValue(value);
        return this;
    }
    setError(message) {
        const text = (message !== null && message !== void 0 ? message : "").trim();
        this.__error.setValue(text);
        if (text) {
            this.__error.show();
        }
        else {
            this.__error.exclude();
        }
        return this;
    }
    clearError() {
        return this.setError("");
    }
    getInputWidget() {
        return this.__input;
    }
    setInputTabIndex(value) {
        this.__input.setTabIndex(value);
        return this;
    }
    resetInputTabIndex() {
        this.__input.resetTabIndex();
        return this;
    }
}
class BsPassword extends qx.ui.basic.Atom {
    constructor(value, placeholder, className) {
        super();
        this.__inputEl = null;
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        this.setFocusable(true);
        this.__value = value !== null && value !== void 0 ? value : "";
        this.__placeholder = placeholder !== null && placeholder !== void 0 ? placeholder : "";
        this.__className = className !== null && className !== void 0 ? className : "";
        this.__htmlInput = new qx.ui.embed.Html("");
        this.__htmlInput.setAllowGrowX(true);
        this.__render();
        this._add(this.__htmlInput);
        this.__htmlInput.addListenerOnce("appear", () => {
            var _a;
            const root = this.__htmlInput.getContentElement().getDomElement();
            this.__inputEl = (_a = root === null || root === void 0 ? void 0 : root.querySelector("input")) !== null && _a !== void 0 ? _a : null;
            if (!this.__inputEl)
                return;
            this.__syncTabIndex();
            this.__inputEl.addEventListener("input", () => {
                var _a, _b;
                const next = (_b = (_a = this.__inputEl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : "";
                const prev = this.__value;
                this.__value = next;
                this.fireDataEvent("input", next);
                if (prev !== next)
                    this.fireDataEvent("changeValue", next);
            });
        });
        this.addListener("focusin", () => {
            var _a;
            (_a = this.__inputEl) === null || _a === void 0 ? void 0 : _a.focus();
        });
        this.addListener("changeTabIndex", () => {
            this.__syncTabIndex();
        });
    }
    __syncTabIndex() {
        if (!this.__inputEl)
            return;
        this.__inputEl.setAttribute("tabindex", "1");
    }
    __escapeAttr(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
    __render() {
        const classes = [
            "input",
            "bg-card",
            "text-foreground",
            "border-border",
            "placeholder:text-muted-foreground",
            this.__className,
        ]
            .filter(Boolean)
            .join(" ");
        const value = this.__escapeAttr(this.__value);
        const placeholder = this.__escapeAttr(this.__placeholder);
        const tabIndexAttr = 'tabindex="-1"';
        this.__htmlInput.setHtml(`
        <div class="p-1">
            <input
            type="password"
            class="${classes}"
            value="${value}"
            placeholder="${placeholder}"
            ${tabIndexAttr}
            />
        </div>
    `);
    }
    getValue() {
        var _a, _b;
        return (_b = (_a = this.__inputEl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : this.__value;
    }
    setValue(value) {
        this.__value = value !== null && value !== void 0 ? value : "";
        if (this.__inputEl)
            this.__inputEl.value = this.__value;
        else
            this.__render();
        return this;
    }
    setPlaceholder(value) {
        this.__placeholder = value !== null && value !== void 0 ? value : "";
        if (this.__inputEl)
            this.__inputEl.placeholder = this.__placeholder;
        else
            this.__render();
        return this;
    }
    onInput(handler) {
        this.addListener("input", (ev) => {
            var _a;
            handler((_a = ev.getData()) !== null && _a !== void 0 ? _a : "");
        });
        return this;
    }
}
BsPassword.events = {
    input: "qx.event.type.Data",
    changeValue: "qx.event.type.Data",
};
class BsSelect extends qx.ui.basic.Atom {
    constructor(options = [], className) {
        super();
        this.__value = "";
        this.__selectEl = null;
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        this.setFocusable(true);
        this.__options = options;
        this.__className = className !== null && className !== void 0 ? className : "";
        this.__htmlSelect = new qx.ui.embed.Html("");
        this.__htmlSelect.setAllowGrowX(true);
        this.__render();
        this._add(this.__htmlSelect);
        this.__htmlSelect.addListenerOnce("appear", () => {
            this.__bindNativeSelect();
        });
        this.addListener("focusin", () => { var _a; return (_a = this.__selectEl) === null || _a === void 0 ? void 0 : _a.focus(); });
        this.addListener("changeTabIndex", () => this.__syncTabIndex());
    }
    __escape(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
    __syncTabIndex() {
        if (!this.__selectEl)
            return;
        this.__selectEl.setAttribute("tabindex", "-1");
    }
    __bindNativeSelect() {
        var _a;
        const root = this.__htmlSelect.getContentElement().getDomElement();
        this.__selectEl =
            (_a = root === null || root === void 0 ? void 0 : root.querySelector("select")) !== null && _a !== void 0 ? _a : null;
        if (!this.__selectEl)
            return;
        this.__syncTabIndex();
        this.__selectEl.onchange = () => {
            var _a, _b;
            this.__value = (_b = (_a = this.__selectEl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : "";
            this.fireDataEvent("changeValue", this.__value);
        };
    }
    __render() {
        const optionsHtml = [
            `<option value="">Select an option</option>`,
            ...this.__options.map((opt) => {
                const v = this.__escape(opt);
                const selected = this.__value === opt ? "selected" : "";
                return `<option value="${v}" ${selected}>${v}</option>`;
            }),
        ].join("");
        const tabIndexAttr = 'tabindex="-1"';
        const classes = ["select", this.__className].filter(Boolean).join(" ");
        this.__htmlSelect.setHtml(`
      <div class="p-1">
        <select class="w-full ${classes}" ${tabIndexAttr}>
          ${optionsHtml}
        </select>
      </div>
    `);
        qx.event.Timer.once(() => this.__bindNativeSelect(), this, 0);
    }
    getSelectedValue() {
        var _a, _b;
        return (_b = (_a = this.__selectEl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : this.__value;
    }
    setSelectedByLabel(label) {
        this.__value = this.__options.indexOf(label) !== -1 ? label : "";
        if (this.__selectEl)
            this.__selectEl.value = this.__value;
        else
            this.__render();
        return this;
    }
    resetSelection() {
        this.__value = "";
        if (this.__selectEl)
            this.__selectEl.value = "";
        else
            this.__render();
        return this;
    }
    onChange(handler) {
        this.addListener("changeValue", (ev) => {
            var _a;
            handler((_a = ev.getData()) !== null && _a !== void 0 ? _a : "");
        });
        return this;
    }
}
BsSelect.events = {
    changeValue: "qx.event.type.Data",
};
class BsSeparator extends qx.ui.basic.Atom {
    constructor(orientation = "horizontal", decorative = true, className, label) {
        super();
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        this.setAllowGrowY(true);
        this.__orientation = orientation;
        this.__decorative = decorative;
        this.__className = className !== null && className !== void 0 ? className : "";
        this.__label = label !== null && label !== void 0 ? label : "";
        this.__htmlSeparator = new qx.ui.embed.Html("");
        this.__htmlSeparator.setAllowGrowX(true);
        this.__render();
        this._add(this.__htmlSeparator);
    }
    __escapeHtml(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
    __render() {
        const isHorizontal = this.__orientation === "horizontal";
        const baseClasses = isHorizontal
            ? "divider w-full"
            : "divider divider-horizontal h-full";
        const roleAttr = this.__decorative ? "" : 'role="separator"';
        const ariaOrientation = this.__decorative
            ? ""
            : `aria-orientation="${this.__orientation}"`;
        const content = this.__label ? this.__escapeHtml(this.__label) : "";
        this.__htmlSeparator.setHtml(`
      <div class="${baseClasses} ${this.__className}" ${roleAttr} ${ariaOrientation}>
        ${content}
      </div>
    `);
    }
    setLabel(value) {
        this.__label = value !== null && value !== void 0 ? value : "";
        this.__render();
        return this;
    }
}
class BsSidebarAccount extends qx.ui.basic.Atom {
    constructor(name, username, avatarSrc, avatarFallback, className) {
        super();
        this.__collapsed = false;
        this.__buttonEl = null;
        this.__avatarEl = null;
        this.__avatarFallbackEl = null;
        this.__hasImageError = false;
        this.__isMenuOpen = false;
        this.__outsideClickHandler = null;
        this.__rootClickHandler = null;
        this.__boundRootEl = null;
        this.__menuAnimToken = 0;
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        this.__htmlButton = new qx.ui.embed.Html("");
        this.__htmlButton.setAllowGrowX(true);
        this.__menuPopup = new qx.ui.popup.Popup(new qx.ui.layout.Grow());
        this.__menuPopup.setAutoHide(false);
        this.__menuPopup.setDomMove(true);
        this.__menuPopup.setZIndex(100000);
        this.__menuPopup.setAllowGrowX(false);
        this.__menuPopup.setAllowGrowY(true);
        this.__menuPopup.setPadding(0);
        this.__menuPopup.setBackgroundColor("transparent");
        this.__menuPopup.setDecorator(new qx.ui.decoration.Decorator().set({
            width: 1,
            style: "solid",
            color: AppColors.border(),
            radius: 10,
            shadowVerticalLength: 2,
            shadowBlurRadius: 10,
            shadowColor: AppColors.overlay(0.1),
        }));
        this.__menuContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
        this.__menuContainer.set({
            minWidth: 224,
            paddingTop: 6,
            paddingRight: 6,
            paddingBottom: 6,
            paddingLeft: 6,
            backgroundColor: AppColors.card(),
            textColor: AppColors.foreground(),
        });
        this.__menuPopup.add(this.__menuContainer);
        this.__buildMenuWidgets();
        this.__chevronUpDownIcon = new InlineSvgIcon("chevrons-up-down", 16);
        this.__chevronUpDownHTML = this.__chevronUpDownIcon.getHtml();
        this.__chevronUpDownIcon.addListener("changeHtml", () => {
            this.__chevronUpDownHTML = this.__chevronUpDownIcon.getHtml();
            this.__renderButton();
        });
        this.__name = name !== null && name !== void 0 ? name : "Ronan Berder";
        this.__username = username !== null && username !== void 0 ? username : "@hunvreus";
        this.__avatarSrc = avatarSrc !== null && avatarSrc !== void 0 ? avatarSrc : "resource/app/user.png";
        this.__avatarFallback = avatarFallback !== null && avatarFallback !== void 0 ? avatarFallback : "RB";
        this.__className = className !== null && className !== void 0 ? className : "";
        this.__renderButton();
        this._add(this.__htmlButton);
        this.__htmlButton.addListener("appear", () => {
            this.__bindNativeButton();
        });
        this.__menuPopup.addListener("disappear", () => {
            if (!this.__isMenuOpen)
                return;
            this.__isMenuOpen = false;
            this.__renderButton();
        });
        this.addListener("disappear", () => {
            this.__isMenuOpen = false;
            this.__unbindOutsideClick();
            this.__unbindNativeButton();
            this.__menuPopup.hide();
            this.__renderButton();
        });
    }
    __escape(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
    __bindNativeButton() {
        var _a, _b, _c;
        const root = this.__htmlButton.getContentElement().getDomElement();
        if (!root)
            return;
        if (this.__boundRootEl !== root) {
            this.__unbindNativeButton();
            this.__rootClickHandler = (ev) => {
                const target = ev.target;
                if (!target)
                    return;
                const trigger = target.closest("[data-account-trigger]");
                if (!trigger)
                    return;
                ev.preventDefault();
                ev.stopPropagation();
                this.fireEvent("execute");
                this.__toggleMenu();
            };
            root.addEventListener("click", this.__rootClickHandler);
            this.__boundRootEl = root;
        }
        const btn = (_a = root === null || root === void 0 ? void 0 : root.querySelector("[data-account-trigger]")) !== null && _a !== void 0 ? _a : null;
        this.__buttonEl = btn;
        if (!this.__buttonEl)
            return;
        this.__avatarEl =
            (_b = root === null || root === void 0 ? void 0 : root.querySelector("img")) !== null && _b !== void 0 ? _b : null;
        this.__avatarFallbackEl =
            (_c = root === null || root === void 0 ? void 0 : root.querySelector("[data-avatar-fallback]")) !== null && _c !== void 0 ? _c : null;
        if (this.__avatarEl) {
            this.__avatarEl.onerror = () => {
                this.__hasImageError = true;
                this.__syncAvatarFallback();
            };
            this.__avatarEl.onload = () => {
                this.__hasImageError = false;
                this.__syncAvatarFallback();
            };
        }
        this.__syncAvatarFallback();
    }
    __unbindNativeButton() {
        if (this.__boundRootEl && this.__rootClickHandler) {
            this.__boundRootEl.removeEventListener("click", this.__rootClickHandler);
        }
        this.__boundRootEl = null;
        this.__rootClickHandler = null;
    }
    __toggleMenu() {
        if (this.__isMenuOpen) {
            this.__closeMenu();
            return;
        }
        this.__openMenu();
    }
    __closeMenu() {
        if (!this.__isMenuOpen)
            return;
        this.__isMenuOpen = false;
        this.__unbindOutsideClick();
        const token = ++this.__menuAnimToken;
        this.__setPopupAnimationStyles({
            opacity: "0",
            transform: "translateY(-4px) scale(0.98)",
            transition: "opacity 100ms ease, transform 120ms ease",
            pointerEvents: "none",
        });
        qx.event.Timer.once(() => {
            if (token !== this.__menuAnimToken)
                return;
            this.__menuPopup.hide();
            this.__renderButton();
        }, this, 120);
    }
    __openMenu() {
        const token = ++this.__menuAnimToken;
        this.__menuPopup.show();
        this.__isMenuOpen = true;
        this.__renderButton();
        this.__bindOutsideClick();
        this.__placeMenuPopup();
        this.__setPopupAnimationStyles({
            opacity: "0",
            transform: "translateY(-6px) scale(0.985)",
            transition: "opacity 120ms ease, transform 140ms cubic-bezier(0.16, 1, 0.3, 1)",
            pointerEvents: "auto",
            transformOrigin: this.__collapsed ? "top right" : "top left",
        });
        qx.event.Timer.once(() => {
            if (token !== this.__menuAnimToken)
                return;
            this.__placeMenuPopup();
            this.__setPopupAnimationStyles({
                opacity: "1",
                transform: "translateY(0) scale(1)",
            });
        }, this, 0);
    }
    __setPopupAnimationStyles(styles) {
        const popupElement = this.__menuPopup.getContentElement();
        if (!(popupElement === null || popupElement === void 0 ? void 0 : popupElement.setStyle))
            return;
        for (const key in styles) {
            if (!Object.prototype.hasOwnProperty.call(styles, key))
                continue;
            popupElement.setStyle(key, styles[key]);
        }
    }
    __bindOutsideClick() {
        if (this.__outsideClickHandler)
            return;
        this.__outsideClickHandler = (ev) => {
            const target = ev.target;
            if (!target)
                return;
            const triggerRoot = this.__htmlButton.getContentElement().getDomElement();
            const popupRoot = this.__menuPopup.getContentElement().getDomElement();
            const clickedTrigger = !!triggerRoot && triggerRoot.contains(target);
            const clickedPopup = !!popupRoot && popupRoot.contains(target);
            if (!clickedTrigger && !clickedPopup)
                this.__closeMenu();
        };
        document.addEventListener("mousedown", this.__outsideClickHandler, true);
    }
    __unbindOutsideClick() {
        if (!this.__outsideClickHandler)
            return;
        document.removeEventListener("mousedown", this.__outsideClickHandler, true);
        this.__outsideClickHandler = null;
    }
    __placeMenuPopup() {
        var _a;
        const triggerRoot = this.__htmlButton.getContentElement().getDomElement();
        const triggerEl = (_a = triggerRoot === null || triggerRoot === void 0 ? void 0 : triggerRoot.querySelector("[data-account-trigger]")) !== null && _a !== void 0 ? _a : null;
        if (!triggerEl)
            return;
        const triggerRect = triggerEl.getBoundingClientRect();
        const popupEl = this.__menuPopup.getContentElement().getDomElement();
        if (!popupEl)
            return;
        const popupRect = popupEl.getBoundingClientRect();
        const gap = 6;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        let left;
        let top;
        if (this.__collapsed) {
            const preferredLeft = Math.round(triggerRect.right - popupRect.width);
            left = Math.min(Math.max(8, preferredLeft), Math.max(8, viewportWidth - popupRect.width - 8));
            const preferredTop = Math.round(triggerRect.bottom + gap);
            top = Math.min(Math.max(8, preferredTop), Math.max(8, viewportHeight - popupRect.height - 8));
        }
        else {
            const preferredLeft = Math.round(triggerRect.left);
            left = Math.min(Math.max(8, preferredLeft), Math.max(8, viewportWidth - popupRect.width - 8));
            const preferredTop = Math.round(triggerRect.top - popupRect.height - gap);
            const fallbackTop = Math.round(triggerRect.bottom + gap);
            const hasSpaceAbove = preferredTop >= 8;
            top = hasSpaceAbove
                ? preferredTop
                : Math.min(Math.max(8, fallbackTop), Math.max(8, viewportHeight - popupRect.height - 8));
        }
        this.__menuPopup.moveTo(left, top);
    }
    __buildMenuWidgets() {
        const heading = new qx.ui.basic.Label("My Account");
        heading.set({
            paddingTop: 4,
            paddingRight: 8,
            paddingBottom: 4,
            paddingLeft: 8,
            textColor: AppColors.mutedForeground(),
        });
        this.__menuContainer.add(heading);
        this.__menuContainer.add(this.__createMenuButton("Profile", new InlineSvgIcon("user-cog", 16), "⇧⌘P"));
        this.__menuContainer.add(this.__createMenuButton("Settings", new InlineSvgIcon("settings", 16), "⌘S"));
        const separator = new qx.ui.core.Widget();
        separator.set({
            height: 1,
            marginTop: 4,
            marginBottom: 4,
            backgroundColor: AppColors.border(),
        });
        this.__menuContainer.add(separator);
        this.__menuContainer.add(this.__createMenuButton("Log out", new InlineSvgIcon("log-out", 16), "logout-account"));
    }
    __createMenuButton(label, icon, action) {
        const button = new BsSidebarButton(`${label}`, icon, "btn-sm-outline");
        button.setAllowGrowX(true);
        button.setHeight(40);
        button.onClick(() => {
            const normalizedAction = action === "logout-account" ? "logout" : action;
            this.fireDataEvent("action", normalizedAction);
            this.__closeMenu();
        });
        return button;
    }
    __syncAvatarFallback() {
        if (!this.__avatarFallbackEl)
            return;
        const shouldShow = !this.__avatarSrc || this.__hasImageError;
        this.__avatarFallbackEl.style.display = shouldShow ? "flex" : "none";
    }
    __renderButton() {
        const name = this.__escape(this.__name);
        const username = this.__escape(this.__username);
        const avatarSrc = this.__escape(this.__avatarSrc);
        const avatarFallback = this.__escape(this.__avatarFallback);
        const chevronUpDown = this.__chevronUpDownHTML;
        const contentPart = this.__collapsed
            ? `
        <span class="relative inline-flex size-8 shrink-0 rounded-full overflow-hidden">
          <img class="size-full object-cover" alt="${name}" src="${avatarSrc}" />
          <span class="absolute inset-0 hidden items-center justify-center bg-muted text-muted-foreground text-xs font-medium" data-avatar-fallback>
            ${avatarFallback}
          </span>
        </span>
      `
            : `
        <span class="relative inline-flex size-8 shrink-0 rounded-full overflow-hidden">
          <img class="size-full object-cover" alt="${name}" src="${avatarSrc}" />
          <span class="absolute inset-0 hidden items-center justify-center bg-muted text-muted-foreground text-xs font-medium" data-avatar-fallback>
            ${avatarFallback}
          </span>
        </span>
        <span class="min-w-0 flex-1 text-left">
          <span class="block truncate text-sm font-medium text-foreground leading-tight">${name}</span>
          <span class="block truncate text-xs text-muted-foreground leading-tight">${username}</span>
        </span>
        <span class="flex flex-col text-muted-foreground leading-none items-center justify-center">
          ${chevronUpDown}
        </span>
      `;
        const classes = [
            "w-full",
            "h-10",
            "flex",
            "items-center",
            "gap-2",
            "rounded-md",
            "btn-sm-ghost",
            this.__collapsed ? "px-0 py-0" : "px-0.5",
            this.__collapsed ? "py-0" : "py-1.5",
            this.__collapsed ? "justify-center" : "justify-start",
            this.__className,
        ]
            .filter(Boolean)
            .join(" ");
        this.__htmlButton.setHtml(`
      <div class="${this.__collapsed ? "p-0" : "p-1"} relative" data-account-root data-account-open="${this.__isMenuOpen ? "true" : "false"}">
        <button
          type="button"
          data-account-trigger
          aria-haspopup="menu"
          aria-expanded="${this.__isMenuOpen ? "true" : "false"}"
          class="${classes}"
        >
          ${contentPart}
        </button>
      </div>
    `);
        this.__bindNativeButton();
    }
    setCollapsed(collapsed) {
        this.__collapsed = collapsed;
        if (collapsed)
            this.__closeMenu();
        this.__renderButton();
        return this;
    }
    setName(name) {
        this.__name = name !== null && name !== void 0 ? name : "";
        this.__renderButton();
        return this;
    }
    setUsername(username) {
        this.__username = username !== null && username !== void 0 ? username : "";
        this.__renderButton();
        return this;
    }
    setAvatar(src, fallback) {
        this.__avatarSrc = src !== null && src !== void 0 ? src : "";
        this.__hasImageError = false;
        if (typeof fallback === "string")
            this.__avatarFallback = fallback;
        this.__renderButton();
        return this;
    }
    onAction(handler) {
        this.addListener("action", (ev) => {
            var _a;
            handler((_a = ev.getData()) !== null && _a !== void 0 ? _a : "");
        });
        return this;
    }
    onClick(handler) {
        this.addListener("execute", handler);
        return this;
    }
}
BsSidebarAccount.events = {
    execute: "qx.event.type.Event",
    action: "qx.event.type.Data",
};
class BsSidebarButton extends qx.ui.basic.Atom {
    constructor(text, icon, className) {
        super();
        this.__trailingHtml = "";
        this.__active = false;
        this.__collapsed = false;
        this.__centered = false;
        this.__buttonEl = null;
        this.__renderPending = false;
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        this.__htmlButton = new qx.ui.embed.Html("");
        this.__htmlButton.setAllowGrowX(true);
        this.__iconHtml = icon ? icon.getHtml() : "";
        this.__buttonText = text !== null && text !== void 0 ? text : "";
        this.__className = className !== null && className !== void 0 ? className : "";
        this.__renderButton();
        this._add(this.__htmlButton);
        this.__htmlButton.addListener("tap", () => this.fireEvent("execute"));
        this.__htmlButton.addListenerOnce("appear", () => {
            this.__bindNativeButton();
        });
        if (icon) {
            icon.addListener("changeHtml", () => {
                this.__iconHtml = icon.getHtml();
                this.__renderButton();
            });
        }
    }
    __bindNativeButton() {
        var _a;
        const root = this.__htmlButton.getContentElement().getDomElement();
        const btn = (_a = root === null || root === void 0 ? void 0 : root.querySelector("button")) !== null && _a !== void 0 ? _a : null;
        this.__buttonEl = btn;
        if (!this.__buttonEl)
            return;
    }
    __renderButton() {
        const iconPart = this.__iconHtml ? `<span>${this.__iconHtml}</span>` : "";
        const textPart = this.__collapsed ? "" : this.__buttonText;
        const trailingPart = !this.__collapsed && this.__trailingHtml
            ? `<span style="margin-left:auto;opacity:0.75;line-height:1">${this.__trailingHtml}</span>`
            : "";
        const activeClass = this.__active
            ? "font-semibold btn-sm-primary"
            : "btn-sm-ghost";
        const layoutClass = this.__collapsed
            ? "justify-center"
            : this.__centered
                ? "justify-center relative"
                : "justify-start";
        const classes = [
            "w-full",
            "items-center",
            "gap-2",
            "transition",
            "duration-200",
            "ease-in-out",
            "border-sidebar-border",
            "select-none",
            layoutClass,
            activeClass,
            this.__className,
        ]
            .filter(Boolean)
            .join(" ");
        const centeredIconPart = this.__centered && this.__iconHtml
            ? `<span style="position:absolute;left:8px;display:flex;align-items:center">${this.__iconHtml}</span>`
            : iconPart;
        this.__htmlButton.setHtml(`
      <div class="p-1">
        <button
          type="button"
          class="${classes}"
        >
          ${centeredIconPart}
          ${textPart}
          ${trailingPart}
        </button>
      </div>
    `);
        qx.event.Timer.once(() => this.__bindNativeButton(), this, 0);
    }
    setActive(active) {
        if (this.__active === active)
            return this;
        this.__active = active;
        this.__scheduleRender();
        return this;
    }
    setCollapsed(collapsed) {
        if (this.__collapsed === collapsed)
            return this;
        this.__collapsed = collapsed;
        this.__scheduleRender();
        return this;
    }
    onClick(handler) {
        this.addListener("execute", handler);
        return this;
    }
    setText(text) {
        if (this.__buttonText === text)
            return this;
        this.__buttonText = text;
        this.__scheduleRender();
        return this;
    }
    setCentered(centered) {
        if (this.__centered === centered)
            return this;
        this.__centered = centered;
        this.__scheduleRender();
        return this;
    }
    setTrailingHtml(html) {
        if (this.__trailingHtml === html)
            return this;
        this.__trailingHtml = html;
        this.__scheduleRender();
        return this;
    }
    __scheduleRender() {
        if (this.__renderPending)
            return;
        this.__renderPending = true;
        queueMicrotask(() => {
            this.__renderPending = false;
            this.__renderButton();
        });
    }
}
BsSidebarButton.events = {
    execute: "qx.event.type.Event",
};
class BsTextarea extends qx.ui.basic.Atom {
    constructor(value, placeholder, className, rows = 4) {
        super();
        this.__textareaEl = null;
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        this.setFocusable(true);
        this.__value = value !== null && value !== void 0 ? value : "";
        this.__placeholder = placeholder !== null && placeholder !== void 0 ? placeholder : "";
        this.__className = className !== null && className !== void 0 ? className : "";
        this.__rows = rows;
        this.__htmlTextarea = new qx.ui.embed.Html("");
        this.__htmlTextarea.setAllowGrowX(true);
        this.__render();
        this._add(this.__htmlTextarea);
        this.__htmlTextarea.addListenerOnce("appear", () => {
            this.__bindNativeTextarea();
        });
        this.addListener("focusin", () => { var _a; return (_a = this.__textareaEl) === null || _a === void 0 ? void 0 : _a.focus(); });
        this.addListener("changeTabIndex", () => this.__syncTabIndex());
    }
    __bindNativeTextarea() {
        var _a;
        const root = this.__htmlTextarea.getContentElement().getDomElement();
        this.__textareaEl =
            (_a = root === null || root === void 0 ? void 0 : root.querySelector("textarea")) !== null && _a !== void 0 ? _a : null;
        if (!this.__textareaEl)
            return;
        this.__syncTabIndex();
        this.__textareaEl.oninput = () => {
            var _a, _b;
            const next = (_b = (_a = this.__textareaEl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : "";
            const prev = this.__value;
            this.__value = next;
            this.fireDataEvent("input", next);
            if (prev !== next)
                this.fireDataEvent("changeValue", next);
        };
    }
    __syncTabIndex() {
        if (!this.__textareaEl)
            return;
        this.__textareaEl.setAttribute("tabindex", "-1");
    }
    __escapeAttr(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
    __render() {
        const classes = [
            "textarea",
            "bg-card",
            "text-foreground",
            "border-border",
            "placeholder:text-muted-foreground",
            this.__className,
        ]
            .filter(Boolean)
            .join(" ");
        const value = this.__escapeAttr(this.__value);
        const placeholder = this.__escapeAttr(this.__placeholder);
        const tabIndexAttr = 'tabindex="-1"';
        this.__htmlTextarea.setHtml(`
      <div class="p-1">
        <textarea
          class="${classes}"
          placeholder="${placeholder}"
          rows="${this.__rows}"
          ${tabIndexAttr}
        >${value}</textarea>
      </div>
    `);
        qx.event.Timer.once(() => this.__bindNativeTextarea(), this, 0);
    }
    getValue() {
        var _a, _b;
        return (_b = (_a = this.__textareaEl) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : this.__value;
    }
    setValue(value) {
        this.__value = value !== null && value !== void 0 ? value : "";
        if (this.__textareaEl)
            this.__textareaEl.value = this.__value;
        else
            this.__render();
        return this;
    }
    setPlaceholder(value) {
        this.__placeholder = value !== null && value !== void 0 ? value : "";
        if (this.__textareaEl)
            this.__textareaEl.placeholder = this.__placeholder;
        else
            this.__render();
        return this;
    }
    setRows(rows) {
        this.__rows = rows;
        if (this.__textareaEl)
            this.__textareaEl.rows = rows;
        else
            this.__render();
        return this;
    }
    onInput(handler) {
        this.addListener("input", (ev) => {
            var _a;
            handler((_a = ev.getData()) !== null && _a !== void 0 ? _a : "");
        });
        return this;
    }
}
BsTextarea.events = {
    input: "qx.event.type.Data",
    changeValue: "qx.event.type.Data",
};
function isAdmin() {
    return globalThis.userRole === "admin";
}
function hasRole(...roles) {
    return roles.indexOf(globalThis.userRole) !== -1;
}
function formatRoleLabel(role) {
    var _a;
    const labels = {
        admin: "Administrator",
        faculty: "Instructor",
        student: "Student",
    };
    return (_a = labels[role]) !== null && _a !== void 0 ? _a : role;
}
function showAboutDialog() {
    const aboutContent = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
    aboutContent.setBackgroundColor(AppColors.card());
    const aboutTable = new qx.ui.container.Composite(new qx.ui.layout.Grid(8, 14));
    const tableLayout = aboutTable.getLayout();
    tableLayout.setColumnFlex(1, 1);
    const headerLabel = new qx.ui.basic.Label("SIAS Online v3.7.3.2").set({
        font: new qx.bom.Font("16", ["Inter", "sans-serif"]).set({ bold: true }),
        textColor: AppColors.primary(),
    });
    const headerTitle = new qx.ui.basic.Label("Copyright @ 2014 - 2020 Digital Software").set({
        font: new qx.bom.Font("14", ["Inter", "sans-serif"]).set({ bold: true })
    });
    aboutTable.add(new qx.ui.basic.Label("Chief Architect"), { row: 1, column: 0 });
    aboutTable.add(new qx.ui.basic.Label("Thomas C. Saddul, BSMath, MCS, MSIT").set({
        font: new qx.bom.Font("14", ["Inter", "sans-serif"]).set({ bold: true }),
    }), {
        row: 1,
        column: 1,
    });
    aboutTable.add(new qx.ui.basic.Label("Website"), { row: 2, column: 0 });
    aboutTable.add(new qx.ui.basic.Label("https://www.digisoftph.com").set({
        rich: true,
        font: new qx.bom.Font("14", ["Inter", "sans-serif"]).set({ bold: true }),
    }), { row: 2, column: 1 });
    aboutTable.add(new qx.ui.basic.Label("Facebook"), { row: 3, column: 0 });
    aboutTable.add(new qx.ui.basic.Label("https://www.facebook.com/digisoftph").set({
        rich: true,
        font: new qx.bom.Font("14", ["Inter", "sans-serif"]).set({ bold: true }),
    }), { row: 3, column: 1 });
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
class LoginLayout extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(12).set({ alignX: "center", alignY: "middle" }));
        this.setBackgroundColor(AppColors.background());
        const card = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
        card.setWidth(350);
        card.setAllowGrowX(false);
        card.setPadding(20);
        card.setBackgroundColor(AppColors.card());
        card.setDecorator(new qx.ui.decoration.Decorator().set({
            width: 1,
            style: "solid",
            color: AppColors.border(),
            radius: 10,
        }));
        const schoolLogo = new qx.ui.basic.Image("resource/app/ac_logo.png");
        schoolLogo.setAlignX("center");
        schoolLogo.set({
            scale: true,
            width: 64,
            height: 64,
        });
        card.add(schoolLogo);
        const title = new qx.ui.basic.Label("Aldersgate College Inc.");
        title.setTextAlign("center");
        title.setAlignX("center");
        title.setAllowGrowX(true);
        title.setFont(
        // @ts-ignore
        new qx.bom.Font(16, ["Inter", "sans-serif"]).set({ bold: true }));
        title.setTextColor(AppColors.foreground());
        title.setMarginBottom(10);
        card.add(title);
        const location = new qx.ui.basic.Label("Solano, Nueva Vizcaya");
        location.setTextAlign("center");
        location.setAlignX("center");
        location.setAllowGrowX(true);
        location.setFont(
        // @ts-ignore
        new qx.bom.Font(12, ["Inter", "sans-serif"]).set({ bold: true }));
        location.setTextColor(AppColors.foreground());
        location.setMarginBottom(30);
        card.add(location);
        const username = new BsInput("", "Username");
        const password = new BsPassword("", "Password");
        card.add(username);
        card.add(password);
        const loginError = new qx.ui.basic.Label("");
        loginError.setVisibility("excluded");
        loginError.setTextAlign("center");
        loginError.setTextColor(AppColors.destructive());
        loginError.setMarginTop(4);
        card.add(loginError);
        const triggerLogin = () => {
            const user = username.getValue().trim();
            const pass = password.getValue();
            if (!user || !pass) {
                loginError.setValue("Username and password are required");
                loginError.show();
                return;
            }
            loginError.exclude();
            submit.setEnabled(false);
            Api.Queries.user(1).then((result) => {
                globalThis.username = result.user.username;
                globalThis.userRole = result.user.role;
                globalThis.userFullName = result.user.fullName;
                this.fireEvent("login");
            })
                .catch((err) => {
                console.error("[Login] Error:", err);
                loginError.setValue(err.message || "Login failed");
                loginError.show();
                submit.setEnabled(true);
            });
        };
        const submit = new BsButton("Sign in", undefined, { variant: "default", className: "w-full" });
        submit.setAllowGrowX(true);
        submit.onClick(triggerLogin);
        card.add(submit);
        const onKeyDown = (event) => {
            if (event.key !== "Enter")
                return;
            const activeElement = document.activeElement;
            const cardElement = card.getContentElement().getDomElement();
            if (!activeElement ||
                !cardElement ||
                !cardElement.contains(activeElement))
                return;
            event.preventDefault();
            triggerLogin();
        };
        document.addEventListener("keydown", onKeyDown);
        this.addListenerOnce("disappear", () => {
            document.removeEventListener("keydown", onKeyDown);
        });
        this.add(card);
    }
}
LoginLayout.events = {
    login: "qx.event.type.Event",
};
class MainLayout extends qx.ui.container.Composite {
    constructor(content, sidebarItems, pageMap, pageTitle) {
        super();
        this.setLayout(new qx.ui.layout.Grow());
        this.setBackgroundColor(AppColors.background());
        const MOBILE_BREAKPOINT = 768;
        let isSidebarCollapsed = false;
        let isMobileMode = qx.bom.Viewport.getWidth() < MOBILE_BREAKPOINT;
        let drawer = null;
        const sidebar = new Sidebar(sidebarItems, pageTitle);
        const contentContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        const mobileTopBar = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({ alignY: "middle" }));
        mobileTopBar.set({
            paddingTop: 8,
            paddingRight: 6,
            paddingBottom: 8,
            paddingLeft: 10,
            minHeight: 48,
            backgroundColor: AppColors.background(),
        });
        mobileTopBar.setDecorator(new qx.ui.decoration.Decorator().set({
            widthBottom: 1,
            styleBottom: "solid",
            colorBottom: AppColors.border(),
        }));
        const mobileSchoolLogo = new qx.ui.basic.Image("resource/app/ac_logo.png");
        mobileSchoolLogo.set({
            scale: true,
            width: 32,
            height: 32,
        });
        mobileTopBar.add(mobileSchoolLogo);
        mobileTopBar.add(new qx.ui.core.Spacer(), { flex: 1 });
        const mobileAccount = new BsSidebarAccount(globalThis.username || "User", formatRoleLabel(globalThis.userRole), "resource/app/user.png", "RB", "px-0 py-0");
        mobileAccount.setCollapsed(true);
        mobileAccount.setAllowGrowX(false);
        mobileAccount.setAlignY("middle");
        const mobileAccountSlot = new qx.ui.container.Composite(new qx.ui.layout.Grow());
        mobileAccountSlot.setAllowGrowX(false);
        mobileAccountSlot.setAlignY("middle");
        mobileAccountSlot.setWidth(40);
        mobileAccountSlot.setHeight(40);
        mobileAccountSlot.add(mobileAccount);
        mobileAccount.onAction((action) => {
            if (action === "logout")
                this.fireEvent("logout");
        });
        mobileTopBar.add(mobileAccountSlot);
        mobileTopBar.exclude();
        const desktopShell = new qx.ui.container.Composite(new qx.ui.layout.HBox());
        const mountDesktop = () => {
            drawer === null || drawer === void 0 ? void 0 : drawer.close();
            sidebar.setDrawerMode(false);
            mobileTopBar.exclude();
            desktopShell.removeAll();
            desktopShell.add(sidebar);
            desktopShell.add(contentContainer, { flex: 1 });
            this.removeAll();
            this.add(desktopShell);
        };
        const mountMobile = () => {
            sidebar.setCollapsed(false);
            sidebar.setDrawerMode(true);
            mobileTopBar.show();
            drawer = new BsDrawer(contentContainer, sidebar);
            this.removeAll();
            this.add(drawer);
        };
        const navbar = new Navbar(pageTitle, () => {
            if (isMobileMode) {
                drawer === null || drawer === void 0 ? void 0 : drawer.toggle();
            }
            else {
                isSidebarCollapsed = !isSidebarCollapsed;
                sidebar.setCollapsed(isSidebarCollapsed);
            }
        });
        contentContainer.add(mobileTopBar);
        contentContainer.add(navbar);
        const mainContentContainer = new qx.ui.container.Composite(new qx.ui.layout.Grow());
        const mainContentScroll = new qx.ui.container.Scroll();
        const pageCache = new Map();
        if (pageTitle) {
            pageCache.set(pageTitle, content);
        }
        let currentPage = content;
        const getPage = (label) => {
            const cached = pageCache.get(label);
            if (cached)
                return cached;
            const factory = pageMap.get(label);
            if (!factory)
                return null;
            const page = factory();
            pageCache.set(label, page);
            return page;
        };
        mainContentContainer.setPadding(10);
        mainContentContainer.add(content, { edge: 0 });
        globalThis.setContent = (contentOrFactory, title) => {
            const nextPage = typeof contentOrFactory === "function"
                ? contentOrFactory()
                : contentOrFactory;
            if (nextPage === currentPage)
                return;
            mainContentContainer.removeAll();
            mainContentContainer.add(nextPage, { edge: 0 });
            currentPage = nextPage;
            if (title)
                navbar.setPageTitle(title);
            if (isMobileMode)
                drawer === null || drawer === void 0 ? void 0 : drawer.close();
        };
        sidebar.addListener("select", (ev) => {
            const label = ev.getData();
            const nextPage = getPage(label);
            if (!nextPage)
                return;
            globalThis.setContent(nextPage, label);
        });
        sidebar.addListener("action", (ev) => {
            if (ev.getData() === "logout") {
                this.fireEvent("logout");
            }
        });
        mainContentScroll.add(mainContentContainer);
        contentContainer.add(mainContentScroll, { flex: 1, edge: 0 });
        const syncResponsiveMode = () => {
            const nextIsMobile = qx.bom.Viewport.getWidth() < MOBILE_BREAKPOINT;
            if (nextIsMobile === isMobileMode && this.getChildren().length > 0)
                return;
            isMobileMode = nextIsMobile;
            if (isMobileMode) {
                mountMobile();
            }
            else {
                mountDesktop();
                sidebar.setCollapsed(isSidebarCollapsed);
            }
        };
        qx.event.Registration.addListener(window, "resize", () => {
            syncResponsiveMode();
        });
        syncResponsiveMode();
    }
}
MainLayout.events = {
    logout: "qx.event.type.Event",
};
const PAGE_DEFINITIONS = [
    {
        label: "Subjects",
        iconName: "book-open",
        factory: () => new SubjectsPage(),
        allowedRoles: ["admin", "faculty"],
    },
    {
        label: "Faculty",
        iconName: "users",
        factory: () => new FacultyPage(),
        allowedRoles: ["admin", "faculty"],
    },
    {
        label: "Rooms",
        iconName: "door-open",
        factory: () => new RoomsPage(),
        allowedRoles: ["admin", "faculty"],
    },
    {
        label: "Semesters",
        iconName: "calendar",
        factory: () => new SemestersPage(),
        allowedRoles: ["admin"],
    },
    {
        label: "Class Schedules",
        iconName: "clock",
        factory: () => new SchedulesPage(),
        allowedRoles: ["admin", "faculty"],
    },
];
const SIDEBAR_DEFINITIONS = [
    {
        label: "Academic",
        iconName: "graduation-cap",
        children: [
            {
                label: "Subjects",
                iconName: "book-open",
            },
            {
                label: "Faculty",
                iconName: "users",
            },
            {
                label: "Rooms",
                iconName: "door-open",
            },
        ],
    },
    {
        label: "Scheduling",
        iconName: "clock",
        children: [
            {
                label: "Class Schedules",
                iconName: "clock",
            },
        ],
    },
    {
        label: "Settings",
        iconName: "settings",
        children: [
            {
                label: "Semesters",
                iconName: "calendar",
            },
        ],
    },
];
function createSidebarItems(definitions = SIDEBAR_DEFINITIONS) {
    const createItems = (items) => {
        return items.map((definition) => ({
            label: definition.label,
            icon: definition.iconName
                ? new InlineSvgIcon(definition.iconName, 16)
                : undefined,
            children: definition.children
                ? createItems(definition.children)
                : undefined,
        }));
    };
    return createItems(definitions);
}
function manipulateSidebarItems(items, pageMap) {
    const normalizeItems = (source) => {
        const normalizedItems = [];
        source.forEach((item) => {
            const normalizedLabel = item.label.trim();
            const normalizedChildren = item.children
                ? normalizeItems(item.children)
                : undefined;
            const isLeaf = !normalizedChildren || normalizedChildren.length === 0;
            if (isLeaf && !pageMap.has(normalizedLabel))
                return;
            normalizedItems.push(Object.assign(Object.assign({}, item), { label: normalizedLabel, children: normalizedChildren && normalizedChildren.length > 0
                    ? normalizedChildren
                    : undefined }));
        });
        return normalizedItems;
    };
    return normalizeItems(items);
}
/**
 * Faculty management page — CRUD for faculty members + subject assignments.
 */
class FacultyPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(10));
        const toolbar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
        if (isAdmin()) {
            const addBtn = new BsButton("New", new InlineSvgIcon("plus", 16), { size: "sm", variant: "default" });
            addBtn.onClick(() => this.__showFormDialog());
            toolbar.add(addBtn);
        }
        const refreshBtn = new BsButton("Refresh", new InlineSvgIcon("refresh-cw", 16), { size: "sm", variant: "outline" });
        refreshBtn.onClick(() => this.__loadData());
        toolbar.add(refreshBtn);
        this.add(toolbar);
        this.__table = new AgGridTable([
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
        ], {
            emptyMessage: "No faculty records found.",
            rowId: (row) => String(row.id),
        });
        this.add(this.__table, { flex: 1 });
        if (isAdmin()) {
            const actionBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
            const editBtn = new BsButton("Edit", undefined, { size: "sm", variant: "outline" });
            editBtn.onClick(() => this.__editSelected());
            const deleteBtn = new BsButton("Delete", undefined, { size: "sm", variant: "destructive" });
            deleteBtn.onClick(() => this.__deleteSelected());
            const assignBtn = new BsButton("Assign", undefined, { size: "sm", variant: "secondary" });
            assignBtn.onClick(() => this.__assignSubjects());
            actionBar.add(editBtn);
            actionBar.add(deleteBtn);
            actionBar.add(assignBtn);
            this.add(actionBar);
        }
        this.__loadData();
    }
    __loadData() {
        Api.Queries.faculties().then((result) => {
            this.__table.setRows(result.faculties);
        });
    }
    __getSelectedRow() {
        return this.__table.getSelectedRow();
    }
    __showFormDialog(faculty) {
        var _a, _b, _c, _d;
        const isEdit = !!faculty;
        const form = new qx.ui.container.Composite(new qx.ui.layout.VBox(6));
        form.setWidth(320);
        const eidInput = new BsInput((_a = faculty === null || faculty === void 0 ? void 0 : faculty.employeeId) !== null && _a !== void 0 ? _a : "", "Employee ID");
        eidInput.setAllowGrowX(true);
        const nameInput = new BsInput((_b = faculty === null || faculty === void 0 ? void 0 : faculty.fullName) !== null && _b !== void 0 ? _b : "", "Full Name");
        nameInput.setAllowGrowX(true);
        const deptInput = new BsInput((_c = faculty === null || faculty === void 0 ? void 0 : faculty.department) !== null && _c !== void 0 ? _c : "", "Department");
        deptInput.setAllowGrowX(true);
        const specInput = new BsInput((_d = faculty === null || faculty === void 0 ? void 0 : faculty.specialization) !== null && _d !== void 0 ? _d : "", "Specialization");
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
                    ? Api.Mutations.updateFaculty(faculty.id, faculty.userId, employeeId, fullName, department, specialization)
                    : Api.Mutations.createFaculty(null, employeeId, fullName, department, specialization);
                promise
                    .then(() => this.__loadData())
                    .catch((err) => alert(err.message));
            },
        });
    }
    __editSelected() {
        const row = this.__getSelectedRow();
        if (!row)
            return;
        this.__showFormDialog(row);
    }
    __deleteSelected() {
        const row = this.__getSelectedRow();
        if (!row)
            return;
        BsAlertDialog.show({
            title: "Delete Faculty",
            description: `Are you sure you want to delete "${row.fullName}"?`,
            continueLabel: "Delete",
            footerButtons: "ok-cancel",
            onContinue: () => {
                Api.Mutations.deleteFaculty(row.id)
                    .then(() => this.__loadData())
                    .catch((err) => alert(err.message));
            },
        });
    }
    __assignSubjects() {
        const row = this.__getSelectedRow();
        if (!row)
            return;
        Promise.all([
            Api.Queries.facultySubjectsByFaculty(row.id),
            Api.Queries.subjects(),
        ]).then(([assignedResult, subjectsResult]) => {
            const assigned = assignedResult.facultySubjectsByFaculty;
            const allSubjects = subjectsResult.subjects;
            const assignedIds = new Set(assigned.map((a) => a.subjectId));
            const container = new qx.ui.container.Composite(new qx.ui.layout.VBox(4));
            container.setWidth(360);
            const info = new qx.ui.basic.Label(`Manage subject assignments for ${row.fullName}`);
            info.setWrap(true);
            info.setTextColor(AppColors.mutedForeground());
            container.add(info);
            const currentLabel = new qx.ui.basic.Label("Current Assignments:");
            currentLabel.setFont(
            //@ts-ignore
            new qx.bom.Font(12).set({ bold: true }));
            container.add(currentLabel);
            const assignmentList = new qx.ui.container.Composite(new qx.ui.layout.VBox(2));
            const renderAssignments = (currentAssigned) => {
                assignmentList.removeAll();
                if (currentAssigned.length === 0) {
                    const none = new qx.ui.basic.Label("No subjects assigned");
                    none.setTextColor(AppColors.mutedForeground());
                    assignmentList.add(none);
                }
                else {
                    currentAssigned.forEach((a) => {
                        const rowWidget = new qx.ui.container.Composite(new qx.ui.layout.HBox(4).set({ alignY: "middle" }));
                        const label = new qx.ui.basic.Label(`${a.code} — ${a.name}`);
                        const removeBtn = new BsButton("Remove", undefined, { size: "sm", variant: "destructive" });
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
                new qx.bom.Font(12).set({ bold: true }));
                container.add(addLabel);
                const subjectSelect = new BsSelect(unassigned.map((s) => `${s.code} — ${s.name}`));
                subjectSelect.setAllowGrowX(true);
                container.add(subjectSelect);
                const addAssignBtn = new BsButton("Assign", undefined, { size: "sm", variant: "default" });
                addAssignBtn.onClick(() => {
                    const selectedLabel = subjectSelect.getSelectedValue();
                    if (!selectedLabel)
                        return;
                    const selectedCode = selectedLabel.split(" — ")[0];
                    const subject = allSubjects.find((s) => s.code === selectedCode);
                    if (!subject)
                        return;
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
class MainPage extends qx.ui.container.Composite {
    constructor() {
        super();
        this.setLayout(new qx.ui.layout.Grow());
        this.setBackgroundColor(AppColors.background());
        const center = new qx.ui.container.Composite(new qx.ui.layout.VBox(12).set({ alignX: "center", alignY: "middle" }));
        const welcomeCard = new qx.ui.container.Composite(new qx.ui.layout.VBox(8).set({ alignX: "center" }));
        welcomeCard.setMaxWidth(520);
        welcomeCard.setMinWidth(0);
        welcomeCard.setAllowGrowX(true);
        welcomeCard.setPadding(24);
        welcomeCard.setBackgroundColor(AppColors.background());
        const name = typeof userFullName !== "undefined" ? userFullName : "User";
        const title = new qx.ui.basic.Label(`Welcome, ${name}`);
        title.setTextColor(AppColors.mutedForeground());
        title.setTextAlign("center");
        title.setAlignX("center");
        title.setFont(
        // @ts-ignore
        new qx.bom.Font(26).set({ bold: true }));
        const subtitle = new qx.ui.basic.Label("SIAS Online — Class Scheduling & Faculty Management. Use the sidebar to manage subjects, faculty, rooms, semesters, and class schedules.");
        subtitle.setWidth(400);
        subtitle.setTextColor(AppColors.mutedForeground());
        subtitle.setTextAlign("center");
        subtitle.setWrap(true);
        subtitle.setAlignX("center");
        welcomeCard.add(title);
        welcomeCard.add(subtitle);
        const syncWelcomeCardWidth = () => {
            const width = Math.max(240, Math.min(520, qx.bom.Viewport.getWidth() - 32));
            welcomeCard.setWidth(width);
        };
        qx.event.Registration.addListener(window, "resize", syncWelcomeCardWidth);
        syncWelcomeCardWidth();
        center.add(welcomeCard);
        this.add(center);
    }
}
/**
 * Rooms management page — CRUD for rooms.
 */
class RoomsPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(10));
        const toolbar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
        if (isAdmin()) {
            const addBtn = new BsButton("New", new InlineSvgIcon("plus", 16), { size: "sm", variant: "default" });
            addBtn.onClick(() => this.__showFormDialog());
            toolbar.add(addBtn);
        }
        const refreshBtn = new BsButton("Refresh", new InlineSvgIcon("refresh-cw", 16), { size: "sm", variant: "outline" });
        refreshBtn.onClick(() => this.__loadData());
        toolbar.add(refreshBtn);
        this.add(toolbar);
        this.__table = new AgGridTable([
            { headerName: "ID", field: "id", hide: true },
            { headerName: "Name", field: "name", minWidth: 140, flex: 1 },
            { headerName: "Building", field: "building", minWidth: 160, flex: 1 },
            { headerName: "Capacity", field: "capacity", minWidth: 110, flex: 0 },
        ], { emptyMessage: "No rooms available.", rowId: (row) => String(row.id) });
        this.add(this.__table, { flex: 1 });
        if (isAdmin()) {
            const actionBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
            const editBtn = new BsButton("Edit", undefined, { size: "sm", variant: "outline" });
            editBtn.onClick(() => this.__editSelected());
            const deleteBtn = new BsButton("Delete", undefined, { size: "sm", variant: "destructive" });
            deleteBtn.onClick(() => this.__deleteSelected());
            actionBar.add(editBtn);
            actionBar.add(deleteBtn);
            this.add(actionBar);
        }
        this.__loadData();
    }
    __loadData() {
        Api.Queries.rooms().then((result) => {
            this.__table.setRows(result.rooms);
        });
    }
    __getSelectedRow() {
        return this.__table.getSelectedRow();
    }
    __showFormDialog(room) {
        var _a, _b, _c;
        const isEdit = !!room;
        const form = new qx.ui.container.Composite(new qx.ui.layout.VBox(6));
        form.setWidth(300);
        const nameInput = new BsInput((_a = room === null || room === void 0 ? void 0 : room.name) !== null && _a !== void 0 ? _a : "", "Room Name");
        nameInput.setAllowGrowX(true);
        const buildingInput = new BsInput((_b = room === null || room === void 0 ? void 0 : room.building) !== null && _b !== void 0 ? _b : "", "Building");
        buildingInput.setAllowGrowX(true);
        const capInput = new BsInput(String((_c = room === null || room === void 0 ? void 0 : room.capacity) !== null && _c !== void 0 ? _c : 0), "Capacity");
        capInput.setAllowGrowX(true);
        form.add(new qx.ui.basic.Label("Name"));
        form.add(nameInput);
        form.add(new qx.ui.basic.Label("Building"));
        form.add(buildingInput);
        form.add(new qx.ui.basic.Label("Capacity"));
        form.add(capInput);
        BsAlertDialog.show({
            title: isEdit ? "Edit Room" : "Add Room",
            children: form,
            continueLabel: isEdit ? "Save" : "Add",
            footerButtons: "ok-cancel",
            onContinue: () => {
                const name = nameInput.getValue().trim();
                const building = buildingInput.getValue().trim();
                const capacity = parseInt(capInput.getValue().trim(), 10) || 0;
                const promise = isEdit
                    ? Api.Mutations.updateRoom(room.id, name, building, capacity)
                    : Api.Mutations.createRoom(name, building, capacity);
                promise
                    .then(() => this.__loadData())
                    .catch((err) => alert(err.message));
            },
        });
    }
    __editSelected() {
        const row = this.__getSelectedRow();
        if (!row)
            return;
        this.__showFormDialog(row);
    }
    __deleteSelected() {
        const row = this.__getSelectedRow();
        if (!row)
            return;
        BsAlertDialog.show({
            title: "Delete Room",
            description: `Are you sure you want to delete "${row.name}"?`,
            continueLabel: "Delete",
            footerButtons: "ok-cancel",
            onContinue: () => {
                Api.Mutations.deleteRoom(row.id)
                    .then(() => this.__loadData())
                    .catch((err) => alert(err.message));
            },
        });
    }
}
/**
 * Schedules management page — CRUD with conflict detection.
 */
class SchedulesPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(10));
        this.__semesters = [];
        this.__faculty = [];
        this.__subjects = [];
        this.__rooms = [];
        this.__activeSemesterId = null;
        const toolbar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
        const semLabel = new qx.ui.basic.Label("Semester:");
        semLabel.setAlignY("middle");
        toolbar.add(semLabel);
        this.__semesterSelect = new BsSelect([]);
        this.__semesterSelect.setWidth(500);
        this.__semesterSelect.onChange(() => this.__loadSchedules());
        toolbar.add(this.__semesterSelect);
        toolbar.add(new qx.ui.core.Spacer(), { flex: 1 });
        if (isAdmin()) {
            const addBtn = new BsButton("New", new InlineSvgIcon("plus", 16), { size: "sm", variant: "default" });
            addBtn.onClick(() => this.__showFormDialog());
            toolbar.add(addBtn);
        }
        const refreshBtn = new BsButton("Refresh", new InlineSvgIcon("refresh-cw", 16), { size: "sm", variant: "outline" });
        refreshBtn.onClick(() => this.__loadAll());
        toolbar.add(refreshBtn);
        this.add(toolbar);
        this.__table = new AgGridTable([
            { headerName: "ID", field: "id", hide: true },
            {
                headerName: "Subject",
                minWidth: 230,
                flex: 1.3,
                valueGetter: (row) => `${row.subjectCode} — ${row.subjectName}`,
            },
            { headerName: "Faculty", field: "facultyName", minWidth: 210, flex: 1.2 },
            {
                headerName: "Room",
                minWidth: 170,
                flex: 1,
                valueGetter: (row) => `${row.roomName} (${row.building})`,
            },
            { headerName: "Day", field: "dayOfWeek", minWidth: 90, flex: 0 },
            { headerName: "Start", field: "startTime", minWidth: 95, flex: 0 },
            { headerName: "End", field: "endTime", minWidth: 95, flex: 0 },
        ], {
            emptyMessage: "No schedules found for the selected semester.",
            rowId: (row) => String(row.id),
        });
        this.add(this.__table, { flex: 1 });
        if (isAdmin()) {
            const actionBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
            const editBtn = new BsButton("Edit", undefined, { size: "sm", variant: "outline" });
            editBtn.onClick(() => this.__editSelected());
            const deleteBtn = new BsButton("Delete", undefined, { size: "sm", variant: "destructive" });
            deleteBtn.onClick(() => this.__deleteSelected());
            actionBar.add(editBtn);
            actionBar.add(deleteBtn);
            this.add(actionBar);
        }
        this.__loadAll();
    }
    __loadAll() {
        Promise.all([
            Api.Queries.semesters(),
            Api.Queries.faculties(),
            Api.Queries.subjects(),
            Api.Queries.rooms(),
        ]).then(([semestersResult, facultyResult, subjectsResult, roomsResult]) => {
            this.__semesters = semestersResult.semesters;
            this.__faculty = facultyResult.faculties;
            this.__subjects = subjectsResult.subjects;
            this.__rooms = roomsResult.rooms;
            const active = this.__semesters.find((s) => s.isActive);
            this.__activeSemesterId = active ? active.id : null;
            const labels = this.__semesters.map((s) => `${s.name} — ${s.schoolYear}`);
            this.__semesterSelect = this.__rebuildSelect(this.__semesterSelect, labels);
            if (active) {
                this.__semesterSelect.setSelectedByLabel(`${active.name} — ${active.schoolYear}`);
            }
            this.__loadSchedules();
        });
    }
    __rebuildSelect(old, options) {
        const parent = old.getLayoutParent();
        if (!parent)
            return old;
        const idx = parent.indexOf(old);
        parent.remove(old);
        const next = new BsSelect(options, "select-bordered select-sm");
        next.setWidth(220);
        next.onChange(() => this.__loadSchedules());
        parent.addAt(next, idx);
        return next;
    }
    __getSelectedSemesterId() {
        const label = this.__semesterSelect.getSelectedValue();
        if (!label)
            return this.__activeSemesterId;
        const match = this.__semesters.find((s) => `${s.name} — ${s.schoolYear}` === label);
        return match ? match.id : this.__activeSemesterId;
    }
    __loadSchedules() {
        const semId = this.__getSelectedSemesterId();
        Api.Queries.schedules().then((result) => {
            const schedules = semId
                ? result.schedules.filter(s => s.semesterId === semId)
                : result.schedules;
            this.__table.setRows(schedules);
        });
    }
    __getSelectedRow() {
        return this.__table.getSelectedRow();
    }
    __showFormDialog(schedule) {
        var _a, _b;
        const isEdit = !!schedule;
        const form = new qx.ui.container.Composite(new qx.ui.layout.VBox(6));
        form.setWidth(360);
        const subjectSelect = new BsSelect(this.__subjects.map((s) => `${s.code} — ${s.name}`));
        subjectSelect.setAllowGrowX(true);
        if (schedule) {
            subjectSelect.setSelectedByLabel(`${schedule.subjectCode} — ${schedule.subjectName}`);
        }
        const facultySelect = new BsSelect(this.__faculty.map((f) => `${f.employeeId} — ${f.fullName}`));
        facultySelect.setAllowGrowX(true);
        if (schedule) {
            facultySelect.setSelectedByLabel(`${schedule.employeeId} — ${schedule.facultyName}`);
        }
        const roomSelect = new BsSelect(this.__rooms.map((r) => `${r.name} (${r.building})`));
        roomSelect.setAllowGrowX(true);
        if (schedule) {
            roomSelect.setSelectedByLabel(`${schedule.roomName} (${schedule.building})`);
        }
        const daySelect = new BsSelect(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
        daySelect.setAllowGrowX(true);
        if (schedule)
            daySelect.setSelectedByLabel(schedule.dayOfWeek);
        const startInput = new BsInput((_a = schedule === null || schedule === void 0 ? void 0 : schedule.startTime) !== null && _a !== void 0 ? _a : "", "Start Time (HH:MM)");
        startInput.setAllowGrowX(true);
        const endInput = new BsInput((_b = schedule === null || schedule === void 0 ? void 0 : schedule.endTime) !== null && _b !== void 0 ? _b : "", "End Time (HH:MM)");
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
        BsAlertDialog.show({
            title: isEdit ? "Edit Schedule" : "Add Schedule",
            children: form,
            continueLabel: isEdit ? "Save" : "Add",
            footerButtons: "ok-cancel",
            onContinue: () => {
                const subjectLabel = subjectSelect.getSelectedValue();
                const subjectCode = subjectLabel ? subjectLabel.split(" — ")[0] : "";
                const subject = this.__subjects.find((s) => s.code === subjectCode);
                const facultyLabel = facultySelect.getSelectedValue();
                const empId = facultyLabel ? facultyLabel.split(" — ")[0] : "";
                const faculty = this.__faculty.find((f) => f.employeeId === empId);
                const roomLabel = roomSelect.getSelectedValue();
                const roomName = roomLabel ? roomLabel.split(" (")[0] : "";
                const room = this.__rooms.find((r) => r.name === roomName);
                const semId = this.__getSelectedSemesterId();
                if (!subject || !faculty || !room || !semId) {
                    alert("All fields are required");
                    return;
                }
                const dayOfWeek = daySelect.getSelectedValue();
                const startTime = startInput.getValue().trim();
                const endTime = endInput.getValue().trim();
                const promise = isEdit
                    ? Api.Mutations.updateSchedule(schedule.id, subject.id, faculty.id, room.id, semId, dayOfWeek, startTime, endTime)
                    : Api.Mutations.createSchedule(subject.id, faculty.id, room.id, semId, dayOfWeek, startTime, endTime);
                promise
                    .then(() => this.__loadSchedules())
                    .catch((err) => alert(err.message));
            },
        });
    }
    __editSelected() {
        const row = this.__getSelectedRow();
        if (!row)
            return;
        this.__showFormDialog(row);
    }
    __deleteSelected() {
        const row = this.__getSelectedRow();
        if (!row)
            return;
        BsAlertDialog.show({
            title: "Delete Schedule",
            description: `Delete ${row.subjectCode} — ${row.facultyName} on ${row.dayOfWeek} ${row.startTime}-${row.endTime}?`,
            continueLabel: "Delete",
            footerButtons: "ok-cancel",
            onContinue: () => {
                Api.Mutations.deleteSchedule(row.id)
                    .then(() => this.__loadSchedules())
                    .catch((err) => alert(err.message));
            },
        });
    }
}
/**
 * Semesters management page — CRUD + set active semester.
 */
class SemestersPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(10));
        const toolbar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
        if (isAdmin()) {
            const addBtn = new BsButton("New", new InlineSvgIcon("plus", 16), { size: "sm", variant: "default" });
            addBtn.onClick(() => this.__showFormDialog());
            toolbar.add(addBtn);
        }
        const refreshBtn = new BsButton("Refresh", new InlineSvgIcon("refresh-cw", 16), { size: "sm", variant: "outline" });
        refreshBtn.onClick(() => this.__loadData());
        toolbar.add(refreshBtn);
        this.add(toolbar);
        this.__table = new AgGridTable([
            { headerName: "ID", field: "id", hide: true },
            { headerName: "Name", field: "name", minWidth: 180, flex: 1 },
            {
                headerName: "School Year",
                field: "schoolYear",
                minWidth: 160,
                flex: 1,
            },
            {
                headerName: "Status",
                field: "isActive",
                minWidth: 120,
                flex: 0,
                valueFormatter: (value) => (value ? "Active" : "Inactive"),
            },
        ], {
            emptyMessage: "No semesters configured.",
            rowId: (row) => String(row.id),
        });
        this.add(this.__table, { flex: 1 });
        if (isAdmin()) {
            const actionBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
            const activateBtn = new BsButton("Set Active", undefined, { size: "sm", variant: "default" });
            activateBtn.onClick(() => this.__activateSelected());
            const editBtn = new BsButton("Edit", undefined, { size: "sm", variant: "outline" });
            editBtn.onClick(() => this.__editSelected());
            const deleteBtn = new BsButton("Delete", undefined, { size: "sm", variant: "destructive" });
            deleteBtn.onClick(() => this.__deleteSelected());
            actionBar.add(activateBtn);
            actionBar.add(editBtn);
            actionBar.add(deleteBtn);
            this.add(actionBar);
        }
        this.__loadData();
    }
    __loadData() {
        Api.Queries.semesters().then((result) => {
            this.__table.setRows(result.semesters);
        });
    }
    __getSelectedRow() {
        return this.__table.getSelectedRow();
    }
    __showFormDialog(semester) {
        var _a;
        const isEdit = !!semester;
        const form = new qx.ui.container.Composite(new qx.ui.layout.VBox(6));
        form.setWidth(300);
        const nameSelect = new BsSelect(["1st Semester", "2nd Semester", "Summer"]);
        nameSelect.setAllowGrowX(true);
        if (semester)
            nameSelect.setSelectedByLabel(semester.name);
        const yearInput = new BsInput((_a = semester === null || semester === void 0 ? void 0 : semester.schoolYear) !== null && _a !== void 0 ? _a : "", "School Year (e.g. 2025-2026)");
        yearInput.setAllowGrowX(true);
        form.add(new qx.ui.basic.Label("Semester"));
        form.add(nameSelect);
        form.add(new qx.ui.basic.Label("School Year"));
        form.add(yearInput);
        BsAlertDialog.show({
            title: isEdit ? "Edit Semester" : "Add Semester",
            children: form,
            continueLabel: isEdit ? "Save" : "Add",
            footerButtons: "ok-cancel",
            onContinue: () => {
                const name = nameSelect.getSelectedValue();
                const schoolYear = yearInput.getValue().trim();
                if (!name || !schoolYear) {
                    alert("All fields are required");
                    return;
                }
                const promise = isEdit
                    ? Api.Mutations.updateSemester(semester.id, name, schoolYear, semester.isActive)
                    : Api.Mutations.createSemester(name, schoolYear, 0);
                promise
                    .then(() => this.__loadData())
                    .catch((err) => alert(err.message));
            },
        });
    }
    __activateSelected() {
        const row = this.__getSelectedRow();
        if (!row)
            return;
        Api.Mutations.updateSemester(row.id, row.name, row.schoolYear, 1)
            .then(() => this.__loadData())
            .catch((err) => alert(err.message));
    }
    __editSelected() {
        const row = this.__getSelectedRow();
        if (!row)
            return;
        this.__showFormDialog(row);
    }
    __deleteSelected() {
        const row = this.__getSelectedRow();
        if (!row)
            return;
        BsAlertDialog.show({
            title: "Delete Semester",
            description: `Are you sure you want to delete "${row.name} (${row.schoolYear})"?`,
            continueLabel: "Delete",
            footerButtons: "ok-cancel",
            onContinue: () => {
                Api.Mutations.deleteSemester(row.id)
                    .then(() => this.__loadData())
                    .catch((err) => alert(err.message));
            },
        });
    }
}
/**
 * Subjects management page — CRUD for academic subjects.
 */
class SubjectsPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(10));
        const toolbar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
        if (isAdmin()) {
            const addBtn = new BsButton("New", new InlineSvgIcon("plus", 16), { size: "sm", variant: "default" });
            addBtn.onClick(() => this.__showFormDialog());
            toolbar.add(addBtn);
        }
        const refreshBtn = new BsButton("Refresh", new InlineSvgIcon("refresh-cw", 16), { size: "sm", variant: "outline" });
        refreshBtn.onClick(() => this.__loadData());
        toolbar.add(refreshBtn);
        this.add(toolbar);
        this.__table = new AgGridTable([
            { headerName: "ID", field: "id", hide: true },
            { headerName: "Code", field: "code", minWidth: 120, flex: 0 },
            { headerName: "Name", field: "name", minWidth: 220, flex: 1.3 },
            { headerName: "Units", field: "units", minWidth: 90, flex: 0 },
            {
                headerName: "Description",
                field: "description",
                minWidth: 260,
                flex: 1.8,
            },
        ], { emptyMessage: "No subjects available.", rowId: (row) => String(row.id) });
        this.add(this.__table, { flex: 1 });
        if (isAdmin()) {
            const actionBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
            const editBtn = new BsButton("Edit", undefined, { size: "sm", variant: "outline" });
            editBtn.setWidth(120);
            editBtn.onClick(() => this.__editSelected());
            const deleteBtn = new BsButton("Delete", undefined, { size: "sm", variant: "destructive" });
            deleteBtn.setWidth(120);
            deleteBtn.onClick(() => this.__deleteSelected());
            actionBar.add(editBtn);
            actionBar.add(deleteBtn);
            this.add(actionBar);
        }
        this.__loadData();
    }
    __loadData() {
        Api.Queries.subjects().then((result) => {
            this.__table.setRows(result.subjects);
        });
    }
    __getSelectedRow() {
        return this.__table.getSelectedRow();
    }
    __showFormDialog(subject) {
        var _a, _b, _c, _d;
        const isEdit = !!subject;
        const form = new qx.ui.container.Composite(new qx.ui.layout.VBox(6));
        form.setWidth(320);
        const codeInput = new BsInput((_a = subject === null || subject === void 0 ? void 0 : subject.code) !== null && _a !== void 0 ? _a : "", "Subject Code (e.g. CS101)");
        codeInput.setAllowGrowX(true);
        const nameInput = new BsInput((_b = subject === null || subject === void 0 ? void 0 : subject.name) !== null && _b !== void 0 ? _b : "", "Subject Name");
        nameInput.setAllowGrowX(true);
        const unitsInput = new BsInput(String((_c = subject === null || subject === void 0 ? void 0 : subject.units) !== null && _c !== void 0 ? _c : 3), "Units");
        unitsInput.setAllowGrowX(true);
        const descInput = new BsInput((_d = subject === null || subject === void 0 ? void 0 : subject.description) !== null && _d !== void 0 ? _d : "", "Description");
        descInput.setAllowGrowX(true);
        form.add(new qx.ui.basic.Label("Code"));
        form.add(codeInput);
        form.add(new qx.ui.basic.Label("Name"));
        form.add(nameInput);
        form.add(new qx.ui.basic.Label("Units"));
        form.add(unitsInput);
        form.add(new qx.ui.basic.Label("Description"));
        form.add(descInput);
        BsAlertDialog.show({
            title: isEdit ? "Edit Subject" : "Add Subject",
            children: form,
            continueLabel: isEdit ? "Save" : "Add",
            footerButtons: "ok-cancel",
            onContinue: () => {
                const code = codeInput.getValue().trim();
                const name = nameInput.getValue().trim();
                const units = parseInt(unitsInput.getValue().trim(), 10) || 3;
                const description = descInput.getValue().trim();
                const promise = isEdit
                    ? Api.Mutations.updateSubject(subject.id, code, name, units, description)
                    : Api.Mutations.createSubject(code, name, units, description);
                promise
                    .then(() => this.__loadData())
                    .catch((err) => alert(err.message));
            },
        });
    }
    __editSelected() {
        const row = this.__getSelectedRow();
        if (!row)
            return;
        this.__showFormDialog(row);
    }
    __deleteSelected() {
        const row = this.__getSelectedRow();
        if (!row)
            return;
        BsAlertDialog.show({
            title: "Delete Subject",
            description: `Are you sure you want to delete "${row.code} — ${row.name}"?`,
            continueLabel: "Delete",
            footerButtons: "ok-cancel",
            onContinue: () => {
                Api.Mutations.deleteSubject(row.id)
                    .then(() => this.__loadData())
                    .catch((err) => alert(err.message));
            },
        });
    }
}
const GRAPHQL_ENDPOINT = "http://localhost:5032/graphql";
function gql(query, variables) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(GRAPHQL_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, variables }),
        });
        const result = yield response.json();
        if (result.errors && result.errors.length > 0) {
            throw new Error(result.errors[0].message);
        }
        if (!result.data) {
            throw new Error("No data returned from GraphQL");
        }
        return result.data;
    });
}
const Queries = {
    users: () => gql(`query { users { id username fullName: fullName role } }`),
    user: (id) => gql(`query($id: Int!) { user(id: $id) { id username fullName: fullName role } }`, { id }),
    subjects: () => gql(`query { subjects { id code name units description } }`),
    subject: (id) => gql(`query($id: Int!) { subject(id: $id) { id code name units description } }`, { id }),
    faculties: () => gql(`query { faculties { id userId: userId employeeId: employeeId fullName: fullName department specialization } }`),
    faculty: (id) => gql(`query($id: Int!) { faculty(id: $id) { id userId: userId employeeId: employeeId fullName: fullName department specialization } }`, { id }),
    rooms: () => gql(`query { rooms { id name building capacity } }`),
    room: (id) => gql(`query($id: Int!) { room(id: $id) { id name building capacity } }`, { id }),
    semesters: () => gql(`query { semesters { id name schoolYear: schoolYear isActive: isActive } }`),
    semester: (id) => gql(`query($id: Int!) { semester(id: $id) { id name schoolYear: schoolYear isActive: isActive } }`, { id }),
    activeSemester: () => gql(`query { activeSemester { id name schoolYear: schoolYear isActive: isActive } }`),
    schedules: () => gql(`query { schedules { id subjectId: subjectId facultyId: facultyId roomId: roomId semesterId: semesterId dayOfWeek: dayOfWeek startTime: startTime endTime: endTime subjectCode: subjectCode subjectName: subjectName facultyName: facultyName employeeId: employeeId roomName: roomName building semesterName: semesterName schoolYear: schoolYear } }`),
    schedule: (id) => gql(`query($id: Int!) { schedule(id: $id) { id subjectId: subjectId facultyId: facultyId roomId: roomId semesterId: semesterId dayOfWeek: dayOfWeek startTime: startTime endTime: endTime subjectCode: subjectCode subjectName: subjectName facultyName: facultyName employeeId: employeeId roomName: roomName building semesterName: semesterName schoolYear: schoolYear } }`, { id }),
    facultySubjects: () => gql(`query { facultySubjects { id facultyId: facultyId subjectId: subjectId code name units } }`),
    facultySubjectsByFaculty: (facultyId) => gql(`query($facultyId: Int!) { facultySubjectsByFaculty(facultyId: $facultyId) { id facultyId: facultyId subjectId: subjectId code name units } }`, { facultyId }),
};
const Mutations = {
    createSubject: (code, name, units, description) => gql(`mutation($code: String!, $name: String!, $units: Int!, $description: String!) { createSubject(code: $code, name: $name, units: $units, description: $description) { id code name units description } }`, { code, name, units, description }),
    updateSubject: (id, code, name, units, description) => gql(`mutation($id: Int!, $code: String!, $name: String!, $units: Int!, $description: String!) { updateSubject(id: $id, code: $code, name: $name, units: $units, description: $description) { id code name units description } }`, { id, code, name, units, description }),
    deleteSubject: (id) => gql(`mutation($id: Int!) { deleteSubject(id: $id) }`, { id }),
    createFaculty: (userId, employeeId, fullName, department, specialization) => gql(`mutation($userId: Int, $employeeId: String!, $fullName: String!, $department: String!, $specialization: String!) { createFaculty(userId: $userId, employeeId: $employeeId, fullName: $fullName, department: $department, specialization: $specialization) { id userId: userId employeeId: employeeId fullName: fullName department specialization } }`, { userId, employeeId, fullName, department, specialization }),
    updateFaculty: (id, userId, employeeId, fullName, department, specialization) => gql(`mutation($id: Int!, $userId: Int, $employeeId: String!, $fullName: String!, $department: String!, $specialization: String!) { updateFaculty(id: $id, userId: $userId, employeeId: $employeeId, fullName: $fullName, department: $department, specialization: $specialization) { id userId: userId employeeId: employeeId fullName: fullName department specialization } }`, { id, userId, employeeId, fullName, department, specialization }),
    deleteFaculty: (id) => gql(`mutation($id: Int!) { deleteFaculty(id: $id) }`, { id }),
    createRoom: (name, building, capacity) => gql(`mutation($name: String!, $building: String!, $capacity: Int!) { createRoom(name: $name, building: $building, capacity: $capacity) { id name building capacity } }`, { name, building, capacity }),
    updateRoom: (id, name, building, capacity) => gql(`mutation($id: Int!, $name: String!, $building: String!, $capacity: Int!) { updateRoom(id: $id, name: $name, building: $building, capacity: $capacity) { id name building capacity } }`, { id, name, building, capacity }),
    deleteRoom: (id) => gql(`mutation($id: Int!) { deleteRoom(id: $id) }`, { id }),
    createSemester: (name, schoolYear, isActive) => gql(`mutation($name: String!, $schoolYear: String!, $isActive: Int!) { createSemester(name: $name, schoolYear: $schoolYear, isActive: $isActive) { id name schoolYear: schoolYear isActive: isActive } }`, { name, schoolYear, isActive }),
    updateSemester: (id, name, schoolYear, isActive) => gql(`mutation($id: Int!, $name: String!, $schoolYear: String!, $isActive: Int!) { updateSemester(id: $id, name: $name, schoolYear: $schoolYear, isActive: $isActive) { id name schoolYear: schoolYear isActive: isActive } }`, { id, name, schoolYear, isActive }),
    deleteSemester: (id) => gql(`mutation($id: Int!) { deleteSemester(id: $id) }`, { id }),
    createSchedule: (subjectId, facultyId, roomId, semesterId, dayOfWeek, startTime, endTime) => gql(`mutation($subjectId: Int!, $facultyId: Int!, $roomId: Int!, $semesterId: Int!, $dayOfWeek: String!, $startTime: String!, $endTime: String!) { createSchedule(subjectId: $subjectId, facultyId: $facultyId, roomId: $roomId, semesterId: $semesterId, dayOfWeek: $dayOfWeek, startTime: $startTime, endTime: $endTime) { id subjectId: subjectId facultyId: facultyId roomId: roomId semesterId: semesterId dayOfWeek: dayOfWeek startTime: startTime endTime: endTime subjectCode: subjectCode subjectName: subjectName facultyName: facultyName employeeId: employeeId roomName: roomName building semesterName: semesterName schoolYear: schoolYear } }`, { subjectId, facultyId, roomId, semesterId, dayOfWeek, startTime, endTime }),
    updateSchedule: (id, subjectId, facultyId, roomId, semesterId, dayOfWeek, startTime, endTime) => gql(`mutation($id: Int!, $subjectId: Int!, $facultyId: Int!, $roomId: Int!, $semesterId: Int!, $dayOfWeek: String!, $startTime: String!, $endTime: String!) { updateSchedule(id: $id, subjectId: $subjectId, facultyId: $facultyId, roomId: $roomId, semesterId: $semesterId, dayOfWeek: $dayOfWeek, startTime: $startTime, endTime: $endTime) { id subjectId: subjectId facultyId: facultyId roomId: roomId semesterId: semesterId dayOfWeek: dayOfWeek startTime: startTime endTime: endTime subjectCode: subjectCode subjectName: subjectName facultyName: facultyName employeeId: employeeId roomName: roomName building semesterName: semesterName schoolYear: schoolYear } }`, { id, subjectId, facultyId, roomId, semesterId, dayOfWeek, startTime, endTime }),
    deleteSchedule: (id) => gql(`mutation($id: Int!) { deleteSchedule(id: $id) }`, { id }),
};
const Api = { Queries, Mutations };
class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}
