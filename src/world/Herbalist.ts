import { Spritesheet } from 'pixi.js';
import { BaseBuilding } from './BaseBuilding';

export class Herbalist extends BaseBuilding
{
    constructor(spritesheet: Spritesheet)
    {
        super(spritesheet.textures.herbalist);
    }
}