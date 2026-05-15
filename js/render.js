// RUINS — render.js
// Отрисовка карты на canvas и обновление HUD.

import { TILES, BLOCK_SIZE, CANVAS_COLS, CANVAS_ROWS } from "./config.js";
import { state } from "./state.js";

export function render() {
    const canvas = document.getElementById("canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#050508";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Камера центрируется на игроке
    const camOffX = Math.floor(CANVAS_COLS / 2) - state.playerPos.x;
    const camOffY = Math.floor(CANVAS_ROWS / 2) - state.playerPos.y;

    for (let row = 0; row < state.map.length; row++) {
        for (let col = 0; col < state.map[row].length; col++) {
            const tile = state.map[row][col];
            const sx   = (col + camOffX) * BLOCK_SIZE;
            const sy   = (row + camOffY) * BLOCK_SIZE;

            // Отсечение невидимых тайлов
            if (sx < -BLOCK_SIZE || sy < -BLOCK_SIZE ||
                sx > canvas.width  + BLOCK_SIZE ||
                sy > canvas.height + BLOCK_SIZE) continue;

            const info = TILES[tile];
            if (!info) continue;

            ctx.fillStyle = info.color;
            ctx.fillRect(sx, sy, BLOCK_SIZE, BLOCK_SIZE);

            if (info.char) {
                ctx.font         = `${BLOCK_SIZE - 4}px monospace`;
                ctx.textAlign    = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle    = info.symbolColor || "#ffffff";
                ctx.fillText(info.char, sx + BLOCK_SIZE / 2, sy + BLOCK_SIZE / 2);
            }
        }
    }

    // Игрок
    const px = (state.playerPos.x + camOffX) * BLOCK_SIZE;
    const py = (state.playerPos.y + camOffY) * BLOCK_SIZE;
    const hero = TILES["hero"];

    ctx.fillStyle = hero.color;
    ctx.fillRect(px + 2, py + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);

    ctx.fillStyle    = hero.symbolColor || "#cc99ff";
    ctx.font         = `${BLOCK_SIZE - 6}px monospace`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(hero.char, px + BLOCK_SIZE / 2, py + BLOCK_SIZE / 2);

    updateHUD();
}

export function updateHUD() {
    const { player, playerBank, floorNum } = state;
    const lastFloor = localStorage.getItem("lastFloor") || 1;

    const hpBar    = document.getElementById("hp-bar");
    const hpText   = document.getElementById("hp-text");
    const flTxt    = document.getElementById("floor-text");
    const bankEl   = document.getElementById("hero-bank");
    const eventLog = document.getElementById("event-log");

    if (hpBar)    hpBar.style.width   = Math.max(0, (player.hp / player.maxHp) * 100) + "%";
    if (hpText)   hpText.textContent  = `${player.hp} / ${player.maxHp}`;
    if (flTxt)    flTxt.textContent   = `Этаж ${floorNum}/${lastFloor}`;
    if (bankEl)   bankEl.textContent  = `$: ${playerBank}`;
    if (eventLog) eventLog.style.width = `${CANVAS_COLS * BLOCK_SIZE + 4}px`;
}
