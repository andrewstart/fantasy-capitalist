import type { Structure } from './Structure';
import { Config, WorkerSkill } from './Config';

/**
 * JSON data for saving worker data.
 */
export interface WorkerData
{
    /** Level */
    l: number;
    /** Experience */
    e: number;
    /** Skills, stored as a single number for smaller size */
    s: number;
}

export const NEW_WORKER: WorkerData = {
    l: 0,
    e: 0,
    s: 0,
};

export class Worker
{
    public job: Structure;
    public level: number;
    private _experience: number;
    private skills: number;

    constructor(job: Structure, data: WorkerData = NEW_WORKER)
    {
        this.job = job;
        this.level = data.l;
        this._experience = data.e;
        this.skills = data.s;
    }

    public hasSkill(s: WorkerSkill)
    {
        return this.skills & s;
    }

    public hasAllSkills(s: number)
    {
        return (this.skills & s) === s;
    }

    public get experience() { return this._experience; }

    public get expNeededForLevel() { return Config.Worker.LevelingExp[this.level]; }

    public get canLevel() { return this._experience >= Config.Worker.LevelingExp[this.level]; }

    public addExperience(exp: number)
    {
        this._experience += exp;
        // cap experience, to require leveling up before continuing to progress
        if (this._experience >= Config.Worker.LevelingExp[this.level])
        {
            this._experience = Config.Worker.LevelingExp[this.level];
        }
    }

    public resetExperience()
    {
        this._experience = 0;
    }

    public levelUp(newSkill: WorkerSkill)
    {
        this._experience = 0;
        this.level++;
        this.skills |= newSkill;
    }

    public toJSON(): WorkerData
    {
        return {
            l: this.level,
            e: this._experience,
            s: this.skills,
        };
    }
}