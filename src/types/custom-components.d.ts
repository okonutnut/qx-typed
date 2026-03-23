interface BsAlertDialog {
  // Singleton — use BsAlertDialog.show(config) static method
}

interface BsAlertDialogStatic {
  show(config: BsAlertDialogConfig): void;
}

interface BsAvatar {
  setSrc(src: string): this;
  setAlt(alt: string): this;
  setFallback(fallback: string): this;
  setShape(shape: "full" | "rounded" | "square"): this;
}

interface BsButton {
  getVariant(): "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  getSize(): "default" | "sm" | "lg" | "icon";
  onClick(handler: () => void): this;
}

interface BsDrawer {
  open(): void;
  close(): void;
  toggle(): void;
  isOpen(): boolean;
}

interface BsInput {
  getValue(): string;
  setValue(value: string): this;
  setPlaceholder(value: string): this;
  setLeadingHtml(html: string): this;
  onInput(handler: (value: string) => void): this;
}

interface BsInputGroup {
  onInput(handler: (value: string) => void): this;
  getValue(): string;
  setValue(value: string): this;
  setError(message?: string): this;
  clearError(): this;
  getInputWidget(): BsInput;
  setInputTabIndex(value: number): this;
  resetInputTabIndex(): this;
}

interface BsPassword {
  getValue(): string;
  setValue(value: string): this;
  setPlaceholder(value: string): this;
  onInput(handler: (value: string) => void): this;
}

interface BsSelect {
  getSelectedValue(): string;
  setSelectedByLabel(label: string): this;
  resetSelection(): this;
  onChange(handler: (value: string) => void): this;
}

interface BsSeparator {
  setLabel(value: string): this;
}

interface BsSidebarAccount {
  setCollapsed(collapsed: boolean): this;
  setName(name: string): this;
  setUsername(username: string): this;
  setAvatar(src: string, fallback?: string): this;
  onAction(handler: (action: string) => void): this;
  onClick(handler: () => void): this;
}

interface BsSidebarButton {
  setActive(active: boolean): this;
  setCollapsed(collapsed: boolean): this;
  setTrailingHtml(html: string): this;
  onClick(handler: () => void): this;
}

interface BsTextarea {
  getValue(): string;
  setValue(value: string): this;
  setPlaceholder(value: string): this;
  setRows(rows: number): this;
  onInput(handler: (value: string) => void): this;
}
