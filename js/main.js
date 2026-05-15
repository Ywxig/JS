// RUINS — main.js
// Точка входа. Экспортирует публичное API в window.__ruins,
// чтобы HTML-кнопки могли вызывать функции без глобального загрязнения.

import { loadPage, startGame } from "./pages.js";
import { resetPlayer }         from "./state.js";

function restart() {
    resetPlayer();
    loadPage("game");
}

// Публичное API для inline-обработчиков в HTML
window.__ruins = { loadPage, restart };

// Запуск
loadPage("home");
