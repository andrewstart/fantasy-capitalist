import { Spritesheet } from 'pixi.js';
import { BaseBuilding } from './BaseBuilding';

export class AdventurerGuild extends BaseBuilding
{
    constructor(spritesheet: Spritesheet)
    {
        super(spritesheet.textures.guildHall);
    }
}