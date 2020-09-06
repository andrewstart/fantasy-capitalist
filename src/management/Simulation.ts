import { ResourcePool, Resources } from "./ResourcePool";
import { Structure, StructureData } from "./Structure";
import { Config, StructureType } from "./Config";
import { Worker } from "./Worker";

export interface SimulationData
{
    /** Resource pool */
    p: { [name: string]: number };
    /** All structure data */
    s: { [name: string]: StructureData };
    /** Last update time */
    l: number;
}

/**
 * Order in which structures should be analyzed in order to determine resource generation/drain.
 * Since multiple structures could drain a resource, that means that structures later in the list could have their
 * generation stunted if the available supply is too low.
 */
const STRUCTURE_ORDER = [
    // low tier structures (no input requirement) go first, as they can always go at max capacity
    StructureType.Herbalist,
    // higher tier structures consume things in order to run, so they'll need to be calculated after the basics
    // additionally, these must be ordered so that consumers come after generators for any given resource
    StructureType.PotionBrewer,
    StructureType.AdventurerGuild,
    // the market has been tuned so that, assuming roughly even numbers of workers, it will only consume resources when there
    // is an excess amount - as such, we'll calculate it last. This means giving the most possible high value resources
    // before the market takes a look, even if our estimate is off (it'll be tilted in the player's favor, at worst)
    StructureType.Market,
];

export class Simulation
{
    /** The resource pool, in all it's glory */
    public pool: ResourcePool;
    /** Map of structures, for when you want just one */
    public structures: Map<StructureType, Structure>;
    /** List of all structures, for when we need to hit all of them at once */
    private structureList: Structure[];
    /** Cached total worker count */
    private _workerCount:number;

    constructor()
    {
        this.pool = new ResourcePool();
        this._workerCount = 0;
        this.structures = new Map();
        this.structureList = [];
        for (const sConfig of Config.Structures)
        {
            const s = new Structure(sConfig, this.pool);
            this.structureList.push(s);
            this.structures.set(s.type, s);
        }
    }

    /**
     * Total count of current workers - needed for calculating worker cost.
     */
    public get workerCount()
    {
        return this._workerCount;
    }

    /**
     * Hires a new worker for a specific structure
     */
    public hireWorker(structure: Structure)
    {
        if (this.pool.removeResource(Resources.Gold, Config.Worker.Cost(this._workerCount)))
        {
            this._workerCount++;
            structure.addWorker(new Worker(structure));
            return true;
        }
        return false;
    }

    /**
     * Loads saved data. Does not perform catch up (as it may be a blank save).
     */
    public load(data: SimulationData)
    {
        this.pool.load(data.p);
        this._workerCount = 0;
        for (const name in data.s)
        {
            if (this.structures.has(name as StructureType))
            {
                const s = this.structures.get(name as StructureType)!;
                s.load(data.s[name]);
                this._workerCount += s.workers.length;
            }
            else
            {
                // error! deal with this later, as it would only happen if something wrote bad data into our local storage
            }
        }
    }

