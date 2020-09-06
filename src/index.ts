import './styles.css';
import { Application } from 'pixi.js';
import { Game } from './Game';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const app = new Application({
    view: canvas,
    resizeTo: document.body,
    autoStart: true,
});

const game = new Game(app.stage);
game.load();

let lastTime = performance.now();
app.ticker.add(() => {
    const now = performance.now();
    // convert time elapsed to seconds
    const elapsed = (now - lastTime) / 1000;
    lastTime = now;
    game.update(elapsed);
});