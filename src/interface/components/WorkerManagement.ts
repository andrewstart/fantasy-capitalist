import { Container, BitmapText, Spritesheet, NineSlicePlane, Sprite } from "pixi.js";
import { Simulation } from "../../management/Simulation";
import { Structure } from "../../management/Structure";
import { Bar } from "./Bar";
import { Worker } from "../../management/Worker";
import { BlueButton } from "./Button";
import { Resources, ResourcePool } from "../../management/ResourcePool";
import { Config } from "../../management/Config";

class LevelButton extends BlueButton
{
    private label: BitmapText;

    constructor(uiAtlas: Spritesheet)
    {
        let base = new NineSlicePlane(uiAtlas.textures.buttonLong_blue)
        base.width = 90;
        base.height = 20;
        super(base, uiAtlas);

        this.label = new BitmapText('Level Up', { fontName: 'DialogFont', tint: 0xd3d8e9, fontSize: 12 });
        this.addChild(this.label);
        this.label.y = (base.height - this.label.textHeight) / 2 - 3;
    }

    public set text(text: string)
    {
        this.label.text = text;
        this.label.x = (this.base.width - this.label.textWidth) / 2;
    }
}

class WorkerDisplay extends Container
{
    private structure: Structure|null;
    private current: Worker|null;
    private pool: ResourcePool;
    private bg: NineSlicePlane;
    private icon: Sprite;
    private expBar: Bar;
    private levelButton: LevelButton;
    private levelLabel: BitmapText;

    constructor(atlas: Spritesheet, pool: ResourcePool)
    {
        super();

        this.current = null;
        this.structure = null;
        this.pool = pool;

        this.bg = new NineSlicePlane(atlas.textures.panelInset_beige, 18, 23, 11, 29);
        this.bg.width = 150;
        this.bg.height = 30;
        this.addChild(this.bg);

        this.icon = new Sprite(atlas.textures.icon_worker);
        this.icon.height = 20;
        this.icon.scale.x = this.icon.scale.y;
        this.icon.anchor.set(0.5);
        this.icon.position.set(this.icon.width / 2 + 3, this.bg.height / 2);
        this.addChild(this.icon);

        this.levelLabel = new BitmapText('Lvl 0', { fontName: 'DialogFont', tint: 0x575246, fontSize: 16 });
        this.levelLabel.position.set(20, (this.bg.height - this.levelLabel.textHeight) / 2);
        this.addChild(this.levelLabel);

        this.expBar = new Bar(atlas, 50);
        this.expBar.position.set(60, 7);
        this.addChild(this.expBar);

        this.levelButton = new LevelButton(atlas);
        this.levelButton.position.set(60, 7);
        this.addChild(this.levelButton);
        this.levelButton.on('pointertap', this.levelUp, this);
    }

    public setCurrent(w: Worker|null, s: Structure|null)
    {
        this.current = w;
        this.structure = s;
        if (w)
        {
            this.levelLabel.text = `Lvl ${w.level}`;
            this.levelButton.text = `Level Up ${Config.Worker.LevelingCost[w.level]}G`;
            this.update();
        }
    }

    private levelUp()
    {
        if (!this.current?.canLevel) return;

        if (!this.pool.removeResource(Resources.Gold, Config.Worker.LevelingCost[this.current.level])) return;
        this.current.levelUp(this.structure!.skillAvailable);
        this.structure!.recalculateProduction();
        this.levelLabel.text = `Lvl ${this.current.level}`;
    }

    public update()
    {
        if (!this.current) return;

        this.expBar.visible = !this.current.canLevel;
        this.levelButton.visible = this.current.canLevel;
        if (this.current.canLevel)
        {
            this.levelButton.enabled = this.pool.getResourceCount(Resources.Gold) >= Config.Worker.LevelingCost[this.current.level];
        }
        else
        {
            const exp = this.current.experience;
            const nextLevel = this.current.expNeededForLevel;
            this.expBar.setFillPercent(exp / nextLevel);
        }
    }
}

class HireButton extends BlueButton
{
    constructor(uiAtlas: Spritesheet)
    {
        let base = new NineSlicePlane(uiAtlas.textures.buttonLong_blue)
        base.width = 50;
        base.height = 23;
        super(base, uiAtlas);

        const label = new BitmapText('Hire', { fontName: 'DialogFont', tint: 0xd3d8e9, fontSize: 15 });
        this.addChild(label);
        label.x = (base.width - label.textWidth) / 2;
        label.y = (base.height - label.textHeight) / 2 - 3;
    }
}

class HireBlock extends Container
{
    private bg: NineSlicePlane;
    public button: HireButton;
    public cost: BitmapText;

