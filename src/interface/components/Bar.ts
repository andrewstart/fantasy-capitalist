import { Container, Sprite, Spritesheet } from "pixi.js";

export class Bar extends Container
{
    private bgLeft: Sprite;
    private bgRight: Sprite;
    private bgCenter: Sprite;
    private fillLeft: Sprite;
    private fillRight: Sprite;
    private fillCenter: Sprite;
    private fullWidth: number;

    constructor(uiAtlas: Spritesheet, width: number, height = 18)
    {
        super();

        this.fullWidth = width;

        this.bgLeft = new Sprite(uiAtlas.textures.barBack_horizontalLeft);
        this.addChild(this.bgLeft);

        this.bgRight = new Sprite(uiAtlas.textures.barBack_horizontalRight);
        this.bgRight.x = width - this.bgRight.width;
        this.addChild(this.bgRight);

        this.bgCenter = new Sprite(uiAtlas.textures.barBack_horizontalMid);
        this.bgCenter.x = this.bgLeft.width;
        this.bgCenter.width = width - (this.bgLeft.width + this.bgRight.width);
        this.addChild(this.bgCenter);

        this.fillLeft = new Sprite(uiAtlas.textures.barGreen_horizontalLeft);
        this.addChild(this.fillLeft);

        this.fillRight = new Sprite(uiAtlas.textures.barGreen_horizontalRight);
        this.fillRight.x = width - this.fillRight.width;
        this.addChild(this.fillRight);

        this.fillCenter = new Sprite(uiAtlas.textures.barGreen_horizontalMid);
        this.fillCenter.x = this.fillLeft.width;
        this.fillCenter.width = width - (this.fillLeft.width + this.fillRight.width);
        this.addChild(this.fillCenter);

        this.bgCenter.height = this.bgLeft.height = this.bgRight.height = this.fillLeft.height =
            this.fillRight.height = this.fillCenter.height = height;
    }

    public setFillPercent(percent: number)
    {
        if (percent <= 0)
        {
            this.fillLeft.visible = this.fillRight.visible = this.fillCenter.visible = false;
            return;
        }
        const desiredWidth = this.fullWidth * percent;
        const minUnscaledWidth = this.fillLeft.texture.width + this.fillRight.texture.width;
        if (desiredWidth < minUnscaledWidth)
        {
            const scale = desiredWidth / minUnscaledWidth;
            this.fillLeft.scale.x = this.fillRight.scale.x = scale;
            this.fillRight.position.x = this.fillLeft.width;
            this.fillCenter.visible = false;
            this.fillLeft.visible = this.fillRight.visible = true;
        }
        else
        {
            this.fillLeft.scale.x = this.fillRight.scale.x = 1;
            this.fillLeft.visible = this.fillRight.visible = this.fillCenter.visible = true;
            this.fillCenter.width = desiredWidth - minUnscaledWidth;
            this.fillRight.x = this.fillCenter.x + this.fillCenter.width;
        }
    }
}