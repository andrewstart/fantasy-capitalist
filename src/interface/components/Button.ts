import { Container, Sprite, Texture, Rectangle, NineSlicePlane, Spritesheet } from "pixi.js";

export class Button extends Container
{
    protected base: Sprite|NineSlicePlane;

    constructor(base: Sprite|NineSlicePlane)
    {
        super();

        this.base = base;
        this.addChild(this.base);

        this.cursor = 'pointer';
        this.hitArea = new Rectangle(0, 0, base.width, base.height);
        this.interactive = true;
    }

    public get enabled() { return this.interactive; }
    public set enabled(enable: boolean)
    {
        this.interactive = enable;
    }
}

export class BlueButton extends Button
{
    protected baseTexture: Texture;
    protected downTexture: Texture;

    constructor(base: Sprite|NineSlicePlane, atlas: Spritesheet)
    {
        super(base);

        this.baseTexture = atlas.textures.buttonLong_blue;
        this.downTexture = atlas.textures.buttonLong_blue_pressed;
    }

    public get enabled() { return this.interactive; }
    public set enabled(enable: boolean)
    {
        if (enable === this.interactive) return;
        this.interactive = enable;
        this.base.texture = enable ? this.baseTexture : this.downTexture;
        // TODO: need to offset text label vertically
    }
}