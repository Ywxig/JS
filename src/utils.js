/**
 * @fileoverview Вспомогательные утилиты для приложения учёта финансов.
 * @module utils
 */

/**
 * Генерирует уникальный идентификатор на основе временной метки и случайного числа.
 * @returns {string} Уникальный строковый ID вида "id_<timestamp>_<random>".
 */
export function generateId() {
  return `id_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

/**
 * Форматирует объект Date в строку вида "ДД.ММ.ГГГГ ЧЧ:ММ".
 * @param {Date} date - Дата для форматирования.
 * @returns {string} Отформатированная строка даты и времени.
 */
export function formatDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = date.getFullYear();
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${d}.${m}.${y} ${h}:${min}`;
}

/**
 * Возвращает первые N слов из строки (краткое описание).
 * @param {string} text - Исходная строка.
 * @param {number} [wordCount=4] - Количество слов для возврата.
 * @returns {string} Обрезанная строка из первых wordCount слов (с "…" если текст длиннее).
 */
export function truncateWords(text, wordCount = 4) {
  const words = text.trim().split(/\s+/);
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '…';
}

/**
 * Форматирует число как денежную сумму с двумя знаками после запятой и знаком.
 * @param {number} amount - Сумма.
 * @returns {string} Форматированная строка, например "+1 500.00 $" или "−200.00 $".
 */
export function formatAmount(amount) {
  const sign = amount >= 0 ? '+' : '−';
  const abs = Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${sign}${abs} $`;
}