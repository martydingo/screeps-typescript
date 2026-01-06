/* eslint-disable max-classes-per-file */
declare module "screeps-typescript-starter" {
  // ---------------------------------------------------------------------------
  // Logging
  // ---------------------------------------------------------------------------
  export enum LogSeverity {
    EMERGENCY = 0,
    ALERT = 1,
    CRITICAL = 2,
    ERROR = 3,
    WARNING = 4,
    NOTICE = 5,
    INFORMATIONAL = 6,
    DEBUG = 7
  }

  export function Log(serverity: LogSeverity, module: string, message: string): void;

  // ---------------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------------
  export interface GameConfig {
    logLevel: LogSeverity;
    labConfig: {
      [key: string]: LabConfig[];
    };
    roomsToMine: string[];
    roomsToClaim: string[];
    username: string;
    lowCpuMode: boolean;
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
    styles: {
      paths: {
        colors: {
          [key: string]: string;
        };
      };
    };
  };

  // ---------------------------------------------------------------------------
  // Profiler
  // ---------------------------------------------------------------------------
  interface ProfilerMemory {
    class: ClassProfilerMemory;
    method: MethodProfilerMemory;
  }

  interface ClassProfilerMemory {
    [key: string]: ClassProfilerEntry;
  }

  interface ClassProfilerEntry {
    start: number;
    end: number;
    total: number;
  }

  interface MethodProfilerMemory {
    [key: string]: MethodProfilerEntry;
  }

  interface MethodProfilerEntry {
    time: number;
    calls: number;
    total: number;
    max: number;
  }

