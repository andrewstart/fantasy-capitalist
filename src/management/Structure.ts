import { Worker, WorkerData } from "./Worker";
import { ResourcePool, Resources } from "./ResourcePool";
import { StructureConfig, ProductionConfig, WorkerSkill } from './Config';

export interface StructureData
{
    /** worker list */
    w: WorkerData[];
    /** if each ProductionLine is running */
    r: boolean[];
    /** running timer, seconds */
    t: number;
    /** is unlocked */
    u: boolean;
    /** is managed */
    m: boolean;
}

export class ProductionLine
{
    private config: ProductionConfig;
    /** Cached calculated value since it hits every worker */
    public inputCount: number;
    /** Cached calculated value since it hits every worker */
    public outputCount: number;
    /** If this production line is in use (input was satisfied when structure run started) */
    public running: boolean;

    constructor(config: ProductionConfig)
    {
        this.config = config;
        this.inputCount = 0;
        this.outputCount = 0;
        this.running = false;
    }

    public get inputType() { return this.config.input; };
    public get outputType() { return this.config.output; };

    protected getWorkerOutput(w: Worker): number
    {
        return this.config.workerBonus.reduce((prev, data) =>
        {
            return prev + (w.hasSkill(data.skill) ? data.flatIncrease : 0);
        }, this.config.baseOutputPerWorker);
    }

    public calculate(workers: Worker[])
    {
        this.inputCount = this.outputCount = 0;
        for (let i = 0; i < workers.length; ++i)
        {
            const w = workers[i];
            this.inputCount += this.config.inputPerWorker;
            this.outputCount += this.getWorkerOutput(w);
        }
    }

    public addWorker(w: Worker)
    {
        this.inputCount += this.config.inputPerWorker;
        this.outputCount += this.getWorkerOutput(w);
    }

    public removeWorker(w: Worker)
    {
        this.inputCount -= this.config.inputPerWorker;
        this.outputCount -= this.getWorkerOutput(w);
    }
}

export class Structure
{
    protected pool: ResourcePool;
    protected _workers: Worker[];
    protected running: boolean;
    protected unlocked: boolean;
    protected managed: boolean;
    protected timer: number;
    protected config: StructureConfig;
    protected _production: ProductionLine[];

    constructor(config: StructureConfig, pool: ResourcePool)
    {
        this.pool = pool;
        this.config = config;
        this._production = config.production.map(p => new ProductionLine(p));
        this._workers = [];
        this.running = false;
        this.unlocked = config.unlockCost === 0;
        this.managed = false;
        this.timer = 0;
    }

    public get type() { return this.config.type; }

    public get name() { return this.config.name; }

    public get isUnlocked() { return this.unlocked; }

    public get canUnlock() { return this.pool.getResourceCount(Resources.Gold) >= this.config.unlockCost; }

    public get unlockCost() { return this.config.unlockCost; }

    public get managerCost() { return this.config.managerCost; }

    public get hasManager() { return this.managed; }

    public get workers() { return this._workers; }

    public get production() { return this._production; }

    public get canRun()
    {
        if (this.running || !this.unlocked || this._workers.length === 0) return false;
        for (let i = 0; i < this._production.length; ++i)
        {
            if (this.pool.getResourceCount(this._production[i].inputType) >= this._production[i].inputCount)
            {
                return true;
            }
        }
        return false;
    }

    public get isRunning() { return this.running; }

    /**
     * Time remaining in seconds
     */
    public get timeRemaining() { return this.running ? this.timer : this.config.baseWorkTime; }

    /**
     * Time it takes to do one production run, in seconds
     */
    public get runTime() { return this.config.baseWorkTime; }

    public get percentComplete() { return this.running ? (this.config.baseWorkTime - this.timer) / this.config.baseWorkTime : 0; }

    /**
     * The skill available for workers to learn upon leveling.
     */
    public get skillAvailable() { return this.config.skillAvailable; }

