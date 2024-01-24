export { };

declare global {
  interface Bot extends Creep {}
  export interface Memory {
    //
  }
  namespace NodeJS {
    interface Global {
      environment: "production" | "staging" | "development"
    }
  }
}
