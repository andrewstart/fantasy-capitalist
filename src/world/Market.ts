import { Spritesheet } from 'pixi.js';
import { BaseBuilding } from './BaseBuilding';

export class Market extends BaseBuilding
{
    constructor(spritesheet: Spritesheet)
    {
        super(spritesheet.textures.market);
    }
}