    /**
     * Load saved data.
     */
    public load(data: StructureData)
    {
        this._workers.length = data.w.length;
        for (let i = 0; i < data.w.length; ++i)
        {
            const w = this._workers[i] = new Worker(this, data.w[i]);
        }
        for (let i = 0; i < this._production.length; ++i)
        {
            this._production[i].calculate(this._workers);
        }
        for (let i = 0; i < data.r.length; ++i)
        {
            if (data.r[i])
            {
                this.running = true;
                this._production[i].running = true;
            }
        }
        this.timer = data.t;
        this.unlocked = data.u;
        this.managed = data.m;
    }

    /**
     * @param percent Percent of run time to set the timer to. If 0, running will be set to false.
     */
    public setTimeRemaining(percent: number)
    {
        this.running = percent > 0;
        this.timer = percent * this.config.baseWorkTime;
    }

    /**
     * Recalculates all cached input/output values. The simplest way to handle workers leveling.
     */
    public recalculateProduction()
    {
        for (let i = 0; i < this._production.length; ++i)
        {
            this._production[i].calculate(this._workers);
        }
    }

    public hireManager()
    {
        this.managed = true;
    }

    /**
     * Adds a worker to the structure
     */
    public addWorker(worker: Worker)
    {
        this._workers.push(worker);
        for (let i = 0; i < this._production.length; ++i)
        {
            this._production[i].addWorker(worker);
        }
    }

    /**
     * Removes a worker from the structure
     */
    public removeWorker(worker: Worker)
    {
        const index = this._workers.indexOf(worker);
        if (index > -1)
        {
            this._workers.splice(index, 1);
            for (let i = 0; i < this._production.length; ++i)
            {
                this._production[i].removeWorker(worker);
            }
            return true;
        }
        return false;
    }

    /**
     * Unlocks the structure, if the resource pool contains sufficient gold.
     */
    public unlock()
    {
        if (this.pool.removeResource(Resources.Gold, this.config.unlockCost))
        {
            this.unlocked = true;
        }
    }

    /**
     * Starts a run (all allowed production lines)
     */
    public start()
    {
        if (!this.canRun) return;

        for (let i = 0; i < this._production.length; ++i)
        {
            if (this.pool.removeResource(this._production[i].inputType, this._production[i].inputCount))
            {
                this._production[i].running = true;
            }
            else
            {
                this._production[i].running = false;
            }
        }
        this.running = true;
        this.timer = this.config.baseWorkTime;
    }

    /**
     * Runs the simulation for a specific amount of time. Designed for individual frames, not multi-second jumps.
     * Values of elapsed greater than the structure's run time will *not* be handled as you planned.
     * @param elapsed Elapsed time in seconds.
     **/
    public update(elapsed: number)
    {
        if (this.running)
        {
            this.timer -= elapsed;
            if (this.timer <= 0)
            {
                this.completeRun();
            }
        }
        else
        {
            if (this.managed && this.canRun)
            {
                this.start();
            }
        }
    }

    /**
     * Called when a run completes. Starts the next run if allowed.
     */
    private completeRun()
    {
        this.running = false;
        for (let i = 0; i < this._production.length; ++i)
        {
            const p = this._production[i];
            if (p.running)
            {
                this.pool.addResource(p.outputType, p.outputCount);
                p.running = false;
            }
        }
        for (let i = 0; i < this._workers.length; ++i)
        {
            this._workers[i].addExperience(this.config.expPerRun);
        }
        if (this.managed)
        {
            const overshoot = this.timer;
            this.start();
            // not that it really matters, but take into account the tiny amount of timer overshoot
            // that will always occur
            this.timer += overshoot;
        }
    }

    public toJSON(): StructureData
    {
        return {
            w: this._workers.map(w => w.toJSON()),
            r: this._production.map(p => p.running),
            t: this.timer,
            u: this.unlocked,
            m: this.managed,
        };
    }
}