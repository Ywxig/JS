// RUINS — movement.js
// Логика движения игрока, боя, подбора предметов и перехода на следующий этаж.

import { TILES, WALKABLE } from "./config.js";
import { state }            from "./state.js";
import { randInt, showEvent, log } from "./utils.js";
import { render }           from "./render.js";
import { loadPage, startGame } from "./pages.js";

export function move(dir) {
    let nx = state.playerPos.x;
    let ny = state.playerPos.y;

    if (dir === "up")    ny--;
    if (dir === "down")  ny++;
    if (dir === "left")  nx--;
    if (dir === "right") nx++;

    // Граница карты
    if (nx < 0 || ny < 0 || ny >= state.map.length || nx >= state.map[0].length) return;

    const tile = state.map[ny][nx];
    if (!WALKABLE.has(tile)) return;

    // --- Бой ---
    if (tile === "e") {
        const dmg = Math.floor(state.enemyDmg * (state.floorNum * 0.2) * 1.1);
        state.player.hp -= dmg;
        state.map[ny][nx] = "1";
        showEvent(`⚔ Ты атакуешь врага! Получаешь ${dmg} урона. HP: ${state.player.hp}`);
        log(`Бой: игрок −${dmg} HP → ${state.player.hp}`);

        if (state.player.hp <= 0) { loadPage("death"); return; }

        state.playerPos.x = nx;
        state.playerPos.y = ny;
        render();
        return;
    }

    // --- Сундук ---
    if (tile === "c") {
        const gold = randInt(TILES["c"].minValue, TILES["c"].maxValue);
        state.playerBank += gold;
        state.map[ny][nx] = "1";
        showEvent(`💰 Ты открываешь сундук и находишь ${gold} золота!`);
        log(`Сундук: +${gold} золота`);

        state.playerPos.x = nx;
        state.playerPos.y = ny;
        render();
        return;
    }

    // --- Зелье здоровья ---
    if (tile === "H") {
        if (state.player.hp === state.player.maxHp) {
            state.player.hp -= 10;
            showEvent(`⚠️ Ты уже полон здоровья! Зелье наносит тебе 10 урона. HP: ${state.player.hp}`);
            log(`Хилка: −10 HP → ${state.player.hp}`);
            if (state.player.hp <= 0) { loadPage("death"); return; }
        } else {
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + 30);
            showEvent(`✨ Ты подбираешь зелье и восстанавливаешь 30 HP! HP: ${state.player.hp}`);
            log(`Хилка: +30 HP → ${state.player.hp}`);
        }
        state.map[ny][nx] = "1";

        state.playerPos.x = nx;
        state.playerPos.y = ny;
        render();
        return;
    }

    // --- Выход ---
    if (tile === "E") {
        state.floorNum++;
        const lastFloor = parseInt(localStorage.getItem("lastFloor") || "1", 10);
        if (state.floorNum > lastFloor) {
            localStorage.setItem("lastFloor", state.floorNum);
        }
        showEvent(`✦ Ты спускаешься на этаж ${state.floorNum}…`);
        startGame();
        return;
    }

    // --- Обычный шаг ---
    state.playerPos.x = nx;
    state.playerPos.y = ny;
    render();
}

export function setupKeyboard() {
    document.onkeydown = (e) => {
        const dirs = {
            ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
            w: "up", s: "down", a: "left", d: "right"
        };
        if (dirs[e.key]) { e.preventDefault(); move(dirs[e.key]); }
    };
}