    constructor(atlas: Spritesheet)
    {
        super();

        this.bg = new NineSlicePlane(atlas.textures.panelInset_beige, 18, 23, 11, 29);
        this.bg.width = 150;
        this.bg.height = 30;
        this.addChild(this.bg);

        this.button = new HireButton(atlas);
        this.button.position.set(5, 5);
        this.addChild(this.button);

        this.cost = new BitmapText('', { fontName: 'DialogFont', tint: 0x575246, fontSize: 16 });
        this.cost.position.set(this.bg.width - 5, 5);
        this.addChild(this.cost);
    }

    public setCost(cost: number, enabled: boolean)
    {
        this.button.enabled = enabled;
        this.cost.text = `${cost} Gold`;
        this.cost.pivot.x = this.cost.textWidth;
    }
}

class ManagerButton extends BlueButton
{
    private label: BitmapText;
    constructor(uiAtlas: Spritesheet)
    {
        let base = new NineSlicePlane(uiAtlas.textures.buttonLong_blue)
        base.width = 150;
        base.height = 23;
        super(base, uiAtlas);

        this.label = new BitmapText('Hire Manager', { fontName: 'DialogFont', tint: 0xd3d8e9, fontSize: 15 });
        this.addChild(this.label);
        this.label.x = (base.width - this.label.textWidth) / 2;
        this.label.y = (base.height - this.label.textHeight) / 2 - 3;
    }

    public set text(text: string)
    {
        this.label.text = text;
        this.label.x = (this.base.width - this.label.textWidth) / 2;
    }
}

const POSITIONS = [
    {x: 0, y: 30},
    {x: 0, y: 65},
    {x: 0, y: 100},
    {x: 155, y: 30},
    {x: 155, y: 65},
    {x: 155, y: 100},
];
export class WorkerManagement extends Container
{
    private atlas: Spritesheet;
    private current: Structure|null;
    private simulation: Simulation;
    private hireManager: ManagerButton;
    private workers: WorkerDisplay[];
    private hire: HireBlock;

    constructor(atlas: Spritesheet, simulation: Simulation)
    {
        super();

        this.atlas = atlas;
        this.simulation = simulation;
        this.current = null;

        this.hireManager = new ManagerButton(atlas);
        this.hireManager.position.set(0, 0);
        this.addChild(this.hireManager);
        this.hireManager.on('pointertap', this.onManager, this);

        this.hire = new HireBlock(atlas);
        this.addChild(this.hire);
        this.hire.button.on('pointertap', this.onHire, this);

        this.workers = [];
        for (let i = 0; i < 6; ++i)
        {
            const w = new WorkerDisplay(this.atlas, this.simulation.pool);
            this.addChild(w);
            this.workers[i] = w;
            w.position.copyFrom(POSITIONS[i]);
        }
    }

    /** How much height we want to cover all workers */
    public get displayHeight()
    {
        return this.workers[5].y + this.workers[5].height + 5;
    }

    public setCurrent(structure: Structure)
    {
        this.current = structure;
        for (let i = 0; i < this.current.workers.length; ++i)
        {
            this.workers[i].setCurrent(this.current.workers[i], this.current);
            this.workers[i].visible = true;
        }
        for (let i = this.current.workers.length; i < this.workers.length; ++i)
        {
            this.workers[i].setCurrent(null, null);
            this.workers[i].visible = false;
        }
        this.hireManager.text = `Hire Manager: ${structure.managerCost}G`;
        this.hireManager.visible = !structure.hasManager;
    }

    private onManager()
    {
        if (!this.current) return;

        if (this.simulation.pool.removeResource(Resources.Gold, this.current.managerCost))
        {
            this.current.hireManager();
            this.hireManager.visible = false;
        }
    }

    private onHire()
    {
        if (!this.current) return;

        if (this.simulation.hireWorker(this.current))
        {
            const index = this.current.workers.length - 1;
            const w = this.current.workers[index];
            const display = this.workers[index];
            display.visible = true;
            display.setCurrent(w, this.current);
        }
    }

    public update()
    {
        if (!this.current) return;

        if (this.hireManager.visible)
        {
            this.hireManager.enabled = this.simulation.pool.getResourceCount(Resources.Gold) >= this.current.managerCost;
        }

        for (let i = 0; i < this.current.workers.length; ++i)
        {
            this.workers[i].update();
        }

        this.hire.visible = this.current.workers.length < 6;
        if (this.hire.visible)
        {
            this.hire.position.copyFrom(POSITIONS[this.current.workers.length]);
            const cost = Config.Worker.Cost(this.simulation.workerCount);
            this.hire.setCost(cost, this.simulation.pool.getResourceCount(Resources.Gold) >= cost);
        }
    }
}