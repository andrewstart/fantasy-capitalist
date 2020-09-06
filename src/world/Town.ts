import { Container, Spritesheet } from "pixi.js";
import { Simulation } from "../management/Simulation";
import { Herbalist } from "./Herbalist";
import { PotionMaker } from "./PotionMaker";
import { AdventurerGuild } from "./AdventurerGuild";
import { Market } from "./Market";
import { BaseBuilding } from "./BaseBuilding";
import { StructureType } from "../management/Config";

export class Town extends Container
{
    private simulation: Simulation;
    private buildings: BaseBuilding[];

    constructor(gameAtlas: Spritesheet, simulation: Simulation)
    {
        super();

        this.simulation = simulation;
        this.buildings = [];

        const herbalist = new Herbalist(gameAtlas);
        herbalist.structure = simulation.structures.get(StructureType.Herbalist)!;
        herbalist.position.set(20, 50);
        this.buildings.push(herbalist);
        this.addChild(herbalist);
        herbalist.on('pointertap', () => this.emit('structure-tap', herbalist.structure));

        const brewer = new PotionMaker(gameAtlas);
        brewer.structure = simulation.structures.get(StructureType.PotionBrewer)!;
        brewer.position.set(50, 300);
        this.buildings.push(brewer);
        this.addChild(brewer);
        brewer.on('pointertap', () => this.emit('structure-tap', brewer.structure));

        const guildHall = new AdventurerGuild(gameAtlas);
        guildHall.structure = simulation.structures.get(StructureType.AdventurerGuild)!;
        guildHall.position.set(300, 280);
        this.buildings.push(guildHall);
        this.addChild(guildHall);
        guildHall.on('pointertap', () => this.emit('structure-tap', guildHall.structure));

        const market = new Market(gameAtlas);
        market.structure = simulation.structures.get(StructureType.Market)!;
        market.position.set(250, 70);
        this.buildings.push(market);
        this.addChild(market);
        market.on('pointertap', () => this.emit('structure-tap', market.structure));
    }

    /**
     * @param elapsed Elapsed time from previous update in seconds
     */
    public update(elapsed:number)
    {
        for (let i = 0; i < this.buildings.length; ++i)
        {
            this.buildings[i].update(elapsed);
        }
    }
}