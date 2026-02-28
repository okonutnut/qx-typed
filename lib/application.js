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
class AppLayout extends qx.ui.container.Composite {
    constructor(content, sidebarItems, pageMap, pageTitle) {
        super();
        this.setLayout(new qx.ui.layout.Grow());
        this.setBackgroundColor(AppColors.background());
        // Register service worker for PWA support
        if ("serviceWorker" in navigator) {
            window.addEventListener("load", () => {
                navigator.serviceWorker.register("./sw.js").catch(console.error);
            });
        }
        const MOBILE_BREAKPOINT = 768;
        let isSidebarCollapsed = false;
        let isMobileMode = qx.bom.Viewport.getWidth() < MOBILE_BREAKPOINT;
        let drawer = null;
        const sidebar = new Sidebar(sidebarItems);
        const contentContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        const desktopShell = new qx.ui.container.Composite(new qx.ui.layout.HBox());
        const mountDesktop = () => {
            drawer === null || drawer === void 0 ? void 0 : drawer.close();
            desktopShell.removeAll();
            desktopShell.add(sidebar);
            desktopShell.add(contentContainer, { flex: 1 });
            this.removeAll();
            this.add(desktopShell);
        };
        const mountMobile = () => {
            sidebar.setCollapsed(false);
            drawer = new BsDrawer(contentContainer, sidebar, 230);
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
        sidebar.addListener("select", (ev) => {
            const label = ev.getData();
            const nextPage = getPage(label);
            if (!nextPage || nextPage === currentPage)
                return;
            mainContentContainer.removeAll();
            mainContentContainer.add(nextPage, { edge: 0 });
            currentPage = nextPage;
            navbar.setPageTitle(label);
            if (isMobileMode)
                drawer === null || drawer === void 0 ? void 0 : drawer.close();
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
const PAGE_DEFINITIONS = [
    {
        label: "Form",
        iconName: "notebook-pen",
        factory: () => new FormPage(),
    },
    {
        label: "Buttons",
        iconName: "banana",
        factory: () => new ButtonsPage(),
    },
    {
        label: "Controls",
        iconName: "sliders-horizontal",
        factory: () => new ControlPage(),
    },
    {
        label: "Table",
        iconName: "table",
        factory: () => new TablePage(),
    },
    {
        label: "Windows",
        iconName: "app-window",
        factory: () => new WindowsPage(),
    },
];
function createSidebarItems(definitions = PAGE_DEFINITIONS) {
    return definitions.map((definition) => ({
        label: definition.label,
        icon: new InlineSvgIcon(definition.iconName, 16),
    }));
}
function manipulateSidebarItems(items, pageMap) {
    const normalizedItems = [];
    items.forEach((item) => {
        const normalizedLabel = item.label.trim();
        if (!pageMap.has(normalizedLabel))
            return;
        normalizedItems.push(Object.assign(Object.assign({}, item), { label: normalizedLabel }));
    });
    return normalizedItems;
}
function qooxdooMain(app) {
    var _a, _b, _c;
    const root = app.getRoot();
    const pageMap = new Map();
    PAGE_DEFINITIONS.forEach((definition) => {
        if (definition.factory) {
            pageMap.set(definition.label, definition.factory);
        }
    });
    const sidebarItems = manipulateSidebarItems(createSidebarItems(), pageMap);
    const firstLabel = (_b = (_a = sidebarItems[0]) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : (_c = PAGE_DEFINITIONS.find((d) => !!d.factory)) === null || _c === void 0 ? void 0 : _c.label;
    const initialPageFactory = firstLabel ? pageMap.get(firstLabel) : undefined;
    const initialPage = initialPageFactory
        ? initialPageFactory()
        : new MainPage();
    const layout = new AppLayout(initialPage, sidebarItems, pageMap, firstLabel);
    root.add(layout, { edge: 0 });
}
qx.registry.registerMainMethod(qooxdooMain);
class ButtonsPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(10));
        const container = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
        let isRowLayout = true;
        const primaryBtn = new BsButton("Primary", null, "btn-primary btn-sm");
        const secondaryBtn = new BsButton("Secondary", null, "btn-secondary btn-sm");
        const accentBtn = new BsButton("Accent", null, "btn-accent btn-sm");
        const infoBtn = new BsButton("Info", null, "btn-info btn-sm");
        const successBtn = new BsButton("Success", null, "btn-success btn-sm");
        const warningBtn = new BsButton("Warning", null, "btn-warning btn-sm");
        const destructiveBtn = new BsButton("Error", null, "btn-destructive btn-sm");
        const outlineBtn = new BsButton("Outline", null, "btn-outline btn-sm");
        primaryBtn.onClick(() => {
            alert("Hello World!");
        });
        secondaryBtn.onClick(() => {
            alert("Hello World1");
        });
        accentBtn.onClick(() => {
            alert("Hello World2");
        });
        outlineBtn.onClick(() => {
            isRowLayout = !isRowLayout;
            container.setLayout(isRowLayout ? new qx.ui.layout.HBox(10) : new qx.ui.layout.VBox(10));
        });
        container.setAllowGrowX(true);
        container.add(primaryBtn, { flex: 1 });
        container.add(secondaryBtn, { flex: 1 });
        container.add(accentBtn, { flex: 1 });
        container.add(infoBtn, { flex: 1 });
        container.add(successBtn, { flex: 1 });
        container.add(warningBtn, { flex: 1 });
        container.add(destructiveBtn, { flex: 1 });
        container.add(outlineBtn, { flex: 1 });
        this.add(container);
    }
}
class ControlPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(20));
        this.vbox = new qx.ui.container.Composite(new qx.ui.layout.VBox(20));
        this.add(this.vbox, { top: 0 });
        this.initWidgets();
    }
    initWidgets() {
        // ColorSelector
        var label = new qx.ui.basic.Label("ColorSelector");
        var colorSelector = new qx.ui.control.ColorSelector();
        this.vbox.add(label);
        this.vbox.add(colorSelector);
        // ColorPopup
        label = new qx.ui.basic.Label("ColorPopup");
        var colorPopup = new qx.ui.control.ColorPopup();
        colorPopup.exclude();
        var openColorPopup = new qx.ui.form.Button("Open Color Popup").set({
            maxWidth: 150,
        });
        this.vbox.add(label);
        this.vbox.add(openColorPopup);
        openColorPopup.addListener("execute", function () {
            colorPopup.placeToWidget(openColorPopup, true);
            colorPopup.show();
        });
        // DateChooser
        var dateChooser = new qx.ui.control.DateChooser().set({ maxWidth: 240 });
        label = new qx.ui.basic.Label("DateChooser");
        this.vbox.add(label);
        this.vbox.add(dateChooser);
    }
}
/**
 * Create a sample form.
 */
class FormPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(3));
        const nameGroup = new BsInputGroup("Name", "Enter your name", "", "input-bordered w-full");
        const passwordGroup = new BsInputGroup("Password", "Enter your password", "", "input-bordered w-full");
        const ageGroup = new BsInputGroup("Age", "Enter your age", "50", "input-bordered w-full");
        const countryGroup = new BsInputGroup("Country", "Enter your country", "", "input-bordered w-full");
        const bioGroup = new BsInputGroup("Bio", "Tell us about yourself", "", "input-bordered w-full");
        const genderLabel = new qx.ui.basic.Label("Gender");
        const genderSelect = new BsSelect(["Man", "Woman", "Genderqueer/Non-Binary", "Prefer not to disclose"], "select-bordered w-full");
        genderSelect.setAllowGrowX(true);
        const genderError = new qx.ui.basic.Label("");
        genderError.setVisibility("excluded");
        genderError.addListenerOnce("appear", () => {
            genderError.getContentElement().addClass("text-error");
        });
        const actions = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
        actions.setAllowGrowX(true);
        actions.setMarginTop(12);
        const sendButton = new BsButton("Send", undefined, "btn-primary btn-sm w-full");
        const resetButton = new BsButton("Reset", undefined, "btn-outline btn-sm w-full");
        sendButton.onClick(() => {
            let hasError = false;
            const name = nameGroup.getValue().trim();
            const password = passwordGroup.getValue().trim();
            const ageValue = ageGroup.getValue().trim();
            const gender = genderSelect.getSelectedValue();
            if (!name) {
                nameGroup.setError("Name is required");
                hasError = true;
            }
            else
                nameGroup.clearError();
            if (!password) {
                passwordGroup.setError("Password is required");
                hasError = true;
            }
            else if (password.length < 6) {
                passwordGroup.setError("Password must be at least 6 characters");
                hasError = true;
            }
            else
                passwordGroup.clearError();
            const age = Number(ageValue);
            if (!ageValue) {
                ageGroup.setError("Age is required");
                hasError = true;
            }
            else if (Number.isNaN(age) || age < 0 || age > 120) {
                ageGroup.setError("Age must be between 0 and 120");
                hasError = true;
            }
            else
                ageGroup.clearError();
            if (!gender) {
                genderError.setValue("Gender is required");
                genderError.show();
                hasError = true;
            }
            else {
                genderError.setValue("");
                genderError.exclude();
            }
            if (hasError)
                return;
            alert("send...");
        });
        resetButton.onClick(() => {
            nameGroup.setValue("").clearError();
            passwordGroup.setValue("").clearError();
            ageGroup.setValue("50").clearError();
            countryGroup.setValue("").clearError();
            bioGroup.setValue("");
            genderSelect.resetSelection();
            genderError.setValue("");
            genderError.exclude();
        });
        actions.add(sendButton);
        actions.add(resetButton);
        this.add(nameGroup);
        this.add(passwordGroup);
        this.add(ageGroup);
        this.add(countryGroup);
        this.add(genderLabel);
        this.add(genderSelect);
        this.add(genderError);
        this.add(bioGroup);
        this.add(actions);
    }
}
class IconsPage extends qx.ui.tabview.Page {
    constructor() {
        super("Icons");
        const homeIcon = new InlineSvgIcon("home", 128).set({
            textColor: "#f0570b",
        });
        const bananaIcon = new InlineSvgIcon("banana", 128).set({
            textColor: "#0bf06a",
        });
        const babyIcon = new InlineSvgIcon("baby", 128).set({
            textColor: "#1a0bf0",
        });
        const hbox = new qx.ui.layout.HBox(10);
        hbox.setAlignY("middle");
        const container = new qx.ui.container.Composite(hbox);
        container.add(homeIcon);
        container.add(bananaIcon);
        container.add(babyIcon);
        this.add(container);
    }
}
class Navbar extends qx.ui.container.Composite {
    constructor(pageTitle, onToggleSidebar) {
        super(new qx.ui.layout.HBox(2));
        this.setAlignY("middle");
        this.setPadding(10);
        this.setHeight(55);
        this.setBackgroundColor(AppColors.card());
        this.setDecorator(new qx.ui.decoration.Decorator().set({
            widthBottom: 1,
            styleBottom: "solid",
            colorBottom: AppColors.border(),
        }));
        const collapseSidebarBtn = new BsButton("", new InlineSvgIcon("menu", 16), "btn-sm btn-ghost");
        collapseSidebarBtn.setWidth(50);
        // fire event when menu button is clicked
        collapseSidebarBtn.onClick(() => {
            this.fireEvent("toggleSidebar");
            if (onToggleSidebar)
                onToggleSidebar();
        });
        this.add(collapseSidebarBtn);
        this.__titleLabel = new qx.ui.basic.Label(pageTitle !== null && pageTitle !== void 0 ? pageTitle : "Dashboard");
        this.__titleLabel.setTextColor(AppColors.foreground());
        this.__titleLabel.setFont(
        // @ts-ignore
        new qx.bom.Font(18, ["Inter", "sans-serif"]).set({ bold: true }));
        this.__titleLabel.setAlignY("middle");
        this.setWidth(100);
        this.add(this.__titleLabel);
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
};
class Sidebar extends qx.ui.container.Composite {
    constructor(sidebarItems) {
        super(new qx.ui.layout.VBox(0).set({ alignX: "center" }));
        this.__collapsed = false;
        this.__buttons = [];
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
        this.add(schoolLogo);
        const header = new qx.ui.basic.Label("Aldersgate College Inc.");
        this.__header = header;
        header.setFont(
        //@ts-ignore
        new qx.bom.Font(12, ["Inter", "sans-serif"]).set({ bold: true }));
        header.setTextAlign("center");
        header.setHeight(50);
        header.setPadding(5);
        header.setTextColor(AppColors.sidebarForeground());
        this.add(header);
        const itemsContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
        itemsContainer.setAllowGrowX(true);
        const buttonsByLabel = new Map();
        const setActiveLabel = (activeLabel) => {
            buttonsByLabel.forEach((btn, label) => {
                btn.setActive(label === activeLabel);
            });
        };
        sidebarItems.forEach((item) => {
            const row = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({ alignY: "middle" }));
            row.set({
                allowGrowX: true,
                height: 40,
            });
            const button = new BsSidebarButton(item.label, item.icon);
            button.setAllowGrowX(true);
            button.setWidth(230);
            this.__buttons.push(button);
            buttonsByLabel.set(item.label, button);
            button.onClick(() => {
                setActiveLabel(item.label);
                this.fireDataEvent("select", item.label);
            });
            row.add(button, { flex: 1 });
            itemsContainer.add(row);
        });
        // Set first item active initially
        if (sidebarItems.length > 0) {
            setActiveLabel(sidebarItems[0].label);
        }
        this.add(itemsContainer, { flex: 1 });
        const footer = new qx.ui.basic.Label("SIAS Online 10.x");
        this.__footer = footer;
        //@ts-ignore
        footer.setFont(new qx.bom.Font(12, ["Inter", "sans-serif"]));
        footer.setTextAlign("center");
        footer.setHeight(30);
        footer.setPadding(5);
        footer.setTextColor(AppColors.sidebarForeground());
        this.add(footer);
    }
    setCollapsed(collapsed) {
        this.__collapsed = collapsed;
        if (collapsed) {
            this.setWidth(72);
            this.setPadding(10);
            this.__header.exclude();
            this.__footer.exclude();
            this.__buttons.forEach((btn) => {
                btn.setCollapsed(true);
                btn.setWidth(56);
            });
        }
        else {
            this.setWidth(230);
            this.setPadding(10);
            this.__header.show();
            this.__footer.show();
            this.__buttons.forEach((btn) => {
                btn.setCollapsed(false);
                btn.setWidth(230);
            });
        }
    }
    isCollapsed() {
        return this.__collapsed;
    }
}
Sidebar.events = {
    select: "qx.event.type.Data",
};
class TablePage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(10));
        const table = this.createTable();
        table.setFocusedCell(2, 5);
        this.add(table);
    }
    createTable() {
        const rowData = this.createRandomRows(500);
        const tableModel = new qx.ui.table.model.Simple();
        tableModel.setColumns(["ID", "A number", "A date", "Boolean"]);
        tableModel.setData(rowData);
        tableModel.setColumnEditable(1, true);
        tableModel.setColumnEditable(2, true);
        tableModel.setColumnSortable(3, false);
        const table = new qx.ui.table.Table(tableModel);
        table.set({
            width: 600,
            height: 400,
            decorator: null,
        });
        table
            .getSelectionModel()
            .setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);
        const tcm = table.getTableColumnModel();
        tcm.setDataCellRenderer(3, new qx.ui.table.cellrenderer.Boolean());
        tcm.setHeaderCellRenderer(2, new qx.ui.table.headerrenderer.Icon("resource/app/office-calendar.png", "A date"));
        return table;
    }
    /**
     * Create random rows for the table example
     */
    createRandomRows(rowCount) {
        const rowData = [];
        var nextId = 0;
        const now = new Date().getTime();
        var dateRange = 400 * 24 * 60 * 60 * 1000; // 400 days
        for (var row = 0; row < rowCount; row++) {
            const date = new Date(now + Math.random() * dateRange - dateRange / 2);
            rowData.push([
                nextId++,
                Math.random() * 10000,
                date,
                Math.random() > 0.5,
            ]);
        }
        return rowData;
    }
}
class ToolBarPage extends qx.ui.tabview.Page {
    constructor() {
        super("Toolbar");
        this.add(this.getToolBar());
    }
    getToolBar() {
        const toolBar = new qx.ui.toolbar.ToolBar();
        toolBar.add(new qx.ui.toolbar.Button("Item 1"));
        toolBar.add(new qx.ui.toolbar.Button("Item 2"));
        toolBar.add(new qx.ui.toolbar.Separator());
        const menuButton = new qx.ui.toolbar.MenuButton("Menu");
        const menu = new qx.ui.menu.Menu();
        for (let n = 1; n < 5; n++)
            menu.add(new qx.ui.menu.Button("item-" + n));
        menuButton.setMenu(menu);
        toolBar.add(menuButton);
        const menuButton2 = new qx.ui.toolbar.MenuButton("ButtonMenu");
        menuButton2.setMenu(this.getButtonMenu());
        toolBar.add(menuButton2);
        return toolBar;
    }
    getButtonMenu() {
        const menu = new qx.ui.menu.Menu();
        const button = new qx.ui.menu.Button("Menu MenuButton", "icon/16/actions/document-new.png");
        const checkBox = new qx.ui.menu.CheckBox("Menu MenuCheckBox");
        const checkBoxChecked = new qx.ui.menu.CheckBox("Menu MenuCheckBox").set({
            value: true,
        });
        // RadioButton
        const radioButton = new qx.ui.menu.RadioButton("Menu RadioButton");
        // RadioButton (active)
        const radioButtonActive = new qx.ui.menu.RadioButton("Menu RadioButton").set({ value: true });
        menu.add(button);
        menu.add(checkBox);
        menu.add(checkBoxChecked);
        menu.add(radioButton);
        menu.add(radioButtonActive);
        return menu;
    }
}
/**
 * Create a sample tree
 */
