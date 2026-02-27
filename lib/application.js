class AppLayout extends qx.ui.container.Composite {
    constructor(content, sidebarItems, pageMap, pageTitle) {
        super();
        this.setLayout(new qx.ui.layout.HBox());
        this.setBackgroundColor("#f6f7f9");
        const sidebar = new Sidebar(sidebarItems);
        const contentContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        const navbar = new Navbar(pageTitle);
        contentContainer.add(navbar);
        const mainContentContainer = new qx.ui.container.Composite(new qx.ui.layout.Grow());
        mainContentContainer.setPadding(10);
        mainContentContainer.add(content, { edge: 0 });
        sidebar.addListener("select", (ev) => {
            const label = ev.getData();
            const nextPage = pageMap.get(label);
            if (!nextPage)
                return;
            mainContentContainer.removeAll();
            mainContentContainer.add(nextPage, { edge: 0 });
            navbar.setPageTitle(label);
        });
        contentContainer.add(mainContentContainer, { flex: 1, edge: 0 });
        this.add(sidebar);
        this.add(contentContainer, { flex: 1 });
    }
}
function createSidebarItems() {
    return [
        {
            label: "Dashboard",
            icon: new InlineSvgIcon("home", 16),
        },
        { label: "Profile", icon: new InlineSvgIcon("user", 16) },
        { label: "Settings", icon: new InlineSvgIcon("banana", 16) },
    ];
}
function manipulateSidebarItems(items, pageMap) {
    return items
        .map((item) => (Object.assign(Object.assign({}, item), { label: item.label.trim() })))
        .filter((item) => pageMap.has(item.label)) // keep only items that have a page
        .sort((a, b) => a.label.localeCompare(b.label)); // optional ordering
}
function qooxdooMain(app) {
    var _a, _b, _c;
    const root = app.getRoot();
    const pageMap = new Map([
        ["Dashboard", new MainPage()],
        ["Profile", new FormPage()],
    ]);
    const sidebarItems = manipulateSidebarItems(createSidebarItems(), pageMap);
    const firstLabel = (_b = (_a = sidebarItems[0]) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : "Dashboard";
    const initialPage = (_c = pageMap.get(firstLabel)) !== null && _c !== void 0 ? _c : new MainPage();
    const layout = new AppLayout(initialPage, sidebarItems, pageMap, firstLabel);
    root.add(layout, { edge: 0 });
}
qx.registry.registerMainMethod(qooxdooMain);
// Example import
var Button = qx.ui.form.Button;
class ButtonsPage extends qx.ui.tabview.Page {
    constructor() {
        super("Buttons");
        const button1 = new Button("Hello", "resource/app/internet-web-browser.png");
        const button2 = new Button("Dark Theme", "resource/app/preferences-theme.png");
        const button3 = new Button("Light Theme", "resource/app/preferences-theme.png");
        const button4 = new Button("Change Layout", "@MaterialIcons/face"); // use an icon font
        const meta = qx.theme.manager.Meta.getInstance();
        button1.addListener("execute", function () {
            alert("Hello World!");
        });
        button2.addListener("execute", function () {
            meta.setTheme(qx.theme.TangibleDark);
        });
        button3.addListener("execute", function () {
            meta.setTheme(qx.theme.TangibleLight);
        });
        button4.addListener("execute", function () {
            container.getLayout() == layout1
                ? container.setLayout(layout2)
                : container.setLayout(layout1);
        });
        const layout1 = new qx.ui.layout.HBox();
        const layout2 = new qx.ui.layout.VBox();
        const container = new qx.ui.container.Composite(layout1);
        container.add(button1);
        container.add(button2);
        container.add(button3);
        container.add(button4);
        this.add(container);
    }
}
class ControlPage extends qx.ui.tabview.Page {
    constructor() {
        super("Control");
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
        super(new qx.ui.layout.VBox());
        const form = new qx.ui.form.Form();
        this.addSection1(form);
        this.addSection2(form);
        // send button with validation
        const sendButton = new qx.ui.form.Button("Send");
        sendButton.addListener("execute", function () {
            if (form.validate()) {
                alert("send...");
            }
        }, this);
        form.addButton(sendButton);
        // reset button
        const resetButton = new qx.ui.form.Button("Reset");
        resetButton.addListener("execute", function () {
            form.reset("");
        }, this);
        form.addButton(resetButton);
        const formRenderer = new qx.ui.form.renderer.Single(form);
        this.add(formRenderer);
    }
    addSection1(form) {
        form.addGroupHeader("Registration");
        const userName = new qx.ui.form.TextField();
        userName.setRequired(true);
        form.add(userName, "Name");
        const password = new qx.ui.form.PasswordField();
        password.setRequired(true);
        form.add(password, "Password");
        form.add(new qx.ui.form.CheckBox(), "Save?");
    }
    addSection2(form) {
        // add the second header
        form.addGroupHeader("Personal Information");
        form.add(new qx.ui.form.Spinner(0, 50, 100), "Age");
        form.add(new qx.ui.form.TextField(), "Country");
        const genderBox = new qx.ui.form.SelectBox();
        genderBox.add(new qx.ui.form.ListItem("Man"));
        genderBox.add(new qx.ui.form.ListItem("Woman"));
        genderBox.add(new qx.ui.form.ListItem("Genderqueer/Non-Binary"));
        genderBox.add(new qx.ui.form.ListItem("Prefer not to disclose"));
        form.add(genderBox, "Gender");
        form.add(new qx.ui.form.TextArea(), "Bio");
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
    constructor(pageTitle) {
        super(new qx.ui.layout.HBox(2));
        this.setAlignY("middle");
        this.setPadding(10);
        this.setHeight(55);
        this.setBackgroundColor("#fcfcfc");
        this.setDecorator(new qx.ui.decoration.Decorator().set({
            widthBottom: 1,
            styleBottom: "solid",
            colorBottom: "#e5e7eb",
        }));
        const collapseSidebarBtn = new BsButton("", new InlineSvgIcon("menu", 16), "btn-sm btn-ghost");
        collapseSidebarBtn.setWidth(50);
        this.add(collapseSidebarBtn);
        this.__titleLabel = new qx.ui.basic.Label(pageTitle !== null && pageTitle !== void 0 ? pageTitle : "Dashboard");
        this.__titleLabel.setTextColor("#0f1729");
        this.__titleLabel.setFont("bold");
        this.__titleLabel.setAlignY("middle");
        this.add(this.__titleLabel);
    }
    setPageTitle(value) {
        this.__titleLabel.setValue(value);
    }
    // Optional alias (keeps compatibility with older calls)
    setTitle(value) {
        this.setPageTitle(value);
    }
}
class Sidebar extends qx.ui.container.Composite {
    constructor(sidebarItems) {
        super(new qx.ui.layout.VBox().set({ alignX: "center" }));
        this.setWidth(230);
        this.setPadding(10);
        this.setAlignX("center");
        this.setBackgroundColor("#fcfcfc");
        this.setDecorator(new qx.ui.decoration.Decorator().set({
            widthRight: 1,
            styleRight: "solid",
            colorRight: "#e5e7eb",
        }));
        const header = new qx.ui.basic.Label("My App");
        header.setFont(
        //@ts-ignore
        new qx.bom.Font(20, ["Arial", "sans-serif"]).set({ bold: true }));
        header.setTextAlign("center");
        header.setHeight(50);
        header.setPadding(5);
        this.add(header);
        const itemsContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
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
                height: 35,
            });
            const button = new BsSidebarButton(item.label, item.icon);
            button.setAllowGrowX(true);
            button.setWidth(230);
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
        const footer = new qx.ui.basic.Label("© 2024 My Company");
        //@ts-ignore
        footer.setFont(new qx.bom.Font(12, ["Arial", "sans-serif"]));
        footer.setTextAlign("center");
        footer.setHeight(30);
        footer.setPadding(5);
        this.add(footer);
    }
}
Sidebar.events = {
    select: "qx.event.type.Data",
};
class TablePage extends qx.ui.tabview.Page {
    constructor() {
        super("Table");
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
class WindowsPage extends qx.ui.tabview.Page {
    constructor() {
        super("Windows");
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
            // Ensure sizing (remove existing width/height then inject ours)
            out = out.replace(/\swidth="[^"]*"/g, "");
            out = out.replace(/\sheight="[^"]*"/g, "");
            out = out.replace("<svg", `<svg width="${this.__size}" height="${this.__size}" style="display:block;"`);
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
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        const htmlButton = new qx.ui.embed.Html("");
        htmlButton.setAllowGrowX(true);
        let iconHtml = icon ? icon.getHtml() : "";
        const buttonText = text !== null && text !== void 0 ? text : "";
        const renderButton = () => {
            const iconPart = iconHtml ? `<span>${iconHtml}</span>` : "";
            htmlButton.setHtml(`
        <button type="button" class="btn ${className || ""}">
          ${iconPart}
          ${buttonText}
        </button>
      `);
        };
        renderButton();
        if (icon) {
            icon.addListener("changeHtml", () => {
                iconHtml = icon.getHtml();
                renderButton();
            });
        }
        // Fire execute event when tapped
        this.addListener("tap", () => {
            this.fireEvent("execute");
        });
        this._add(htmlButton);
    }
    // Optional convenience method
    onClick(handler) {
        this.addListener("execute", handler);
        return this;
    }
}
// ✅ Declare supported events (important for qx)
BsButton.events = {
    execute: "qx.event.type.Event",
};
class BsSidebarButton extends qx.ui.basic.Atom {
    constructor(text, icon, className) {
        super();
        this.__active = false;
        this._setLayout(new qx.ui.layout.Grow());
        this.setAllowGrowX(true);
        this.__htmlButton = new qx.ui.embed.Html("");
        this.__htmlButton.setAllowGrowX(true);
        this.__iconHtml = icon ? icon.getHtml() : "";
        this.__buttonText = text !== null && text !== void 0 ? text : "";
        this.__className = className || "";
        this.__renderButton();
        if (icon) {
            icon.addListener("changeHtml", () => {
                this.__iconHtml = icon.getHtml();
                this.__renderButton();
            });
        }
        this.__htmlButton.addListener("tap", () => {
            this.fireEvent("execute");
        });
        this._add(this.__htmlButton);
    }
    __renderButton() {
        const iconPart = this.__iconHtml ? `<span>${this.__iconHtml}</span>` : "";
        const activeClass = this.__active
            ? "btn-active bg-base-200 font-semibold"
            : "";
        this.__htmlButton.setHtml(`
      <button
        type="button"
        class="btn btn-ghost btn-sm w-full justify-start items-center gap-2 ${this.__className} ${activeClass}"
      >
        ${iconPart}
        ${this.__buttonText}
      </button>
    `);
    }
    setActive(active) {
        this.__active = active;
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
