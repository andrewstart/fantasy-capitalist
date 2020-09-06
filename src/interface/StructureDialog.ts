import { Container, NineSlicePlane, Spritesheet, BitmapText } from "pixi.js";
import { Structure } from "../management/Structure";
import { CloseButton } from './components/CloseButton';
import { StructureRun } from './components/StructureRun';
import { PurchaseStructure } from './components/PurchaseStructure';
import { Simulation } from "../management/Simulation";
import { WorkerManagement } from './components/WorkerManagement';

export class StructureDialog extends Container
{
    private atlas: Spritesheet;
    private simulation: Simulation;
    private bg: NineSlicePlane;
    private closeButton: CloseButton;
    private purchase: PurchaseStructure;
    private workers: WorkerManagement;
    private run: StructureRun;
    private title: BitmapText;
    private current: Structure|null;

    constructor(uiAtlas: Spritesheet, simulation: Simulation)
    {
        super();

        this.atlas = uiAtlas;
        this.simulation = simulation;
        this.current = null;

        this.bg = new NineSlicePlane(uiAtlas.textures.panel_brown, 55, 26, 9, 33);
        this.addChild(this.bg);
        this.bg.width = 360;
        this.bg.height = 250;
        // block clicks
        this.bg.interactive = true;

        this.closeButton = new CloseButton(uiAtlas);
        this.closeButton.position.set(this.bg.width - this.closeButton.width, 0);
        this.addChild(this.closeButton);
        this.closeButton.on('pointertap', this.close, this);

        this.title = new BitmapText('', { fontName: 'DialogFont', tint: 0xd2b290, fontSize: 30});
        this.title.position.set(20, 10);
        this.addChild(this.title);

        /*    PURCHASE UI   */
        this.purchase = new PurchaseStructure(uiAtlas);
        this.purchase.position.set(20, 60);
        this.addChild(this.purchase);

        /*    OWNED UI      */
        this.run = new StructureRun(uiAtlas);
        this.run.position.set(20, 50);
        this.addChild(this.run);

        /**    WORKERS    **/
        this.workers = new WorkerManagement(uiAtlas, simulation);
        this.workers.position.set(20, 110);
        this.addChild(this.workers);

        this.visible = false;
    }

    public open(structure: Structure)
    {
        this.current = structure;
        this.workers.setCurrent(structure);
        this.purchase.setCurrent(structure);
        this.run.setCurrent(structure);
        this.visible = true;
        this.resize();

        this.title.text = structure.name;
    }

    private resize()
    {
        this.workers.y = this.run.y + this.run.height + 5;
        this.bg.height = this.workers.y + this.workers.displayHeight + 5;
    }

    private close()
    {
        this.visible = false;
        this.current = null;
    }

    public update()
    {
        if (!this.current || !this.visible) return;

        // if newly unlocked, resize
        if (this.current.isUnlocked && this.purchase.visible)
        {
            this.resize();
        }
        this.purchase.visible = !this.current.isUnlocked;
        this.run.visible = this.workers.visible = this.current.isUnlocked;
        if (this.run.visible)
        {
            this.run.update();
        }
        if (this.workers.visible)
        {
            this.workers.update();
        }
        if (this.purchase.visible)
        {
            this.purchase.update();
        }
    }
}