    /**
     * Catches the simulation up to the current time, given the time of the last save (and currently loaded state).
     * In its current form, this is likely to be somewhat inaccurate (but player favoring) in a resource thin environment and
     * multi-structure production pipeline (that competes with the market). See comments in this method, on STRUCTURE_ORDER, and
     * in Config.ts for more specifics.
     */
    public catchUp(lastTime: number)
    {
        /** time since the last save, in seconds */
        const duration = (Date.now() - lastTime) / 1000;
        /** initial resource supply, at last save */
        const initialSupply = this.pool.clonePool();
        // because there is a dependency tree, we have to figure out the rate of each resource generation
        // we'll just do a fairly basic estimation based on input/output of how often a given structure can be active
        // which should be good enough

        // we'll do a few passes - 1) desired input/output, 2) restricted input/output, and 3) final evaluation
        /** Maximum possible net generation (or consumption if negative) if all inputs are met */
        const maxGeneration: {[name: string]: number} = {};
        for (const type in initialSupply)
        {
            maxGeneration[type] = 0;
        }
        // first pass pass of all structures - desired input/output
        for (const type of STRUCTURE_ORDER)
        {
            const structure = this.structures.get(type)!;
            if (!structure.isUnlocked) continue;
            let estimateDuration = duration;
            // finish out any active production first, because we know that will happen
            // and any input has already been paid
            if (structure.isRunning)
            {
                if (duration >= structure.timeRemaining)
                {
                    for (const p of structure.production)
                    {
                        if (p.running)
                        {
                            maxGeneration[p.outputType] += p.outputCount;
                        }
                    }
                    // reduce the time for any potential estimate by the amount left in this run
                    estimateDuration -= structure.timeRemaining;
                }
                // if the structure wouldn't finish the current run, then we can ignore it entirely here
                else
                {
                    continue;
                }
            }
            // if it isn't managed, it won't run again and now further calculation needed
            if (!structure.hasManager) continue;
            // otherwise, figure out how many times we have the time to run and what input/output that would entail
            const unflooredRuns = estimateDuration / structure.runTime;
            const flooredRuns = Math.floor(unflooredRuns);
            // if we have time to end up with a run in progress (that would have consumed input but not have output yet)
            const inProgress = unflooredRuns > flooredRuns;
            for (const p of structure.production)
            {
                if (p.inputType !== Resources.None)
                {
                    maxGeneration[p.inputType] -= (inProgress ? flooredRuns + 1 : flooredRuns) * p.inputCount;
                }
                maxGeneration[p.outputType] += flooredRuns * p.outputCount;
            }
        }
        /**
         * Since the maximum possible might not have actually been possible due to insufficient resource availablility,
         * this is the net generation restricted downwards
         */
        const restrictedGeneration: { [name: string]: number } = {};
        for (const type in initialSupply)
        {
            restrictedGeneration[type] = 0;
        }
        /**
         * Amount of run (in percent of run) for each structure remaining in progress at the end of catching up
         */
        const runSpillover: { [structure: string]: number } = {};
        // second pass - figure out what we might not be able to produce for future runs given a scarcity of inputs
        for (const type of STRUCTURE_ORDER)
        {
            const structure = this.structures.get(type)!;
            if (!structure.isUnlocked) continue;

            let estimateDuration = duration;
            // again, finish out any active production first, because it is guaranteed
            if (structure.isRunning)
            {
                if (duration >= structure.timeRemaining)
                {
                    for (const p of structure.production)
                    {
                        if (p.running)
                        {
                            restrictedGeneration[p.outputType] += p.outputCount;
                        }
                    }
                    // reduce the time for any potential estimate by the amount left in this run
                    estimateDuration -= structure.timeRemaining;
                }
                // if the structure wouldn't finish its current run, then note progress made and skip it
                else
                {
                    runSpillover[type] = (structure.timeRemaining - duration) / structure.runTime;
                    continue;
                }
            }
            // and again, no further estimation needed if it won't run on its own
            if (!structure.hasManager)
            {
                runSpillover[type] = 0;
                continue;
            }
            // now we get into the juicy bits - calculate, for each production line, how much its output would be limited
            // by the input
            for (const p of structure.production)
            {
                // basic structures will always do max output, OR
                // if there will be an excess supply anyway, then we don't need to worry
                if (p.inputType === Resources.None || initialSupply[p.inputType] + maxGeneration[p.inputType] >= 0)
                {
                    // otherwise, figure out how many times we have the time to run and what input/output that would entail
                    const unflooredRuns = estimateDuration / structure.runTime;
                    const flooredRuns = Math.floor(unflooredRuns);
                    // if we have time to end up with a run in progress (that would have consumed input but not have output yet)
                    const inProgress = unflooredRuns > flooredRuns;
                    if (p.inputType !== Resources.None)
                    {
                        restrictedGeneration[p.inputType] -= (inProgress ? flooredRuns + 1 : flooredRuns) * p.inputCount;
                    }
                    restrictedGeneration[p.outputType] += flooredRuns * p.outputCount;
                    // record how many runs we are going to do
                    runSpillover[type] = unflooredRuns - flooredRuns;
                    continue;
                }

                // maximum possible runs based on input available (and ensuring we have enough time to do so)
                const flooredResourceRuns = Math.floor(initialSupply[p.inputType] + restrictedGeneration[p.inputType] / p.inputCount);
                const unflooredTimeRuns = estimateDuration / structure.runTime;
                const flooredTimeRuns = Math.floor(unflooredTimeRuns);
                const runs = Math.min(flooredResourceRuns, flooredTimeRuns);
                restrictedGeneration[p.inputType] -= runs * p.inputCount;
                restrictedGeneration[p.outputType] += runs * p.outputCount;
                // if resources allow for more runs than the time allows for runs, then we want to make sure we capture
                // a run in progress as well
                if (flooredResourceRuns > flooredTimeRuns)
                {
                    restrictedGeneration[p.inputType] -= p.inputCount;
                    runSpillover[type] = unflooredTimeRuns - flooredTimeRuns;
                }
            }
        }
        // final evaluation - actually apply resource changes, set up structure state at the end
        for (const type of STRUCTURE_ORDER)
        {
            const structure = this.structures.get(type)!;
            if (!structure.isUnlocked) continue;
            structure.setTimeRemaining(runSpillover[type] || 0);
        }
        for (const type in restrictedGeneration)
        {
            this.pool.addResource(type as Resources, restrictedGeneration[type]);
        }
    }

    /**
     * Runs the simulation for a specific amount of time. Designed for individual frames, not multi-second jumps.
     */
    public update(elapsed: number)
    {
        for (let i = 0; i < this.structureList.length; ++i)
        {
            this.structureList[i].update(elapsed);
        }
    }

    public toJSON(): SimulationData
    {
        const s: { [name: string]: StructureData } = {};
        for (let i = 0; i < this.structureList.length; ++i)
        {
            const structure = this.structureList[i];
            s[structure.type] = structure.toJSON();
        }
        return {
            l: Date.now(),
            p: this.pool.toJSON(),
            s
        }
    }
}