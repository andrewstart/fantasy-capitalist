import { Container, BitmapText, Spritesheet, NineSlicePlane, Sprite } from "pixi.js";
import { Structure, ProductionLine } from "../../management/Structure";
import { Bar } from "./Bar";
import { ResourceDisplay } from "./ResourceDisplay";
import { Button, BlueButton } from "./Button";
import { Resources } from "../../management/ResourcePool";

class RunButton extends BlueButton
{
    constructor(uiAtlas: Spritesheet)
    {
        let base = new NineSlicePlane(uiAtlas.textures.buttonLong_blue)
        base.width = 50;
        super(base, uiAtlas);

        const label = new BitmapText('GO', { fontName: 'DialogFont', tint: 0xd3d8e9, fontSize: 20 });
        this.addChild(label);
        label.x = (base.width - label.textWidth) / 2;
        label.y = (base.height - label.textHeight) / 2 - 3;
    }
}

class ProductionDisplay extends Container
{
    private current: ProductionLine|null;
    private atlas: Spritesheet;
    private input: ResourceDisplay;
    private arrow: Sprite;
    private output: ResourceDisplay;

    constructor(uiAtlas: Spritesheet)
    {
        super();

        this.current = null;
        this.atlas = uiAtlas;

        this.input = new ResourceDisplay(uiAtlas);
        this.input.position.set(0, 0);
        this.addChild(this.input);

        this.arrow = new Sprite(uiAtlas.textures.arrowBeige_right);
        this.arrow.position.set(95, 5);
        this.addChild(this.arrow);

        this.output = new ResourceDisplay(uiAtlas);
        this.output.position.set(120, 0);
        this.addChild(this.output);
    }

    public setCurrent(structure: ProductionLine)
    {
        this.current = structure;
        this.output.setType(this.atlas, structure.outputType);
        if (structure.inputType === Resources.None)
        {
            this.input.visible = false;
        }
        else
        {
            this.input.setType(this.atlas, structure.inputType);
            this.input.visible = true;
        }
    }

    public update()
    {
        if (!this.current) return;

        this.output.count = this.current.outputCount;
        this.input.count = this.current.inputCount;
    }
}

export class StructureRun extends Container
{
    private current: Structure|null;
    private runButton: RunButton;
    private timerBar: Bar;
    private timerText: BitmapText;
    private production: ProductionDisplay[];

    constructor(uiAtlas: Spritesheet)
    {
        super();

        this.current = null;

        this.runButton = new RunButton(uiAtlas);
        this.runButton.position.set(0, 0);
        this.addChild(this.runButton);
        this.runButton.on('pointertap', this.run, this);

        this.timerBar = new Bar(uiAtlas, 200);
        this.addChild(this.timerBar);
        this.timerBar.position.set(60, 3);

        this.timerText = new BitmapText('', { fontName: 'DialogFont', tint: 0xd2b290, fontSize: 20 });
        this.timerText.position.set(270, 0);
        this.addChild(this.timerText);

        this.production = [];
        // handle a maximum of 3 lines for now
        for (let i = 0; i < 3; ++i)
        {
            const p = new ProductionDisplay(uiAtlas);
            this.production.push(p);
            this.addChild(p);
            p.position.set(60, this.timerText.textHeight + 5 + p.height * i);
        }
    }

    public setCurrent(structure: Structure)
    {
        this.current = structure;
        for (let i = 0; i < structure.production.length; ++i)
        {
            this.production[i].setCurrent(structure.production[i]);
            this.production[i].visible = true;
        }
        for (let i = structure.production.length; i < this.production.length; ++i)
        {
            this.production[i].visible = false;
        }
    }

    private run()
    {
        if (!(this.current?.isUnlocked)) return;

        this.current.start();
    }

    public update()
    {
        if (!this.current) return;

        const {current} = this;
        this.runButton.enabled = current.canRun;
        for (let i = 0; i < this.production.length; ++i)
        {
            if (this.production[i].visible)
            {
                this.production[i].update();
            }
        }
        this.timerBar.setFillPercent(current.percentComplete);
        const secsRemaining = current.timeRemaining;
        this.timerText.text = `${Math.floor(secsRemaining / 60).toString().padStart(2, '0')}:${Math.floor(secsRemaining % 60).toString().padStart(2, '0')}`;
    }
}