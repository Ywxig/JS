# RUINS — документация

> Браузерный roguelike-dungeon crawler на ванильном JavaScript с ES-модулями.  
> Управление: **WASD** или **стрелки**.

---

## Содержание

1. [Структура проекта](#структура-проекта)
2. [Как запустить](#как-запустить)
3. [Модули](#модули)
   - [main.js](#mainjs)
   - [config.js](#configjs)
   - [state.js](#statejs)
   - [utils.js](#utilsjs)
   - [dungeon.js](#dungeonjs)
   - [render.js](#renderjs)
   - [movement.js](#movementjs)
   - [pages.js](#pagesjs)
4. [Игровые механики](#игровые-механики)
5. [Таблица тайлов](#таблица-тайлов)
6. [Поток данных между модулями](#поток-данных-между-модулями)
7. [Известные особенности и ограничения](#известные-особенности-и-ограничения)

---

## Структура проекта

```
ruins/
├── index.html          # Точка входа, подключает main.js как ES-модуль
├── styles/
│   └── style2.css      # Все стили игры
└── js/
    ├── main.js         # Инициализация, публичное window API
    ├── config.js       # Константы, описание тайлов
    ├── state.js        # Изменяемое состояние игры
    ├── utils.js        # Вспомогательные функции
    ├── dungeon.js      # Процедурная генерация карты
    ├── render.js       # Отрисовка canvas и HUD
    ├── movement.js     # Движение игрока, бой, предметы
    └── pages.js        # Маршрутизация страниц, HTML-шаблоны
```

---

## Как запустить

Из-за ES-модулей файлы нельзя открыть напрямую через `file://` — браузер заблокирует импорты политикой CORS.  
Нужен любой локальный HTTP-сервер:

```bash
# Python 3
python -m http.server 8080

# Node.js (пакет serve)
npx serve .

# VS Code — расширение Live Server
```

Открыть в браузере: `http://localhost:8080`

---

## Модули

### main.js

**Роль:** точка входа. Склеивает все модули и запускает игру.

```js
import { loadPage, startGame } from "./pages.js";
import { resetPlayer }         from "./state.js";
```
Импортирует только то, что нужно для инициализации и публичного API.

```js
function restart() {
    resetPlayer();
    loadPage("game");
}
```
`restart()` — функция перезапуска после смерти. Сначала сбрасывает состояние игрока (`HP`, `золото`, `этаж`) через `resetPlayer()`, затем загружает игровой экран.

```js
window.__ruins = { loadPage, restart };
```
Единственное место, где функции попадают в глобальную область видимости — через пространство имён `window.__ruins`.  
Это нужно для `onclick`-атрибутов в HTML-шаблонах (например, кнопка «Начать заново»), поскольку ES-модули изолированы и не пишут в `window` автоматически.

```js
loadPage("home");
```
Запускает игру — показывает главный экран при загрузке страницы.

---

### config.js

**Роль:** все константы проекта. Этот файл только читается — никогда не изменяется во время игры.

```js
export const DEBUG = true;
```
Флаг отладки. Когда `true`, функция `log()` выводит сообщения в консоль. Поставьте `false` перед публикацией.

```js
export const BLOCK_SIZE  = 32;  // размер одной клетки в пикселях
export const MAP_W       = 16;  // ширина карты в клетках
export const MAP_H       = 12;  // высота карты в клетках
export const CANVAS_COLS = 19;  // сколько клеток видно по горизонтали
export const CANVAS_ROWS = 13;  // сколько клеток видно по вертикали
```
Размер canvas вычисляется как `CANVAS_COLS * BLOCK_SIZE` × `CANVAS_ROWS * BLOCK_SIZE` = 608 × 416 пикселей.  
Карта (16 × 12) меньше видимой области (19 × 13), поэтому камера центрируется на игроке и показывает пустое пространство за краями.

```js
export const TILES = {
    "hero": { color, type, symbolColor, char, hp, maxHp, attack },
    "0":    { color, type, symbolColor, char },   // стена
    "1":    { color, type, symbolColor, char },   // пол
    "e":    { color, type, symbolColor, char, summonChance },  // враг
    "E":    { color, type, symbolColor, char },   // выход
    "H":    { color, type, symbolColor, char, summonChance },  // зелье
    "c":    { color, type, symbolColor, char, minValue, maxValue, summonChance }, // сундук
};
```

Каждый тайл — объект со следующими полями:

| Поле           | Тип     | Описание                                                      |
|----------------|---------|---------------------------------------------------------------|
| `color`        | string  | Цвет фона клетки (hex)                                        |
| `type`         | string  | Логический тип: `"wall"`, `"floor"`, `"enemy"` и т.д.        |
| `symbolColor`  | string  | Цвет символа, нарисованного поверх фона                       |
| `char`         | string  | Символ (emoji или ASCII), отображаемый на клетке              |
| `hp/maxHp`     | number  | Только у `"hero"`: начальные очки здоровья                    |
| `attack`       | number  | Только у `"hero"`: урон (пока не используется активно)        |
| `summonChance` | number  | Коэффициент, умножающийся на номер этажа при генерации        |
| `minValue`     | number  | Только у `"c"`: минимальное количество золота в сундуке       |
| `maxValue`     | number  | Только у `"c"`: максимальное количество золота в сундуке      |

```js
export const WALKABLE = new Set(["1", "e", "E", "H", "c"]);
```
Множество тайлов, на которые игрок может наступить. Стены (`"0"`) здесь отсутствуют — движение на них заблокировано в `movement.js`.

```js
export const ENEMY_BASE_DMG = 15;
```
Базовый урон врага. Реальный урон масштабируется по этажу в `movement.js`.

---

### state.js

**Роль:** единственный источник правды об изменяемом состоянии игры. Все модули читают и пишут в один объект `state`.

```js
import { TILES, ENEMY_BASE_DMG } from "./config.js";
```
Берём начальные значения из `config.js`, чтобы не дублировать цифры.

```js
export const state = {
    map:        [],           // двумерный массив строк — текущая карта этажа
    playerPos:  { x: 0, y: 0 }, // позиция игрока в клетках карты
    floorNum:   1,            // текущий номер этажа
    playerBank: 0,            // накопленное золото
    player:     { ...TILES["hero"] }, // статы игрока (HP, maxHP, attack)
    enemyDmg:   ENEMY_BASE_DMG,       // базовый урон врага
};
```
`{ ...TILES["hero"] }` — spread-копия объекта из `TILES`. Без этого изменения HP игрока напрямую мутировали бы объект `TILES`, что сломало бы `resetPlayer()`.

```js
export function resetPlayer() {
    state.player     = { ...TILES["hero"] };
    state.playerBank = 0;
    state.floorNum   = 1;
}
```
Вызывается при перезапуске (экран смерти → «Начать заново»). Пересоздаёт копию стартовых статов и обнуляет счётчики. `state.map` не трогается — его перезапишет `startGame()` в `pages.js`.

---

### utils.js

**Роль:** три маленьких утилиты без зависимости от состояния игры. Можно переиспользовать в любом модуле.

```js
import { DEBUG } from "./config.js";
```
Флаг отладки нужен только здесь — `log()` использует его внутри.

```js
export function log(msg) {
    if (DEBUG) console.log(msg);
}
```
Обёртка над `console.log`. Когда `DEBUG = false`, все вызовы `log()` по всему коду превращаются в no-op (ничего не делают) без необходимости искать и удалять их вручную.

```js
export function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
```
Возвращает случайное целое число в диапазоне `[min, max]` включительно. Используется при генерации карты и при открытии сундуков. Формула: умножаем диапазон `(max - min + 1)` на `Math.random()` (от 0 до 1), берём пол и сдвигаем на `min`.

```js
export function showEvent(msg) {
    const el = document.getElementById("event-log");
    if (!el) return;
    el.innerHTML = `<span>${msg}</span>`;
}
```
Выводит одно сообщение в панель событий под canvas. Каждый вызов **перезаписывает** предыдущее сообщение (не добавляет). Ранняя проверка `if (!el) return` защищает от вызова на страницах без `#event-log` (главный экран, экран смерти).

---

### dungeon.js

**Роль:** процедурно генерирует карту этажа в виде двумерного массива.

```js
import { TILES } from "./config.js";
import { state }  from "./state.js";
import { randInt } from "./utils.js";
```

```js
export function generateDungeon(w, h) {
    const steps = Math.round((w * h) / 2.5);
    const grid  = Array.from({ length: h }, () => Array(w).fill("0"));
```
Создаём сетку `h × w`, целиком заполненную стенами (`"0"`). Количество шагов блуждания пропорционально площади карты — примерно 40% клеток станут проходимыми.

```js
    let x = 1, y = 1;
    grid[y][x] = "1";

    for (let i = 0; i < steps; i++) {
        const d = randInt(0, 3);
        if      (d === 0 && x + 1 < w - 1) x++;
        else if (d === 1 && x - 1 > 0)     x--;
        else if (d === 2 && y + 1 < h - 1) y++;
        else if (d === 3 && y - 1 > 0)     y--;
        grid[y][x] = "1";
    }
```
**Алгоритм случайного блуждания (random walk).** Курсор стартует с позиции `(1,1)` и случайно ходит в одну из четырёх сторон `steps` раз, превращая каждую посещённую клетку в пол. Граничные условия (`x + 1 < w - 1` и т.д.) не дают курсору касаться крайнего ряда стен — периметр карты всегда остаётся закрытым.

```js
    const enemyCount = Math.floor((w * h) / 18 + state.floorNum * TILES["e"].summonChance);
    for (let i = 0; i < enemyCount; i++) {
        const ex = randInt(1, w - 2);
        const ey = randInt(1, h - 2);
        if (grid[ey][ex] === "1") grid[ey][ex] = "e";
    }
```
Расставляет врагов. Базовое количество: `(16×12)/18 ≈ 10`. Каждый этаж добавляет `floorNum × 0.25` врагов. Враг ставится **только на пол** (`"1"`) — это предотвращает перезапись стен или уже расставленных объектов. Если случайная клетка оказалась стеной, итерация просто пропускается (враг не появляется).

```js
    // Аналогично для зелий ("H") и сундуков ("c")
```
Та же логика, но с другими коэффициентами: зелий меньше, сундуков ещё меньше (`summonChance: 0.01`).

```js
    grid[y][x] = "E";
    if (!grid.some(row => row.includes("E"))) {
        grid[h - 2][w - 2] = "E";
    }
```
Выход (`"E"`) ставится на **последнюю позицию курсора** после блуждания. Поскольку курсор закончил путь именно там, выход всегда достижим — путь к нему уже проложен. Строка с `grid.some(...)` — страховка на случай, если логика изменится в будущем.

---

### render.js

**Роль:** отрисовывает карту и игрока на canvas, обновляет элементы HUD.

```js
import { TILES, BLOCK_SIZE, CANVAS_COLS, CANVAS_ROWS } from "./config.js";
import { state } from "./state.js";
```

```js
export function render() {
    const canvas = document.getElementById("canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#050508";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
```
Каждый кадр начинается с заливки всего canvas тёмным цветом — это «стирает» предыдущий кадр.

```js
    const camOffX = Math.floor(CANVAS_COLS / 2) - state.playerPos.x;
    const camOffY = Math.floor(CANVAS_ROWS / 2) - state.playerPos.y;
```
**Логика камеры.** Камера не движется — вместо этого вся карта смещается так, чтобы игрок всегда оказывался в центре видимой области. `camOffX = 9 - playerPos.x`: если игрок на клетке 3, карта сдвигается вправо на 6 клеток, и игрок визуально попадает в центр.

```js
    for (let row = 0; row < state.map.length; row++) {
        for (let col = 0; col < state.map[row].length; col++) {
            const sx = (col + camOffX) * BLOCK_SIZE;
            const sy = (row + camOffY) * BLOCK_SIZE;

            if (sx < -BLOCK_SIZE || sy < -BLOCK_SIZE ||
                sx > canvas.width  + BLOCK_SIZE ||
                sy > canvas.height + BLOCK_SIZE) continue;
```
**Culling (отсечение).** Клетки, которые выходят за пределы canvas (+/- 1 блок запаса), пропускаются. Это экономит вызовы `fillRect` и `fillText` для невидимых тайлов.

```js
            ctx.fillStyle = info.color;
            ctx.fillRect(sx, sy, BLOCK_SIZE, BLOCK_SIZE);

            if (info.char) {
                ctx.font         = `${BLOCK_SIZE - 4}px monospace`;
                ctx.textAlign    = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle    = info.symbolColor || "#ffffff";
                ctx.fillText(info.char, sx + BLOCK_SIZE / 2, sy + BLOCK_SIZE / 2);
            }
```
Каждая клетка рисуется в два слоя: сначала цветной прямоугольник (`fillRect`), поверх — символ (`fillText`). Символ центрируется с помощью `textAlign: "center"` и `textBaseline: "middle"` относительно центра клетки.

```js
    const px = (state.playerPos.x + camOffX) * BLOCK_SIZE;
    const py = (state.playerPos.y + camOffY) * BLOCK_SIZE;
    ctx.fillRect(px + 2, py + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
```
Игрок рисуется **после** всех тайлов, поэтому всегда появляется поверх карты. Отступ `+2` / `-4` даёт небольшой визуальный зазор по краям клетки.

```js
export function updateHUD() {
    const { player, playerBank, floorNum } = state;
    const lastFloor = localStorage.getItem("lastFloor") || 1;

    if (hpBar)  hpBar.style.width  = Math.max(0, (player.hp / player.maxHp) * 100) + "%";
    if (hpText) hpText.textContent = `${player.hp} / ${player.maxHp}`;
    if (flTxt)  flTxt.textContent  = `Этаж ${floorNum}/${lastFloor}`;
    if (bankEl) bankEl.textContent = `$: ${playerBank}`;
```
Обновляет четыре DOM-элемента HUD. `Math.max(0, ...)` не даёт полоске HP уйти в отрицательную ширину. `localStorage.getItem("lastFloor")` показывает рекорд глубины — максимальный достигнутый этаж за все сессии.  
Все проверки `if (hpBar)` защищают от ошибок при вызове `updateHUD` на страницах без HUD.

---

### movement.js

**Роль:** обрабатывает ввод, реализует боевую систему и взаимодействие с тайлами.

```js
import { TILES, WALKABLE }           from "./config.js";
import { state }                     from "./state.js";
import { randInt, showEvent, log }   from "./utils.js";
import { render }                    from "./render.js";
import { loadPage, startGame }       from "./pages.js";
```

```js
export function move(dir) {
    let nx = state.playerPos.x;
    let ny = state.playerPos.y;

    if (dir === "up")    ny--;
    if (dir === "down")  ny++;
    if (dir === "left")  nx--;
    if (dir === "right") nx++;
```
Вычисляем **целевую** позицию `(nx, ny)`, но ещё не двигаем игрока — сначала нужно проверить, что там находится.

```js
    if (nx < 0 || ny < 0 || ny >= state.map.length || nx >= state.map[0].length) return;
    const tile = state.map[ny][nx];
    if (!WALKABLE.has(tile)) return;
```
Двойная защита: сначала проверяем границы массива (иначе получим `undefined`), затем проверяем, что тайл проходим. Если условие не выполнено — выходим из функции, игрок не двигается.

```js
    if (tile === "e") {
        const dmg = Math.floor(state.enemyDmg * (state.floorNum * 0.2) * 1.1);
        state.player.hp -= dmg;
        state.map[ny][nx] = "1";
```
**Бой.** Урон масштабируется по формуле: `15 × (этаж × 0.2) × 1.1`. На 1-м этаже: `15 × 0.2 × 1.1 = 3.3 → 3`. На 5-м: `15 × 1.0 × 1.1 = 16.5 → 16`. После победы враг исчезает — его клетка заменяется на пол `"1"`.

```js
        if (state.player.hp <= 0) { loadPage("death"); return; }
        state.playerPos.x = nx;
        state.playerPos.y = ny;
        render();
        return;
    }
```
Если HP упало до нуля — немедленно переход на экран смерти. Иначе — игрок занимает клетку врага и кадр перерисовывается.

```js
    if (tile === "c") {
        const gold = randInt(TILES["c"].minValue, TILES["c"].maxValue);
        state.playerBank += gold;
        state.map[ny][nx] = "1";
```
**Сундук.** Случайное золото от `minValue` до `maxValue`, добавляется в `state.playerBank`. Сундук исчезает.

```js
    if (tile === "H") {
        if (state.player.hp === state.player.maxHp) {
            state.player.hp -= 10;
            // ...
        } else {
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + 30);
        }
```
**Зелье.** При полном HP — наносит 10 урона (штраф за жадность). Иначе — лечит на 30, но не превышает `maxHp`. `Math.min` гарантирует, что HP не выйдет за максимум.

```js
    if (tile === "E") {
        state.floorNum++;
        const lastFloor = parseInt(localStorage.getItem("lastFloor") || "1", 10);
        if (state.floorNum > lastFloor) {
            localStorage.setItem("lastFloor", state.floorNum);
        }
        startGame();
        return;
    }
```
**Выход.** Увеличивает счётчик этажа, обновляет рекорд в `localStorage` (если достигнут новый максимум), и вызывает `startGame()` — генерируется новая карта, игрок ставится на `(1,1)`.

```js
export function setupKeyboard() {
    document.onkeydown = (e) => {
        const dirs = {
            ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
            w: "up", s: "down", a: "left", d: "right"
        };
        if (dirs[e.key]) { e.preventDefault(); move(dirs[e.key]); }
    };
}
```
Привязывает обработчик ко всему документу. `e.preventDefault()` блокирует стандартное поведение стрелок (прокрутку страницы). При переходе на экран смерти `loadPage("death")` сбрасывает `document.onkeydown = null` — это убирает слушатель, чтобы кнопки не работали на мёртвом экране.

---

### pages.js

**Роль:** маршрутизация между экранами и HTML-шаблоны.

```js
export function loadPage(page) {
    const content = document.getElementById("content");

    switch (page) {
        case "home":  content.innerHTML = pagHome();  break;
        case "game":  content.innerHTML = pageGame(); setupKeyboard(); startGame(); break;
        case "death": content.innerHTML = pageDeath(); document.onkeydown = null; break;
        default:      content.innerHTML = `<h2>Страница не найдена</h2>`;
    }
}
```
Вся навигация сводится к замене `innerHTML` у контейнера `#content`. Это SPA без роутера: три «экрана» — главный, игровой, смерти. При загрузке игрового экрана сразу же вешается клавиатура и запускается генерация уровня.

```js
export function startGame() {
    state.map = generateDungeon(MAP_W, MAP_H);
    state.playerPos = { x: 1, y: 1 };
    state.map[1][1] = "1";
    render();
}
```
Генерирует новый этаж, сбрасывает позицию игрока в `(1,1)`, гарантирует что стартовая клетка — пол (не враг, не сундук), и сразу рисует карту.

```js
function pagHome() {
    return `
    <div class="main-menu">
        <h1>RUINS</h1>
        <button class="menu-btn" onclick="window.__ruins.loadPage('game')">▶ Новая игра</button>
    </div>`;
}
```
HTML главного экрана. Кнопка вызывает `window.__ruins.loadPage(...)` — именно так, потому что `onclick` выполняется в глобальном контексте, где ES-модульные функции недоступны напрямую.

```js
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
```
HTML экрана смерти. `state.floorNum` интерполируется в момент генерации строки, поэтому показывает правильный этаж гибели. `window.__ruins.restart()` вызывает `resetPlayer()` + `loadPage("game")` из `main.js`.

---

## Игровые механики

### Генерация карты
Алгоритм **random walk**: курсор случайно блуждает по сетке, превращая посещённые клетки в пол. Это даёт органичные, связные коридоры без изолированных комнат. Выход всегда достижим — он ставится на последнюю позицию курсора.

### Масштабирование сложности
С каждым этажом:
- Врагов становится больше: `+floorNum × 0.25` к базовым ~10
- Урон от врагов растёт: `baseDmg × floorNum × 0.22`
- Чуть больше зелий и сундуков (меньший коэффициент)

### Рекорд глубины
`localStorage.setItem("lastFloor", n)` сохраняет максимальный достигнутый этаж между сессиями. HUD показывает `Этаж X/Y`, где Y — рекорд. Смерть не сбрасывает рекорд.

### Бой
Мгновенный (bump-combat): игрок наступает на клетку врага → враг исчезает → игрок получает урон. Победа без отдельного экрана боя.

---

## Таблица тайлов

| Символ | Ключ | Тип      | Поведение при наступании                               |
|--------|------|----------|--------------------------------------------------------|
| `#`    | `"0"`| wall     | Непроходимо                                            |
| `.`    | `"1"`| floor    | Обычный шаг                                            |
| `☠`    | `"e"`| enemy    | Урон игроку, враг исчезает                             |
| `⬇`    | `"E"`| exit     | Переход на следующий этаж                              |
| `❤`    | `"H"`| health   | +30 HP (или −10 при полном здоровье), зелье исчезает  |
| `💰`   | `"c"`| chest    | Случайное золото (10–50), сундук исчезает              |
| `@`    | hero | player   | Персонаж игрока (не хранится в карте)                  |

---

## Поток данных между модулями

```
index.html
    └── main.js              ← точка входа
          ├── pages.js       ← управляет экранами
          │     ├── dungeon.js  ← генерирует state.map
          │     └── render.js   ← читает state, рисует canvas
          ├── movement.js    ← изменяет state, вызывает render
          └── state.js       ← единый изменяемый объект
                └── config.js  ← только чтение (TILES, константы)
```

Все модули **читают** из `state` и **пишут** в `state`. Только `config.js` неизменен. `render.js` только читает. `dungeon.js` пишет в `state.map` через `pages.js → startGame()`.

---

## Известные особенности и ограничения

- **Нет сохранения прогресса в рамках сессии** — при обновлении страницы этаж и HP сбрасываются. Сохраняется только рекорд `lastFloor`.
- **Генерация не гарантирует достижимость всех предметов** — враги и зелья ставятся случайно только на `"1"`, но часть пола может быть отрезана от старта в редких случаях.
- **Мобильное управление** — клавиатурная навигация, d-pad в CSS описан, но кнопки не добавлены в HTML. Можно добавить через `onclick="window.__ruins.move('up')"` (потребует экспорта `move` в `window.__ruins`).
- **Цикличность импортов** — `movement.js` импортирует из `pages.js`, а `pages.js` импортирует из `movement.js`. Node.js и браузеры справляются с этим за счёт «живых» привязок ES-модулей, но при рефакторинге стоит следить за этой зависимостью.
