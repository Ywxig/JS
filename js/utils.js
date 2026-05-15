// RUINS — utils.js
// Мелкие утилиты, не зависящие от состояния игры.

import { DEBUG } from "./config.js";

export function log(msg) {
    if (DEBUG) console.log(msg);
}

export function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function showEvent(msg) {
    const el = document.getElementById("event-log");
    if (!el) return;
    el.innerHTML = `<span>${msg}</span>`;
}
