import { LogSeverity } from "utils/log";

export interface GameConfig {
  logLevel: LogSeverity;
  labConfig: { [key: string]: LabConfig[] };
  roomsToMine: string[];
  roomsToClaim: string[];
  username: string
}

export interface LabConfig {
  recipe: MineralCompoundConstant;
  labs: {
    primary: {
      lab: string;
      boost: boolean;
    };
    secondaries: string[];
  };
}

export const config: {
  dev: GameConfig;
  prod: GameConfig;
  styles: { paths: { colors: { [key: string]: string } } };
} = {
  dev: {
    labConfig: {
      W8N3: [
        {
          recipe: RESOURCE_CATALYZED_GHODIUM_ACID,
          labs: {
            primary: {
              lab: "69534e858da4d900a3b93d8f",
              boost: true
            },
            secondaries: ["69534e9d28849e004a699ef5", "69534e9e8da4d900a3b93d90"]
          }
        }
      ]
    },
    logLevel: 7,
    roomsToMine: [],
    roomsToClaim: [],
    username: Object.values(Game.spawns).pop()!.owner.username
  },
  prod: {
    logLevel: 6,
    labConfig: {
      E12S16: [
        {
          recipe: RESOURCE_CATALYZED_GHODIUM_ACID,
          labs: {
            primary: {
              lab: "69542a29dd628efc5cea6bd1",
              boost: true
            },
            secondaries: ["6954ed632c544973c51408da", "69553bd8ba6e4229fc8322ed"]
          }
        }
      ]
    },
    roomsToMine: [
      "E11S17"
    ],
    roomsToClaim: ["E14S17"],
    username: Object.values(Game.spawns).pop()!.owner.username
  },
  //
  styles: {
    paths: {
      colors: {
        BuildCreep: "#5ccfe6",
        ClaimCreep: "#c3a6ff",
        ControllerCreep: "#ffae57",
        LinkCreep: "#a2aabc",
        SourceCreep: "#ffcc66",
        SpawnCreep: "#bae67e",
        TransportCreep: "#6679a4"
      }
    }
  }
  // EMERGENCY = 0,
  // ALERT = 1,
  // CRITICAL = 2,
  // ERROR = 3,
  // WARNING = 4,
  // NOTICE = 5,
  // INFORMATIONAL = 6,
  // DEBUG = 7,
};
