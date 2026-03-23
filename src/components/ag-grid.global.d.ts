declare global {
  interface Window {
    agGrid: {
      createGrid: (element: HTMLElement, options: any) => any;
    };
  }
}

export {};
