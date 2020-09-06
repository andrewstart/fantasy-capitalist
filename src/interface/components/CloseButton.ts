import { Button } from './Button';
import { Spritesheet, Sprite } from 'pixi.js';

export class CloseButton extends Button
{
    constructor(uiAtlas: Spritesheet)
    {
        super(new Sprite(uiAtlas.textures.buttonRound_grey));

        const icon = new Sprite(uiAtlas.textures.iconCross_blue);
        icon.anchor.set(0.5);
        icon.position.set(this.base.width / 2 + 1, this.base.height / 2 - 1);
        this.addChild(icon);
    }
}