  export const profileMethod: (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => PropertyDescriptor;

  export const profileClass: (
    name: string
  ) => (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => PropertyDescriptor;

  // ---------------------------------------------------------------------------
  // Pathfinding / cache
  // ---------------------------------------------------------------------------
  export interface RoomPathCache {
    exits: {
      [key: string]: {
        [key: string]: string;
      };
    };
  }

  type StructureMonitorTypes = "containers";

  export const Pathfinding: {
    routeCallback: (roomName: string, fromRoomName: string) => number;

    routeToRoom: (
      originRoomName: string,
      destinationRoomName: string
    ) =>
      | {
          exit: ExitConstant;
          room: string;
        }[]
      | -2;

    lookAround: (
      originPos: RoomPosition,
      structureMonitorType: StructureMonitorTypes,
      range: number
    ) => Structure<StructureConstant> | null;

    cacheExit: (
      origin: RoomPosition,
      destinationRoom: string,
      path: PathStep[]
    ) => void;
  };

  // ---------------------------------------------------------------------------
  // Creep base + globals
  // ---------------------------------------------------------------------------
  export interface CreepMemoryTemplate {
    type: string;
    room: string;
    curTask: string;
    _pathfind?: {
      worldRoute: {
        exit: ExitConstant;
        room: string;
      }[];
      roomRoute: {
        roomName: string;
        path: string;
        cached: boolean;
      };
    };
  }

  interface GenericStructureWithStore extends Structure<StructureConstant> {
    store: StoreDefinition;
  }

  export class CreepTemplate {
    static run(): void;
  }

  // ---------------------------------------------------------------------------
  // Body builder
  // ---------------------------------------------------------------------------
  type PartKey = BodyPartConstant;
  export type Ratio = Partial<Record<PartKey, number>>;
  export type MaxBodyParts = Partial<Record<PartKey, number>>;

  /**
   * Build a body from a ratio (weights) under an energy budget.
   */
  export function buildBodyFromRatio(opts: {
    ratio: Ratio;
    maxBodyParts: MaxBodyParts;
    energyAvailable: number;
    minSpend?: number;
    maxParts?: number;
    firstParts?: PartKey[];
    alternateOrder?: PartKey[];
  }): PartKey[];

  // ---------------------------------------------------------------------------
  // Build creep
  // ---------------------------------------------------------------------------
  interface BuildCreepMemory extends CreepMemoryTemplate {
    assignedRoom: string;
  }

  export class BuildCreep extends CreepTemplate {
    static bodyPartRatio: {
      work: number;
      carry: number;
      move: number;
    };
    static run(): void;
    private static constructSite;
  }

  // ---------------------------------------------------------------------------
  // Spawn creep + daemon
  // ---------------------------------------------------------------------------
  interface SpawnCreepMemory extends CreepMemoryTemplate {
    assignedRoom: string;
    assignedInfrastructure?:
      | Id<StructureSpawn>
      | Id<StructureExtension>
      | Id<StructureTower>;
  }

  export class SpawnCreep extends CreepTemplate {
    static bodyPartRatio: {
      work: number;
      carry: number;
      move: number;
    };
    static run(): void;
    private static feedSpawns;
    private static discernInfrastructureToFeed;
    private static feedInfrastructure;
  }

  export interface SpawnJob {
    type: "spawn";
    name: string;
    bodyPartRatio: Ratio;
    maxBodyParts?: MaxBodyParts;
    status: string;
    priority: number;
    params: {
      memory: CreepMemory;
    };
  }

  export class SpawnDaemon {
    static run(): void;
    private static waitUntilFullCapacity;
    private static findClosestSpawn;
    private static manageSpawnCreepJobs;
    private static determineSpawnCreepPriority;
    private static discernCost;
  }

  // ---------------------------------------------------------------------------
  // Construction daemon
  // ---------------------------------------------------------------------------
  export class ConstructionDaemon {
    static run(): void;
  }

  // ---------------------------------------------------------------------------
  // Claim / Reserve / Controller + daemon
  // ---------------------------------------------------------------------------
  type ClaimCreepMemory = CreepMemoryTemplate;

  export class ClaimCreep extends CreepTemplate {
    static bodyPartRatio: {
      work: number;
      carry: number;
      move: number;
      claim: number;
    };
    static maxBodyParts: {
      move: number;
      claim: number;
    };
    static run(): void;
    private static moveToRoom;
    private static claimController;
  }

  interface ControllerCreepMemory extends CreepMemoryTemplate {
    assignedController: Id<StructureController>;
  }

  export class ControllerCreep extends CreepTemplate {
    static bodyPartRatio: {
      work: number;
      carry: number;
      move: number;
    };
    static run(): void;
    private static fetchEnergy;
    private static manageBoosts;
    private static boostParts;
    private static upgradeController;
  }

  type ReserveCreepMemory = CreepMemoryTemplate;

  export class ReserveCreep extends CreepTemplate {
    static bodyPartRatio: {
      work: number;
      carry: number;
      move: number;
      claim: number;
    };
    static maxBodyParts: {
      move: number;
      claim: number;
    };
    static run(): void;
    private static moveToRoom;
    private static reserveController;
  }

  export class ControllerDaemon {
    static run(): void;
    private static manageUpgradeCreeps;
    private static manageClaimCreeps;
    private static manageReserveCreeps;
  }

  // ---------------------------------------------------------------------------
  // Extractor
  // ---------------------------------------------------------------------------
  interface ExtractorCreepMemory extends CreepMemoryTemplate {
    assignedExtractor: Id<StructureExtractor>;
    assignedContainer: Id<StructureContainer>;
  }

  export class ExtractorCreep extends CreepTemplate {
    static bodyPartRatio: {
      work: number;
      carry: number;
      move: number;
    };
    static maxBodyParts: {
      work: number;
      carry: number;
      move: number;
    };
    static run(): void;
    private static mineExtractor;
  }

  export class ExtractorDaemon {
    static run(): void;
    private static manageExtractorCreeps;
  }

  // ---------------------------------------------------------------------------
  // Lab
  // ---------------------------------------------------------------------------
  export interface LabTask {
    resource: ResourceConstant;
    structure: Id<StructureLab> | Id<StructureContainer>;
    priority: number;
    status: "pending" | "assigned" | "done";
    assignedCreep?: Id<Creep>;
  }

  export interface LabJob {
    name: string;
    room: string;
    recipe: MineralCompoundConstant;
    tasks: {
      [key: string]: LabTask;
    };
    config: LabConfig;
    type: "lab";
  }

  export class LabDaemon {
    static run(): void;
    private static manageLabJobs;
    private static manageLabCreeps;
    private static operateLabs;
  }

  interface LabCreepMemory extends CreepMemoryTemplate {
    origin: string;
    destination: string;
  }

  export class LabCreep extends CreepTemplate {
    static bodyPartRatio: {
      work: number;
      carry: number;
      move: number;
    };
    static run(): void;
    private static fetchResource;
    private static depositResource;
    private static emptyResources;
  }

  // ---------------------------------------------------------------------------
  // Link creep + daemon
  // ---------------------------------------------------------------------------
  interface LinkCreepMemory extends CreepMemoryTemplate {
    assignedLink: Id<StructureLink>;
  }

  export class LinkCreep extends CreepTemplate {
    static bodyPartRatio: {
      work: number;
      carry: number;
      move: number;
    };
    static run(): void;
    private static fetchEnergy;
    private static depositEnergy;
  }

  export class LinkDaemon {
    static run(): void;
    private static discernLinkTypes;
    private static discernLinkDistances;
    private static manageStorageLinkCreeps;
    private static operateLinks;
  }

  // ---------------------------------------------------------------------------
  // Source creep + daemon
  // ---------------------------------------------------------------------------
  interface SourceCreepMemory extends CreepMemoryTemplate {
    assignedSource: Id<Source>;
  }

  export class SourceCreep extends CreepTemplate {
    static bodyPartRatio: {
      work: number;
      carry: number;
      move: number;
    };
    static maxBodyParts: {
      work: number;
      carry: number;
      move: number;
    };
    static run(): void;
  }

  export class SourceDaemon {
    static run(): void;
    private static determineSpawnCreepPriority;
  }

  // ---------------------------------------------------------------------------
  // Transport
  // ---------------------------------------------------------------------------
  interface TransportCreepMemory extends CreepMemoryTemplate {
    origin: Id<StructureStorage>;
    destination: Id<StructureStorage>;
    resourceType: ResourceConstant;
  }

  export class TransportCreep extends CreepTemplate {
    static bodyPartRatio: {
      work: number;
      carry: number;
      move: number;
    };
    static run(): void;
    private static lootEnergyInRoom;
    private static fetchResource;
    private static depositResource;
  }

  // ---------------------------------------------------------------------------
  // Daemons
  // ---------------------------------------------------------------------------
  export class CreepDaemon {
    static run(): void;
  }

  export class ResourceDaemon {
    static run(): void;
    private static manageLocalLootTransportCreepJobs;
    private static manageMiningLootTransportCreepJobs;
    private static manageRemoteStorageTransportCreepJobs;
  }

  export class TowerDaemon {
    static run(): void;
    private static cycleTowers;
    private static healCreeps;
    private static attackCreeps;
    private static repairStructures;
  }

  export class TerminalDaemon {
    static run(): void;
    private static manageTerminal;
    private static orderResource;
  }

  export class Daemons {
    static run(): void;
  }

  // ---------------------------------------------------------------------------
  // Monitors
  // ---------------------------------------------------------------------------
  export interface StorageMonitorMemory {
    [key: string]: {
      resources: {
        [key: string]: {
          amount: number;
          capacity: number;
        };
      };
    };
  }

  export class StorageMonitor {
    static run(storage: StructureStorage): void;
  }

  interface GlobalMonitorMemory {
    gcl: {
      level: number;
      progress: number;
      nextLevel: number;
    };
    cpu: {
      current: number;
      bucket: number;
    };
    time: number;
  }

  export class GlobalMonitor {
    static run(): void;
  }

  interface ConstructionSiteMemory {
    progress: {
      progress: number;
      total: number;
    };
    pos: RoomPosition;
  }

  export class ConstructionSiteMonitor {
    static run(roomName: string): void;
  }

  interface ControllerMemory {
    owner?: {
      username: string;
      my: boolean;
    };
    upgrade: {
      progress: number;
      nextLevel: number;
    };
    safeMode: {
      active: boolean;
      available: number;
      timeLeft?: number;
      cooldown?: number;
    };
    downgrade: number;
    level: number;
  }

  export class ControllerMonitor {
    static run(roomName: string): void;
  }

  interface HostileMemory {
    hits: {
      current: number;
      total: number;
    };
    body: {
      boost?: string | number;
      type: string;
      hits: number;
    }[];
    owner: string;
  }

  export class HostileMonitor {
    static run(roomName: string): void;
  }

  interface ResourceMonitorMemory {
    amount: number;
    resource: ResourceConstant;
    pos: RoomPosition;
  }

  export class ResourceMonitor {
    static run(roomName: string): void;
  }

  interface SourceMemory {
    energy: {
      amount: number;
      capacity: number;
    };
    regeneration: number;
  }

  export class SourceMonitor {
    static run(roomName: string): void;
  }

  interface TombstoneMonitorMemory {
    resources: {
      [key: string]: number;
    };
    pos: RoomPosition;
  }

  export class TombstoneMonitor {
    static run(roomName: string): void;
  }

  interface RoomMonitorMemory {
    amount: number;
    capacity: number;
  }

  export class RoomMonitor {
    static run(): void;
    private static monitorRoom;
  }

  export interface ExtensionMonitorMemory {
    [key: string]: {
      energy: {
        amount: number;
        capacity: number;
      };
      pos: RoomPosition;
    };
  }

  export class ExtensionMonitor {
    static run(extension: StructureExtension): void;
  }

  export interface RoadMonitorMemory {
    [key: string]: {
      hits: {
        current: number;
        total: number;
      };
      pos: RoomPosition;
      decay: number;
    };
  }

  export class RoadMonitor {
    static run(road: StructureRoad): void;
  }

  export interface RuinMonitorMemory {
    [key: string]: {
      energy: {
        amount: number;
      };
      pos: RoomPosition;
    };
  }

  export class RuinMonitor {
    static run(ruin: Ruin): void;
  }

  export interface TowerMonitorMemory {
    [key: string]: {
      hits: {
        current: number;
        total: number;
      };
      energy: {
        amount: number;
        capacity: number;
      };
      pos: RoomPosition;
    };
  }

  export class TowerMonitor {
    static run(tower: StructureTower): void;
  }

  export interface LinkMonitorMemory {
    [key: string]: {
      energy: {
        amount: number;
        capacity: number;
      };
      pos: RoomPosition;
      distances: {
        [key: string]: {
          distance: number;
          type: "storage" | "source" | "controller";
        };
      };
      linkType: "unknown" | "storage" | "source" | "controller";
    };
  }

  export class LinkMonitor {
    static run(link: StructureLink): void;
  }

  export interface ContainerMonitorMemory {
    [key: string]: {
      resources: {
        [key: string]: {
          amount: number;
          capacity: number;
        };
      };
      hits: {
        hits: number;
        hitsMax: number;
      };
    };
  }

  export class ContainerMonitor {
    static run(container: StructureContainer): void;
  }

  export interface LabMonitorMemory {
    [key: string]: {
      resources: {
        [key: string]: {
          amount: number;
          capacity: number;
        };
      };
    };
  }

  export class LabMonitor {
    static run(lab: StructureLab): void;
  }

  export interface TerminalMonitorMemory {
    [key: string]: {
      resources: {
        [key: string]: {
          amount: number;
          capacity: number;
        };
      };
    };
  }

  export class TerminalMonitor {
    static run(terminal: StructureTerminal): void;
  }

  export interface ExtractorMonitorMemory {
    [key: string]: {
      mineral: {
        id: Id<Mineral>;
        type: MineralConstant;
        amount: number;
        density: number;
        regeneration: number;
      };
      cooldown: number;
    };
  }

  export class ExtractorMonitor {
    static run(extractor: StructureExtractor): void;
  }

  export interface WallMonitorMemory {
    [key: string]: {
      hits: {
        current: number;
        total: number;
      };
      pos: RoomPosition;
    };
  }

  export class WallMonitor {
    static run(wall: StructureWall): void;
  }

  export interface RampartMonitorMemory {
    [key: string]: {
      hits: {
        current: number;
        total: number;
      };
      pos: RoomPosition;
      decay: number;
    };
  }

  export class RampartMonitor {
    static run(rampart: StructureRampart): void;
  }

  interface StructureMonitorMemory {
    extensions: ExtensionMonitorMemory;
    towers: TowerMonitorMemory;
    roads: RoadMonitorMemory;
    ruins: RuinMonitorMemory;
    storage: StorageMonitorMemory;
    links: LinkMonitorMemory;
    containers: ContainerMonitorMemory;
    labs: LabMonitorMemory;
    terminal: TerminalMonitorMemory;
    extractor: ExtractorMonitorMemory;
    walls: WallMonitorMemory;
    ramparts: RampartMonitorMemory;
  }

  export class StructureMonitor {
    static run(): void;
  }

  export class Monitors {
    static run(): void;
  }

  // ---------------------------------------------------------------------------
  // Error mapper
  // ---------------------------------------------------------------------------
  import { SourceMapConsumer } from "source-map";

  export class ErrorMapper {
    private static _consumer?;
    static get consumer(): SourceMapConsumer;
    static cache: { [key: string]: string };
    static sourceMappedStackTrace(error: Error | string): string;
    static wrapLoop(loop: () => void): () => void;
  }

  // ---------------------------------------------------------------------------
  // Integration test helper
  // ---------------------------------------------------------------------------
  class IntegrationTestHelper {
    private _server;
    private _player;
    get server(): any;
    get player(): any;
    beforeEach(): Promise<void>;
    afterEach(): Promise<void>;
  }

  export const helper: IntegrationTestHelper;

  // ---------------------------------------------------------------------------
  // Game / Memory exports
  // ---------------------------------------------------------------------------
  export const Game: {
    creeps: { [name: string]: any };
    rooms: any;
    spawns: any;
    time: any;
  };

  export const Memory: {
    creeps: { [name: string]: any };
  };

  // ---------------------------------------------------------------------------
  // Main loop
  // ---------------------------------------------------------------------------
  export const loop: () => void;

  // ---------------------------------------------------------------------------
  // GLOBAL AUGMENTATIONS
  // ---------------------------------------------------------------------------
  global {
    // --- Creep prototype extensions ---
    interface Creep {
      _moveTo(
        x: number,
        y: number,
        opts?: MoveToOpts
      ): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET;

      _moveTo(
        target:
          | RoomPosition
          | {
              pos: RoomPosition;
            },
        opts?: MoveToOpts
      ): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND;

      mineSource: (sourceId: Id<Source>) => number;
      fetchDroppedEnergy: () => number;
      fetchDroppedResource: () => number;
      lootEnergyFromRuin: () => number;
      lootResourceFromTombstone: (resourceType: ResourceConstant) => number;

      depositResourceIntoStructure: (
        structure: GenericStructureWithStore,
        resourceType: ResourceConstant,
        amount?: number
      ) => number;

      fetchResourceFromStructure: (
        structure: GenericStructureWithStore,
        resourceType: ResourceConstant,
        amount?: number
      ) => number;

      fetchResourceFromStorage: (
        resourceType: ResourceConstant,
        amount?: number
      ) => number;

      fetchResourceFromTerminal: (
        resourceType: ResourceConstant,
        amount?: number
      ) => number;

      fetchEnergy: () => number;

      moveToUnknownRoom: (destinationRoomName: string, opts?: MoveToOpts) => number;

      _harvest: (
        this: Creep,
        target: Source | Mineral<MineralConstant> | Deposit
      ) => CreepActionReturnCode | ERR_NOT_FOUND | ERR_NOT_ENOUGH_RESOURCES;

      _transfer(
        target: Structure<StructureConstant> | AnyCreep,
        resourceType: ResourceConstant,
        amount?: number
      ): ScreepsReturnCode;

      _pickup(target: Resource<ResourceConstant>): CreepActionReturnCode | ERR_FULL;

      _withdraw(
        target: Structure<StructureConstant> | Tombstone | Ruin,
        resourceType: ResourceConstant,
        amount?: number
      ): ScreepsReturnCode;
    }

    // --- Memory ---
    interface Memory {
      profiler: ProfilerMemory;

      pathCache: {
        [key: string]: RoomPathCache;
      };

      heatMaps: {
        creep: {
          [key: string]: {
            [key: number]: {
              [key: number]: {
                [key: number]: number;
              };
            };
          };
        };
      };

      spawnHeld: { [key: string]: number };

      jobs: { [key: string]: SpawnJob | LabJob };

      global: Partial<GlobalMonitorMemory>;

      uuid: number;
      log: any;
      env: "prod" | "dev";
    }

    // --- RoomMemory ---
    interface RoomMemory {
      constructionSites?: { [key: string]: ConstructionSiteMemory };
      controller?: { [key: string]: ControllerMemory };
      hostiles?: { [key: string]: HostileMemory };
      resources?: { [key: string]: ResourceMonitorMemory };
      sources?: { [key: string]: SourceMemory };
      tombstones?: { [key: string]: TombstoneMonitorMemory };
      energy?: RoomMonitorMemory;
      structures?: Partial<StructureMonitorMemory>;
    }

    // --- SpawnMemory ---
    interface SpawnMemory {
      energy: { amount: number; capacity: number };
      spawning: boolean;
      room: string;
      distances: { [key: string]: number };
    }

    // --- CreepMemory (IMPORTANT) ---
    //
    // Your original file re-declared `type CreepMemory = Partial<...>` many times.
    // That does NOT merge; it overwrites and/or conflicts depending on ordering.
    //
    // If you want "one interface contains all entries", do it like this:
    interface CreepMemory extends Partial<CreepMemoryTemplate> {
      assignedRoom?: string;

      // Build
      // (from BuildCreepMemory)
      // assignedRoom already covered

      // Spawn
      assignedInfrastructure?:
        | Id<StructureSpawn>
        | Id<StructureExtension>
        | Id<StructureTower>;

      // Controller
      assignedController?: Id<StructureController>;

      // Extractor
      assignedExtractor?: Id<StructureExtractor>;
      assignedContainer?: Id<StructureContainer>;

      // Lab
      origin?: string;
      destination?: string;

      // Link
      assignedLink?: Id<StructureLink>;

      // Source
      assignedSource?: Id<Source>;

      // Transport
      resourceType?: ResourceConstant;
    }
  }
}
