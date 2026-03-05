class Sidebar extends qx.ui.container.Composite {
  static events = {
    select: "qx.event.type.Data",
    action: "qx.event.type.Data",
  };

  private __collapsed = false;
  private __drawerMode = false;
  private __schoolLogo: qx.ui.basic.Image;
  private __header: qx.ui.basic.Label;
  private __appVersion: qx.ui.basic.Label;
  private __searchInput: BsInput;
  private __backContainer: qx.ui.container.Composite;
  private __itemsViewport: qx.ui.container.Composite;
  private __listContainer: qx.ui.container.Composite | null = null;
  private __footer: BsSidebarAccount;
  private __buttons: BsSidebarButton[] = [];
  private __buttonStates = new Map<string, BsSidebarButton>();
  private __rootItems: SidebarItem[];
  private __activeLeafLabel: string | null = null;
  private __searchQuery = "";
  private __isAnimating = false;
  private __hasRendered = false;
  private __stack: Array<{ label: string; items: SidebarItem[] }> = [];

  constructor(sidebarItems: SidebarItem[], initialActiveLabel?: string) {
    super(new qx.ui.layout.VBox(0).set({ alignX: "center" }));
    this.__rootItems = sidebarItems;
    this.__activeLeafLabel =
      initialActiveLabel ?? this.__findFirstLeafLabel(sidebarItems);

    this.setWidth(230);
    this.setPadding(10);
    this.setAlignX("center");
    this.setBackgroundColor(AppColors.sidebar());
    this.setDecorator(
      new qx.ui.decoration.Decorator().set({
        widthRight: 1,
        styleRight: "solid",
        colorRight: AppColors.sidebarBorder(),
      }),
    );

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
      new qx.bom.Font(12).set({ bold: true }),
    );
    header.setTextAlign("center");
    header.setPadding(5);
    header.setTextColor(AppColors.sidebarForeground());
    this.add(header);

    const appVersion = new qx.ui.basic.Label("SIAS Online x.xx");
    this.__appVersion = appVersion;
    appVersion.setTextColor(AppColors.sidebarForeground());
    appVersion.setTextAlign("center");
    appVersion.setOpacity(0.7);
    appVersion.setFont(
      // @ts-ignore
      new qx.bom.Font(10, ["Inter", "sans-serif"]),
    );
    appVersion.setMarginTop(6);
    appVersion.setMarginBottom(12);
    this.add(appVersion);

    this.__searchInput = new BsInput("", "Search pages...", "w-full input-sm");
    this.__searchInput.setLeadingHtml(
      '<img src="resource/app/icons/search.svg" alt="" width="16" height="16" style="display:block;opacity:0.7" />',
    );
    this.__searchInput.setAllowGrowX(true);
    this.__searchInput.onInput((value) => {
      this.__searchQuery = value.trim();
      this.__renderVisibleItems(false);
    });
    this.add(this.__searchInput);

    this.__backContainer = new qx.ui.container.Composite(
      new qx.ui.layout.VBox(0),
    );
    this.__backContainer.setAllowGrowX(true);
    const backButton = new BsSidebarButton(
      "Back",
      new InlineSvgIcon("arrow-left", 16),
    );
    backButton.setAllowGrowX(true);
    backButton.setWidth(230);
    backButton.onClick(() => {
      if (this.__stack.length === 0 || this.__isAnimating) return;
      this.__stack.pop();
      this.__renderVisibleItems(true);
    });
    this.__backContainer.add(backButton);
    this.add(this.__backContainer);

    this.__itemsViewport = new qx.ui.container.Composite(
      new qx.ui.layout.Grow(),
    );
    this.__itemsViewport.setAllowGrowX(true);
    this.__itemsViewport.setAllowGrowY(true);
    this.__itemsViewport.setMinHeight(10);
    this.add(this.__itemsViewport, { flex: 1 });

    this.__itemsViewport.addListenerOnce("appear", () => {
      this.__setDomStyles(this.__itemsViewport, {
        overflow: "hidden",
      });
    });

    const footer = new BsSidebarAccount(
      globalThis.username || "User",
      "Student",
      "resource/app/user.png",
      "RB",
    );
    this.__footer = footer;
    this.__footer.onAction((action) => {
      this.fireDataEvent("action", action);
    });
    this.add(footer);

    this.__renderVisibleItems(false);
  }

  private __findFirstLeafLabel(items: SidebarItem[]): string | null {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        const nestedLabel = this.__findFirstLeafLabel(item.children);
        if (nestedLabel) return nestedLabel;
      } else {
        return item.label;
      }
    }
    return null;
  }

  private __getCurrentLevelItems(): SidebarItem[] {
    if (this.__stack.length === 0) return this.__rootItems;
    return this.__stack[this.__stack.length - 1].items;
  }

  private __collectLeafEntries(
    source: SidebarItem[],
    path: string[] = [],
    out: Array<{ item: SidebarItem; path: string[] }> = [],
  ): Array<{ item: SidebarItem; path: string[] }> {
    source.forEach((item) => {
      const nextPath = [...path, item.label];
      if (item.children && item.children.length > 0) {
        this.__collectLeafEntries(item.children, nextPath, out);
      } else {
        out.push({ item, path: nextPath });
      }
    });
    return out;
  }

  private __setPathFromLeaf(path: string[]): void {
    const nextStack: Array<{ label: string; items: SidebarItem[] }> = [];
    let source = this.__rootItems;

    for (let i = 0; i < path.length - 1; i++) {
      const label = path[i];
      const match = source.find((entry) => entry.label === label);
      if (!match || !match.children || match.children.length === 0) break;

      nextStack.push({ label: match.label, items: match.children });
      source = match.children;
    }

    this.__stack = nextStack;
  }

  private __syncBackVisibility(): void {
    const shouldShow =
      !this.__collapsed &&
      this.__searchQuery.length === 0 &&
      this.__stack.length > 0;
    if (shouldShow) this.__backContainer.show();
    else this.__backContainer.exclude();
  }

  private __renderVisibleItems(animated: boolean): void {
    this.__syncBackVisibility();

    const nextList = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
    nextList.setAllowGrowX(true);

    this.__buttons = [];
    this.__buttonStates.clear();

    if (this.__searchQuery.length > 0) {
      const query = this.__searchQuery.toLowerCase();
      const matches = this.__collectLeafEntries(this.__rootItems).filter(
        ({ item, path }) => {
          const haystack = `${path.join(" ")} ${item.label}`.toLowerCase();
          return haystack.includes(query);
        },
      );

      matches.forEach(({ item, path }) => {
        const parentTrail = path.slice(0, path.length - 1).join(" / ");
        const displayLabel = parentTrail
          ? `${item.label} - ${parentTrail}`
          : item.label;
        const row = this.__createListRow();
        const button = this.__createSidebarButton(
          displayLabel,
          item.icon,
          false,
        );

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
    } else {
      const currentItems = this.__getCurrentLevelItems();

      currentItems.forEach((item) => {
        const hasChildren = !!item.children && item.children.length > 0;
        const row = this.__createListRow();
        const button = this.__createSidebarButton(
          item.label,
          item.icon,
          hasChildren,
        );

        if (hasChildren) {
          button.onClick(() => {
            if (this.__isAnimating || !item.children) return;
            this.__stack.push({ label: item.label, items: item.children });
            this.__renderVisibleItems(true);
          });
        } else {
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
      transition:
        "opacity 280ms cubic-bezier(0.4, 0, 0.2, 1), transform 280ms cubic-bezier(0.4, 0, 0.2, 1)",
    });
    this.__setDomStyles(previousList, {
      position: "absolute",
      top: "0",
      left: "0",
      right: "0",
      opacity: "1",
      transform: "translateX(0px)",
      transition:
        "opacity 280ms cubic-bezier(0.4, 0, 0.2, 1), transform 280ms cubic-bezier(0.4, 0, 0.2, 1)",
    });

    qx.event.Timer.once(
      () => {
        this.__setDomStyles(previousList, {
          opacity: "0",
          transform: "translateX(-30px)",
        });
        this.__setDomStyles(nextList, {
          opacity: "1",
          transform: "translateX(0px)",
        });
      },
      this,
      20,
    );

    qx.event.Timer.once(
      () => {
        this.__itemsViewport.remove(previousList);
        this.__setDomStyles(nextList, {
          position: "relative",
          transform: "none",
        });
        this.__listContainer = nextList;
        this.__isAnimating = false;
      },
      this,
      320,
    );
  }

  private __createListRow(): qx.ui.container.Composite {
    const row = new qx.ui.container.Composite(
      new qx.ui.layout.HBox().set({ alignY: "middle" }),
    );
    row.set({
      allowGrowX: true,
      height: 40,
    });
    return row;
  }

  private __createSidebarButton(
    label: string,
    icon: InlineSvgIcon | undefined,
    hasChildren: boolean,
  ): BsSidebarButton {
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

  private __setDomStyles(
    widget: qx.ui.core.Widget,
    styles: Record<string, string>,
  ): void {
    const contentElement = widget.getContentElement() as any;
    if (!contentElement || !contentElement.setStyle) return;
    for (const key in styles) {
      if (!Object.prototype.hasOwnProperty.call(styles, key)) continue;
      contentElement.setStyle(key, styles[key]);
    }
  }

  public setCollapsed(collapsed: boolean): void {
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

      qx.event.Timer.once(
        () => {
          this.setWidth(0);
          this.setMinWidth(0);
          this.__setDomStyles(this, { transition: "none", willChange: "auto" });
        },
        this,
        DURATION + 20,
      );
      return;
    }

    if (skipAnimation) {
      this.show();
      this.setMinWidth(230);
      this.setWidth(230);
      this.__setDomStyles(this, { overflow: "visible", opacity: "1" });
    } else {
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

      qx.event.Timer.once(
        () => {
          this.__setDomStyles(this, {
            transition: `width ${DURATION}ms ${EASING}, min-width ${DURATION}ms ${EASING}, opacity ${DURATION}ms ${EASING}`,
            width: "230px",
            minWidth: "230px",
            opacity: "1",
          });
        },
        this,
        20,
      );

      qx.event.Timer.once(
        () => {
          this.setMinWidth(230);
          this.setWidth(230);
          this.__setDomStyles(this, {
            overflow: "visible",
            transition: "none",
            willChange: "auto",
          });
        },
        this,
        DURATION + 40,
      );
    }

    this.__applyChromeMode();
  }

  public setDrawerMode(enabled: boolean): void {
    this.__drawerMode = enabled;
    if (this.__collapsed) return;
    this.__applyChromeMode();
    this.__renderVisibleItems(false);
  }

  private __applyChromeMode(): void {
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

  public isCollapsed(): boolean {
    return this.__collapsed;
  }
}
