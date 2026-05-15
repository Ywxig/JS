// RUINS — config.js
// Все константы и описание тайлов

export const DEBUG = true;

export const BLOCK_SIZE  = 32;
export const MAP_W       = 16;
export const MAP_H       = 12;
export const CANVAS_COLS = 19;   // клеток видно по горизонтали
export const CANVAS_ROWS = 13;   // клеток видно по вертикали

export const TILES = {
    "hero": {
        color: "#2a2a3a",
        type: "player",
        symbolColor: "#66ccff",
        char: "@",
        hp: 100,
        maxHp: 100,
        attack: 20
    },
    "0": {
        color: "#111111",
        type: "wall",
        symbolColor: "#333333",
        char: ""
    },
    "1": {
        color: "#1a1a1a",
        type: "floor",
        symbolColor: "#2a2a2a",
        char: "."
    },
    "e": {
        color: "#3a1a1a",
        type: "enemy",
        symbolColor: "#ff3333",
        char: "☠",
        summonChance: 0.25
    },
    "E": {
        color: "#1a3a1a",
        type: "exit",
        symbolColor: "#33ff33",
        char: "⬇"
    },
    "H": {
        color: "#3a1a3a",
        type: "health",
        symbolColor: "#ff66cc",
        char: "❤",
        summonChance: 0.15
    },
    "c": {
        color: "#1a1a1a",
        type: "chest",
        symbolColor: "#ffff00",
        char: "💰",
        maxValue: 50,
        minValue: 10,
        summonChance: 0.01
    }
};

export const WALKABLE = new Set(["1", "e", "E", "H", "c"]);

export const ENEMY_BASE_DMG = 15;
