import { SimulationData } from './Simulation';
import { ResourcePool } from './ResourcePool';
import { StructureType } from './Config';
import { NEW_WORKER } from './Worker';

export const DefaultSave: SimulationData = {
    p: new ResourcePool().toJSON(),
    s: {
        // BASIC BUILDINGS
        [StructureType.Herbalist]: {
            w: [Object.assign({}, NEW_WORKER)],
            r: false,
            t: 0,
            u: true,
            m: false,
        },
        [StructureType.Market]: {
            w: [Object.assign({}, NEW_WORKER)],
            r: false,
            t: 0,
            u: true,
            m: false,
        },
        // BUILDINGS TO UNLOCK (come with one worker as a baseline)
        [StructureType.PotionBrewer]: {
            w: [Object.assign({}, NEW_WORKER)],
            r: false,
            t: 0,
            u: false,
            m: false,
        },
        [StructureType.AdventurerGuild]: {
            w: [Object.assign({}, NEW_WORKER)],
            r: false,
            t: 0,
            u: false,
            m: false,
        },
    },
    l: 0,
};