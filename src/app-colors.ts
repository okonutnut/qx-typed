class AppColors {
  private static __cache = new Map<string, string>();

  private static resolveCssVar(cssVarName: string, fallback?: string): string {
    const cacheKey = `${cssVarName}|${fallback ?? ""}`;
    const cached = this.__cache.get(cacheKey);
    if (cached) return cached;

    if (typeof document === "undefined" || !document.body) {
      return fallback ?? "";
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

  static primary(): string {
    return this.resolveCssVar("--color-primary", "#f6f7f9");
  }

  static background(): string {
    return this.resolveCssVar("--color-background", "#f6f7f9");
  }

  static card(): string {
    return this.resolveCssVar("--color-card", "#fcfcfc");
  }

  static foreground(): string {
    return this.resolveCssVar("--color-foreground", "#0f1729");
  }

  static border(): string {
    return this.resolveCssVar("--color-border", "#e5e7eb");
  }

  static sidebar(): string {
    return this.resolveCssVar("--color-sidebar", "#fcfcfc");
  }

  static sidebarForeground(): string {
    return this.resolveCssVar("--color-sidebar-foreground", "#0f1729");
  }

  static sidebarBorder(): string {
    return this.resolveCssVar("--color-sidebar-border", "#e5e7eb");
  }

  static accent(): string {
    return this.resolveCssVar("--color-accent", "#f8f9fa");
  }

  static accentForeground(): string {
    return this.resolveCssVar("--color-accent-foreground", "#0f1729");
  }

  static destructive(): string {
    return this.resolveCssVar("--color-destructive", "#dc2626");
  }

  static mutedForeground(): string {
    return this.resolveCssVar("--color-muted-foreground", "#64748b");
  }

  static overlay(alpha = 0.35): string {
    const foreground = this.foreground();
    const match = foreground.match(/rgba?\((\d+)\D+(\d+)\D+(\d+)/i);
    if (!match) return `rgba(15, 23, 42, ${alpha})`;

    const [, red, green, blue] = match;
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }
}
