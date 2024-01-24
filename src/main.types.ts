export {};

declare global {
  type Bot = Creep;
  export interface Memory {
    //
  }
  namespace NodeJS {
    interface Global {
      environment: "production" | "staging" | "development";
    }
  }
}
