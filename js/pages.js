// RUINS — pages.js
// Маршрутизация страниц, HTML-шаблоны, инициализация уровня.

import { MAP_W, MAP_H, CANVAS_COLS, CANVAS_ROWS, BLOCK_SIZE } from "./config.js";
import { state, resetPlayer } from "./state.js";
import { log }                from "./utils.js";
import { generateDungeon }    from "./dungeon.js";
import { render }             from "./render.js";
import { setupKeyboard }      from "./movement.js";

export function loadPage(page) {
    const content = document.getElementById("content");
    log(`[page: ${page}]`);

    switch (page) {
        case "home":
            content.innerHTML = pagHome();
            break;

        case "game":
            content.innerHTML = pageGame();
            setupKeyboard();
            startGame();
            break;

        case "death":
            content.innerHTML = pageDeath();
            document.onkeydown = null;
            break;

        default:
            content.innerHTML = `<h2>Страница не найдена</h2>`;
    }
}

export function startGame() {
    state.map = generateDungeon(MAP_W, MAP_H);
    state.playerPos = { x: 1, y: 1 };
    state.map[1][1] = "1";   // стартовая клетка всегда пол
    render();
}

// --- HTML-шаблоны ---

function pagHome() {
    return `
    <div class="main-menu">
        <h1>RUINS</h1>
        <p>⚔ dungeon crawler ⚔</p>
        <button class="menu-btn" onclick="window.__ruins.loadPage('game')">▶ Новая игра</button>
    </div>`;
}

function pageGame() {
    return `
    <div id="game-wrapper">
        <div id="hud">
            <div id="hud-left">
                <span class="hud-label">HP</span>
                <div id="hp-bar-wrap"><div id="hp-bar" style="width:100%"></div></div>
                <span id="hp-text">100 / 100</span>
                <span id="hero-bank">$: 0</span>
            </div>
            <span id="floor-text">Этаж 1</span>
        </div>
        <canvas id="canvas"
            width="${CANVAS_COLS * BLOCK_SIZE}"
            height="${CANVAS_ROWS * BLOCK_SIZE}">
        </canvas>
        <div id="event-log"></div>
    </div>`;
}

function pageDeath() {
    return `
    <div id="death-screen" style="display:block">
        <h1>ТЫ ПОГИБ</h1>
        <p>Этаж ${state.floorNum} · Здоровье исчерпано</p>
        <button class="menu-btn" onclick="window.__ruins.restart()">
            ↺ Начать заново
        </button>
    </div>`;
}
