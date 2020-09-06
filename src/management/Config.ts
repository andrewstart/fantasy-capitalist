import { Resources } from './ResourcePool';

export enum WorkerSkill
{
    Harvest = 1 << 0,
    Brew = 1 << 1,
    Veteran = 1 << 2,
    Hero = 1 << 3,
    Healer = 1 << 4,
    Vendor = 1 << 5,
}

export enum StructureType
{
    Herbalist = 'h',
    PotionBrewer = 'p',
    AdventurerGuild = 'a',
    Market = 'm',
}

export interface ProductionConfig
{
    /** Type of resource required for production run */
    input: Resources;
    /** Type of resource generated from production run */
    output: Resources;
    /** Input quantity required for each worker present */
    inputPerWorker: number;
    /** Basic output generated per worker present */
    baseOutputPerWorker: number;
    /** Bonuses applied per worker who has the specified skill */
    workerBonus: { skill: WorkerSkill, flatIncrease: number }[];
}

export interface StructureConfig
{
    /** Type of structure */
    type: StructureType;
    /** Title of structure in the UI */
    name: string;
    /** Gold cost to unlock structure */
    unlockCost: number;
    /** Gold cost to hire a manager */
    managerCost: number;
    /**
     * Data for each production line -
     * one of them must be satisfied to be able to run the structure.
     */
    production: ProductionConfig[];
    /** Experience for each worker on run completion */
    expPerRun: number;
    /** Skill that the worker can learn on level up at this structure (benefits the structure) */
    skillAvailable: WorkerSkill;
    /** in seconds */
    baseWorkTime: number;
}

interface WorkerConfig
{
    /** Exp required to reach next level */
    LevelingExp: number[];
    /** Gold cost to level up when exp is reached */
    LevelingCost: number[];
    /** Cost to hire a new worker, given the current number of workers */
    Cost: (currentWorkers: number) => number;
}

interface IConfig {
    Worker: WorkerConfig;
    Structures: StructureConfig[];
}
/** In theory this could be loaded from an external JSON file (but functions would have to be created from text) */
export const Config:IConfig = {
    Worker: {
        LevelingExp: [
            1000,
            100000,
            10000000,
        ],
        LevelingCost: [
            100,
            10000,
            1000000,
        ],
        Cost: (currentWorkers:number) => {
            // right now, 4 buildings with 1 worker each as default means we need to subtract 3 for the first
            // purchsed worker to be 10 gold
            return 10 * (currentWorkers - 3);
        },
    },
    Structures: [
        {
            type: StructureType.Herbalist,
            name: 'Herbalist',
            unlockCost: 0,
            managerCost: 30,
            production: [
                {
                    input: Resources.None,
                    inputPerWorker: 0,
                    output: Resources.Herbs,
                    baseOutputPerWorker: 1,
                    workerBonus: [
                        {skill: WorkerSkill.Harvest, flatIncrease: 1}
                    ],
                },
            ],
            expPerRun: 20,
            skillAvailable: WorkerSkill.Harvest,
            baseWorkTime: 5
        },
        {
            type: StructureType.PotionBrewer,
            name: 'Potion Brewer',
            unlockCost: 40,
            managerCost: 50,
            production: [
                {
                    input: Resources.Herbs,
                    inputPerWorker: 4,
                    output: Resources.Potions,
                    baseOutputPerWorker: 1,
                    workerBonus: [
                        { skill: WorkerSkill.Brew, flatIncrease: 1 }
                    ],
                },
            ],
            expPerRun: 20,
            skillAvailable: WorkerSkill.Brew,
            baseWorkTime: 30
        },
        {
            type: StructureType.AdventurerGuild,
            name: 'Adventurer\'s Guild',
            unlockCost: 200,
            managerCost: 100,
            production: [
                {
                    input: Resources.Potions,
                    inputPerWorker: 2,
                    output: Resources.Treasure,
                    baseOutputPerWorker: 1,
                    workerBonus: [
                        { skill: WorkerSkill.Veteran, flatIncrease: 1 },
                        { skill: WorkerSkill.Harvest, flatIncrease: 1 }
                    ],
                },
            ],
            expPerRun: 20,
            skillAvailable: WorkerSkill.Veteran,
            baseWorkTime: 180
        },
        {
            type: StructureType.Market,
            name: 'Market',
            unlockCost: 0,
            managerCost: 20,
            // NOTE ON MARKET PRODUCTION
            // Required input, base output, and work time are high (basically a multiplier of what I think is fair)
            // to make sure that higher tier structures can always consume resources and the market will sell off the rest
            // Specifically, each production line consumes off a batch of inputs that is larger than a batch used
            // elsewhere
            production: [
                {
                    input: Resources.Herbs,
                    inputPerWorker: 5,
                    output: Resources.Gold,
                    baseOutputPerWorker: 10,
                    workerBonus: [
                        { skill: WorkerSkill.Vendor, flatIncrease: 5 }
                    ],
                },
                {
                    input: Resources.Potions,
                    inputPerWorker: 5,
                    output: Resources.Gold,
                    baseOutputPerWorker: 60,
                    workerBonus: [
                        { skill: WorkerSkill.Vendor, flatIncrease: 15 }
                    ],
                },
                {
                    input: Resources.Treasure,
                    inputPerWorker: 3,
                    output: Resources.Gold,
                    baseOutputPerWorker: 150,
                    workerBonus: [
                        { skill: WorkerSkill.Vendor, flatIncrease: 30 }
                    ],
                },
            ],
            expPerRun: 20,
            skillAvailable: WorkerSkill.Vendor,
            baseWorkTime: 25
        },
    ],
};