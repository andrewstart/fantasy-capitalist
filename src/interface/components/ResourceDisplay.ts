import { Container, Sprite, BitmapText, Texture, Spritesheet, NineSlicePlane } from "pixi.js";
import { Resources } from "../../management/ResourcePool";

export class ResourceDisplay extends Container
{
    private bg: NineSlicePlane;
    private icon: Sprite;
    private label: BitmapText;

    constructor(atlas: Spritesheet)
    {
        super();

        this.bg = new NineSlicePlane(atlas.textures.panelInset_beige, 18, 23, 11, 29);
        this.bg.width = 93;
        this.bg.height = 30;
        this.addChild(this.bg);

        this.icon = new Sprite();
        this.icon.anchor.set(0.5);
        this.icon.position.set(20, this.bg.height / 2);
        this.addChild(this.icon);

        this.label = new BitmapText('', { fontName: 'DialogFont', tint: 0x575246, fontSize: 16 });
        this.label.position.set(this.bg.width - 5, 5);
        this.addChild(this.label);
    }

    public setType(atlas: Spritesheet, type: Resources)
    {
        this.icon.texture = this.getIcon(atlas, type);
        this.icon.height = 25;
        this.icon.scale.x = this.icon.scale.y;
    }

    public set count(count: number)
    {
        this.label.text = String(count);
        this.label.pivot.x = this.label.textWidth;
    }

    private getIcon(atlas: Spritesheet, type: Resources)
    {
        switch (type)
        {
            case Resources.Herbs:
                return atlas.textures.resource_herb;
            case Resources.Potions:
                return atlas.textures.resource_potion;
            case Resources.Treasure:
                return atlas.textures.resource_treasure;
            case Resources.Gold:
                return atlas.textures.resource_gold;
            default:
                return null;
        }
    }
}