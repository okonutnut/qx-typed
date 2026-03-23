declare var username: string;
declare var userRole: "admin" | "faculty" | "student";
declare var userFullName: string;
declare var setContent: (
  contentOrFactory: qx.ui.core.Widget | (() => qx.ui.core.Widget),
  title?: string,
) => void;
