// RUINS — state.js
// Изменяемое состояние игры. Импортируйте объект state везде, где нужны данные.

import { TILES, ENEMY_BASE_DMG } from "./config.js";

export const state = {
    map:        [],
    playerPos:  { x: 0, y: 0 },
    floorNum:   1,
    playerBank: 0,
    player:     { ...TILES["hero"] },   // копия, чтобы не мутировать TILES
    enemyDmg:   ENEMY_BASE_DMG,
};

/** Сбрасывает прогресс игрока (смерть / новая игра). */
export function resetPlayer() {
    state.player     = { ...TILES["hero"] };
    state.playerBank = 0;
    state.floorNum   = 1;
}
