class BsToast {
  private static __dispatchToast(message: string, type: "success" | "error" | "info" = "info"): void {
    const categoryMap = {
      success: "success",
      error: "error",
      info: "info",
    } as const;

    const titleMap = {
      success: "Success",
      error: "Error",
      info: "Info",
    };

    const event = new CustomEvent("basecoat:toast", {
      detail: {
        config: {
          category: categoryMap[type],
          title: titleMap[type],
          description: message,
        },
      },
    });
    document.dispatchEvent(event);
  }

  public static success(message: string): void {
    BsToast.__dispatchToast(message, "success");
  }

  public static error(message: string): void {
    BsToast.__dispatchToast(message, "error");
  }

  public static info(message: string): void {
    BsToast.__dispatchToast(message, "info");
  }
}