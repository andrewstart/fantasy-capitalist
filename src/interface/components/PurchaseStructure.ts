import { Container, BitmapText, Spritesheet, NineSlicePlane } from "pixi.js";
import { Button, BlueButton } from "./Button";
import { Structure } from "../../management/Structure";
import { Simulation } from "../../management/Simulation";

class UnlockButton extends BlueButton
{
    constructor(uiAtlas: Spritesheet)
    {
        let base = new NineSlicePlane(uiAtlas.textures.buttonLong_blue)
        base.width = 150;
        super(base, uiAtlas);

        const label = new BitmapText('Buy Structure', { fontName: 'DialogFont', tint: 0xd3d8e9, fontSize: 20 });
        this.addChild(label);
        label.x = (base.width - label.textWidth) / 2;
        label.y = (base.height - label.textHeight) / 2 - 3;
    }
}

export class PurchaseStructure extends Container
{
    private unlockButton: UnlockButton;
    private costText: BitmapText;
    private current: Structure | null;

    constructor(uiAtlas: Spritesheet)
    {
        super();

        this.current = null;

        this.costText = new BitmapText('', { fontName: 'DialogFont', tint: 0xd2b290, fontSize: 20 });
        this.addChild(this.costText);

        this.unlockButton = new UnlockButton(uiAtlas);
        this.unlockButton.position.set(0, 30);
        this.addChild(this.unlockButton);
        this.unlockButton.on('pointertap', this.unlock, this);
    }

    public setCurrent(structure: Structure)
    {
        this.current = structure;
    }

    private unlock()
    {
        this.current?.unlock();
    }

    public update()
    {
        if (!this.current) return;
        const {current} = this;
        this.costText.text = `Cost: ${current.unlockCost} Gold`;
        this.unlockButton.enabled = current.canUnlock;
    }
}