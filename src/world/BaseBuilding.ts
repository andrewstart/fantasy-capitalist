import { Container, Sprite, Texture, Rectangle } from 'pixi.js';
import { Structure } from '../management/Structure';

export class BaseBuilding extends Container
{
    protected base: Sprite;
    // general reference for use in update()
    public structure: Structure|null;

    constructor(base: Texture)
    {
        super();

        this.structure = null;

        this.base = new Sprite(base);
        this.addChild(this.base);

        this.interactive = true;
        this.cursor = 'pointer';
        this.hitArea = new Rectangle(0, 0, base.width, base.height);
    }

    public update(elapsed: number)
    {
        // to be overridden
    }
}