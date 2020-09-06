import { Container, BitmapFont, TextStyle } from "pixi.js";
import { loadSpritesheet } from './utils/load';
import { Town } from './world/Town';
import { StructureDialog } from './interface/StructureDialog';
import { Header } from './interface/Header';
import { Simulation, SimulationData } from "./management/Simulation";
import { DefaultSave } from './management/DefaultSave';

const SAVE_KEY = 'saveData';

export class Game
{
    private stage: Container;
    private header!: Header;
    private dialog!: StructureDialog;
    private town!: Town;
    private simulation: Simulation;
    private lastSave: number;
    /**
     * A quick search implies that 'visibilitychange' will fire right after 'beforeunload', so just to be safe
     * setting that here to make sure we don't try to catch up when the window closes.
     */
    private unloading: boolean;

    constructor(stage: Container)
    {
        this.stage = stage;
        this.simulation = new Simulation();
        this.lastSave = 0;
        this.unloading = false;

        // on first creation, load any save data and catch up with un-played time
        const saveString = localStorage.getItem(SAVE_KEY);
        let saveData: SimulationData|null = null;
        if (saveString)
        {
            try
            {
                saveData = JSON.parse(saveString);
            }
            catch (e)
            {
                console.error('Unable to parse save', e);
            }
        }
        if (saveData)
        {
            this.simulation.load(saveData);
            this.simulation.catchUp(saveData.l);
        }
        else
        {
            this.simulation.load(DefaultSave);
        }

        // when window is put in the background, pause game or resume it
        document.addEventListener('visibilitychange', () => {
            if (this.unloading) return;
            if (document.hidden)
            {
                // do a save in case the window is closed later - we want to make sure we
                // save the last time of now, rather than when the window is later closed.
                const data = this.simulation.toJSON();
                this.lastSave = data.l;
                localStorage.setItem(SAVE_KEY, JSON.stringify(data));
            }
            else
            {
                // using the simulation data in memory, catch up (no need to load from localStorage)
                this.simulation.catchUp(this.lastSave);
            }
        }, false);

        // before window is closed do a save
        window.addEventListener('beforeunload', () => {
            this.unloading = true;
            if (!document.hidden)
            {
                const data = this.simulation.toJSON();
                localStorage.setItem(SAVE_KEY, JSON.stringify(data));
            }
        });
    }

    public async load()
    {
        const [gameAtlas, uiAtlas] = await Promise.all([loadSpritesheet('GameWorld'), loadSpritesheet('UI')]);

        BitmapFont.from('DialogFont',
            new TextStyle({ fontFamily: 'sans-serif', fontSize: 30, fill: '#ffffff' }),
            {
                chars: [['A', 'Z'], ['a', 'z'], ['0', '9'], '\': ' as any]
            }
        );

        this.town = new Town(gameAtlas, this.simulation);
        this.stage.addChild(this.town);

        this.header = new Header(this.simulation, uiAtlas);
        this.stage.addChild(this.header);

        this.dialog = new StructureDialog(uiAtlas, this.simulation);
        this.dialog.position.set(20, 60);
        this.stage.addChild(this.dialog);

        this.town.on('structure-tap', this.dialog.open, this.dialog);
    }

    /**
     * @param elapsed Time elapsed since the last update, in seconds
     */
    public update(elapsed: number)
    {
        this.simulation.update(elapsed);
        this.header?.update();
        this.dialog?.update();
        this.town?.update(elapsed);
    }
}