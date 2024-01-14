export {};

export enum LogVerbosity {
    Debug = 1,
    Info = 2,
    Warn = 3,
    Error = 4
}

declare global {
    type LogConfiguration = {
        verbosity: LogVerbosity
    };
}