function createTree() {
    // create the tree
    const tree = new qx.ui.tree.Tree();
    tree.set({ width: 150, height: 300 });
    const root = new qx.ui.tree.TreeFolder("root");
    root.setOpen(true);
    tree.setRoot(root);
    // Make some dummy entries
    for (let x = 1; x < 5; x++) {
        const folder = new qx.ui.tree.TreeFolder("folder-" + x);
        root.add(folder);
        for (let y = 1; y < 9; y++) {
            const file = new qx.ui.tree.TreeFolder("file-" + y);
            folder.add(file);
        }
    }
    const page = new qx.ui.tabview.Page("Tree");
    page.add(tree);
    return page;
}
class WindowsPage extends qx.ui.container.Composite {
    constructor() {
        super(new qx.ui.layout.VBox(10));
        const desktop = new qx.ui.window.Desktop();
        for (let n = 1; n <= 5; n++) {
            const win = new qx.ui.window.Window("Window " + n);
            win.setShowStatusbar(true);
            win.setMinWidth(200);
            win.setDraggable(true);
            win.open();
            desktop.add(win, { left: n * 50, top: n * 50 });
        }
        this.add(desktop, { edge: 0, top: 0 });
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
class BsButton extends qx.ui.basic.Atom {
    constructor(text, icon, className) {
        super();
        this.__buttonEl = null;
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        this.setFocusable(true);
        this.__iconHtml = icon ? icon.getHtml() : "";
        this.__buttonText = text !== null && text !== void 0 ? text : "";
        this.__className = className !== null && className !== void 0 ? className : "";
        this.__htmlButton = new qx.ui.embed.Html("");
        this.__htmlButton.setAllowGrowX(true);
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
        const idx = this.getTabIndex();
        if (idx == null) {
            this.__buttonEl.removeAttribute("tabindex");
        }
        else {
            this.__buttonEl.setAttribute("tabindex", String(idx));
        }
    }
    __renderButton() {
        const iconPart = this.__iconHtml ? `<span>${this.__iconHtml}</span>` : "";
        const idx = this.getTabIndex();
        const tabIndexAttr = idx == null ? "" : `tabindex="${idx}"`;
        const classes = [
            "btn",
            "w-full",
            "bg-card",
            "text-foreground",
            "border",
            "border-border",
            this.__className,
        ]
            .filter(Boolean)
            .join(" ");
        this.__htmlButton.setHtml(`
      <div class="p-1">
        <button type="button" class="${classes}" ${tabIndexAttr}>
          ${iconPart}
          ${this.__buttonText}
        </button>
      </div>
    `);
        // setHtml replaces DOM; rebind native events
        qx.event.Timer.once(() => this.__bindNativeButton(), this, 0);
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
    constructor(content, drawerPanel, drawerWidth = 230) {
        super(new qx.ui.layout.Canvas());
        this.__open = false;
        this.add(content, { left: 0, right: 0, top: 0, bottom: 0 });
        this.__backdrop = new qx.ui.core.Widget();
        this.__backdrop.set({
            backgroundColor: AppColors.overlay(0.35),
            zIndex: 20,
        });
        this.__backdrop.addListener("tap", () => this.close());
        this.__backdrop.exclude();
        this.add(this.__backdrop, { left: 0, right: 0, top: 0, bottom: 0 });
        this.__drawerPanel = drawerPanel;
        this.__drawerPanel.set({
            width: drawerWidth,
            zIndex: 30,
        });
        this.__drawerPanel.exclude();
        this.add(this.__drawerPanel, { left: 0, top: 0, bottom: 0 });
    }
    open() {
        if (this.__open)
            return;
        this.__open = true;
        this.__backdrop.show();
        this.__drawerPanel.show();
    }
    close() {
        if (!this.__open)
            return;
        this.__open = false;
        this.__backdrop.exclude();
        this.__drawerPanel.exclude();
    }
    toggle() {
        this.__open ? this.close() : this.open();
    }
    isOpen() {
        return this.__open;
    }
}
class BsInput extends qx.ui.basic.Atom {
    constructor(value, placeholder, className) {
        super();
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
        this.__inputEl.setAttribute("tabindex", "-1");
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
        super(new qx.ui.layout.VBox(6));
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
}
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
        const idx = this.getTabIndex();
        if (idx == null)
            this.__selectEl.removeAttribute("tabindex");
        else
            this.__selectEl.setAttribute("tabindex", String(idx));
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
        const idx = this.getTabIndex();
        const tabIndexAttr = idx == null ? "" : `tabindex="${idx}"`;
        const classes = [
            "select",
            "bg-card",
            "text-foreground",
            "border-border",
            this.__className,
        ]
            .filter(Boolean)
            .join(" ");
        this.__htmlSelect.setHtml(`
      <div class="p-1">
        <select class="${classes}" ${tabIndexAttr}>
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
class BsSidebarButton extends qx.ui.basic.Atom {
    constructor(text, icon, className) {
        super();
        this.__active = false;
        this.__collapsed = false;
        this.__buttonEl = null;
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
        const activeClass = this.__active
            ? "font-semibold btn-sm-primary"
            : "btn-sm-ghost";
        const layoutClass = this.__collapsed ? "justify-center" : "justify-start";
        const classes = [
            "w-full",
            "items-center",
            "gap-2",
            "border-sidebar-border",
            layoutClass,
            activeClass,
            this.__className,
        ]
            .filter(Boolean)
            .join(" ");
        this.__htmlButton.setHtml(`
      <div class="p-1">
        <button
          type="button"
          class="${classes}"
        >
          ${iconPart}
          ${textPart}
        </button>
      </div>
    `);
        qx.event.Timer.once(() => this.__bindNativeButton(), this, 0);
    }
    setActive(active) {
        this.__active = active;
        this.__renderButton();
        return this;
    }
    setCollapsed(collapsed) {
        this.__collapsed = collapsed;
        this.__renderButton();
        return this;
    }
    onClick(handler) {
        this.addListener("execute", handler);
        return this;
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
        const idx = this.getTabIndex();
        if (idx == null)
            this.__textareaEl.removeAttribute("tabindex");
        else
            this.__textareaEl.setAttribute("tabindex", String(idx));
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
        const idx = this.getTabIndex();
        const tabIndexAttr = idx == null ? "" : `tabindex="${idx}"`;
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
class MainPage extends qx.ui.container.Composite {
    constructor() {
        super();
        this.setLayout(new qx.ui.layout.VBox(10));
        this.setAlignY("middle");
        const helloLabel = new qx.ui.basic.Label("Hello, World!");
        this.add(helloLabel);
        const checkBtn = new InlineSvgIcon("check", 24);
        const button = new BsButton("Check Button", checkBtn, "btn-primary");
        this.add(button);
    }
}
