import { Container, Spritesheet, NineSlicePlane } from "pixi.js";
import { Simulation } from '../management/Simulation';
import { ResourceDisplay } from "./components/ResourceDisplay";
import { Resources } from "../management/ResourcePool";

const DISPLAYED = [Resources.Gold, Resources.Herbs, Resources.Potions, Resources.Treasure];

export class Header extends Container
{
    private bg: NineSlicePlane;
    private resources: Map<Resources, ResourceDisplay>;
    private simulation: Simulation;

    constructor(simulation: Simulation, atlas: Spritesheet)
    {
        super();

        this.simulation = simulation;
        this.resources = new Map();

        this.bg = new NineSlicePlane(atlas.textures.panel_brown, 55, 26, 9, 33);
        this.addChild(this.bg);
        this.bg.width = 400;
        this.bg.height = 40;

        let nextX = 5;
        let y = 5;
        for (let i = 0; i < DISPLAYED.length; ++i)
        {
            const display = new ResourceDisplay(atlas);
            display.setType(atlas, DISPLAYED[i]);
            this.resources.set(DISPLAYED[i], display);
            display.position.set(nextX, y);
            nextX += display.width + 5;
            this.addChild(display);
        }
    }

    public update()
    {
        for (let i = 0; i < DISPLAYED.length; ++i)
        {
            this.resources.get(DISPLAYED[i])!.count = this.simulation.pool.getResourceCount(DISPLAYED[i]);
        }
    }
}