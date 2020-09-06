export enum Resources
{
    None = 'n',
    Gold = 'g',
    Herbs = 'h',
    Potions = 'p',
    Treasure = 't',
}
const ALL_RESOURCES = [Resources.Gold, Resources.Herbs, Resources.Potions, Resources.Treasure];

export class ResourcePool
{
    private pool: { [name: string]: number };

    constructor()
    {
        this.pool = Object.create(null);
        for (const r of ALL_RESOURCES)
        {
            this.pool[r] = 0;
        }
    }

    public clonePool()
    {
        return Object.assign({}, this.pool);
    }

    public getResourceCount(r: Resources)
    {
        return this.pool[r] || 0;
    }

    public addResource(r: Resources, count: number)
    {
        if (r === Resources.None) return;
        this.pool[r] += count;
    }

    public removeResource(r: Resources, count: number)
    {
        if (r === Resources.None) return true;
        if (this.pool[r] >= count)
        {
            this.pool[r] -= count;
            return true;
        }
        return false;
    }

    public load(data: { [name: string]: number })
    {
        this.pool = Object.create(null);
        for (const r of ALL_RESOURCES)
        {
            this.pool[r] = data[r] || 0;
        }
    }

    public toJSON(): { [name: string]: number }
    {
        const out: {[name:string]: number} = {};
        for (const r of ALL_RESOURCES)
        {
            out[r] = this.pool[r];
        }
        return out;
    }
}