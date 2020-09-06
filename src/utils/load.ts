import { Texture, Spritesheet } from "pixi.js";

export function loadTexture(url:string)
{
    return Texture.fromURL(url);
}

export async function loadSpritesheet(baseUrl:string): Promise<Spritesheet>
{
    const jsonUrl = baseUrl + '.json';
    const imageUrl = baseUrl + '.png';
    const [json, texture] = await Promise.all([
        fetch(jsonUrl).then(r => r.json()),
        loadTexture(imageUrl)
    ]);
    const sheet = new Spritesheet(texture, json);
    return new Promise(resolve => {
        sheet.parse(() => resolve(sheet));
    });
}