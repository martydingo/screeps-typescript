export {};

declare global {
  interface ControllerAnalysisData {
    assignedBot: string | null;
    mode: "upgrade" | "reserve" | "claim";
  }
}
