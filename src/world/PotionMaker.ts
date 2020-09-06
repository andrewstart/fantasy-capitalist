import { Sprite, Spritesheet } from 'pixi.js';
import { BaseBuilding } from './BaseBuilding';

// radians/second
const ROTATION_SPEED = Math.PI / 4;

export class PotionMaker extends BaseBuilding
{
    private blade: Sprite;

    constructor(spritesheet: Spritesheet)
    {
        super(spritesheet.textures.potionMaker);

        this.blade = new Sprite(spritesheet.textures.windmillBlade);
        this.blade.anchor.set(0.5);
        this.blade.position.set(22, 33);
        this.addChild(this.blade);
    }

    public update(elapsed:number)
    {
        if (this.structure?.isRunning)
        {
            this.blade.rotation -= ROTATION_SPEED * elapsed;
        }
    }
}