// RUINS — dungeon.js
// Процедурная генерация этажа подземелья.

import { TILES } from "./config.js";
import { state }  from "./state.js";
import { randInt } from "./utils.js";

/**
 * Генерирует карту подземелья размером w × h.
 * Возвращает двумерный массив строк-тайлов.
 */
export function generateDungeon(w, h) {
    const steps = Math.round((w * h) / 2.5);
    const grid  = Array.from({ length: h }, () => Array(w).fill("0"));

    let x = 1, y = 1;
    grid[y][x] = "1";

    // Случайное блуждание — пробиваем коридоры
    for (let i = 0; i < steps; i++) {
        const d = randInt(0, 3);
        if      (d === 0 && x + 1 < w - 1) x++;
        else if (d === 1 && x - 1 > 0)     x--;
        else if (d === 2 && y + 1 < h - 1) y++;
        else if (d === 3 && y - 1 > 0)     y--;
        grid[y][x] = "1";
    }

    // Враги — больше на каждом следующем этаже
    const enemyCount = Math.floor((w * h) / 18 + state.floorNum * TILES["e"].summonChance);
    for (let i = 0; i < enemyCount; i++) {
        const ex = randInt(1, w - 2);
        const ey = randInt(1, h - 2);
        if (grid[ey][ex] === "1") grid[ey][ex] = "e";
    }

    // Зелья здоровья
    const healthCount = Math.floor((w * h) / 40 + state.floorNum * TILES["H"].summonChance);
    for (let i = 0; i < healthCount; i++) {
        const hx = randInt(1, w - 2);
        const hy = randInt(1, h - 2);
        if (grid[hy][hx] === "1") grid[hy][hx] = "H";
    }

    // Сундуки
    const chestCount = Math.floor((w * h) / 40 + state.floorNum * TILES["c"].summonChance);
    for (let i = 0; i < chestCount; i++) {
        const cx = randInt(1, w - 2);
        const cy = randInt(1, h - 2);
        if (grid[cy][cx] === "1") grid[cy][cx] = "c";
    }

    // Выход — последняя посещённая клетка
    grid[y][x] = "E";
    // Страховка: если выход каким-то образом не попал в сетку
    if (!grid.some(row => row.includes("E"))) {
        grid[h - 2][w - 2] = "E";
    }

    return grid;
}
