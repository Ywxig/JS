/**
 * @fileoverview Модуль для работы с DOM: отрисовка строк таблицы,
 * отображение деталей транзакции, обновление баланса.
 * @module ui
 */

import { formatAmount, truncateWords } from './utils.js';

/**
 * Ссылки на DOM-элементы, используемые модулем.
 * @type {{ body: HTMLTableSectionElement, emptyRow: HTMLTableRowElement,
 *          totalDisplay: HTMLElement, detailContent: HTMLElement }}
 */
const DOM = {
  body: document.getElementById('transactions-body'),
  emptyRow: document.getElementById('empty-row'),
  totalDisplay: document.getElementById('total-display'),
  detailContent: document.getElementById('detail-content'),
};

/**
 * Создаёт и добавляет строку таблицы для переданной транзакции.
 * Строка окрашивается в зелёный (positive) или красный (negative) цвет
 * в зависимости от знака суммы. Содержит кнопку удаления.
 * @param {import('./transactions.js').Transaction} transaction - Объект транзакции.
 * @returns {void}
 */
export function renderTransaction(transaction) {
  // Скрыть строку-заглушку «пусто»
  DOM.emptyRow.style.display = 'none';

  const isPositive = transaction.amount >= 0;

  const tr = document.createElement('tr');
  tr.classList.add(isPositive ? 'positive' : 'negative');
  tr.dataset.id = transaction.id;

  // Дата
  const tdDate = document.createElement('td');
  tdDate.className = 'date-cell';
  tdDate.textContent = transaction.date;

  // Категория
  const tdCategory = document.createElement('td');
  tdCategory.textContent = transaction.category;

  // Краткое описание (первые 4 слова)
  const tdDesc = document.createElement('td');
  tdDesc.textContent = truncateWords(transaction.description);

  // Сумма
  const tdAmount = document.createElement('td');
  tdAmount.className = isPositive ? 'amount-positive' : 'amount-negative';
  tdAmount.textContent = formatAmount(transaction.amount);

  // Кнопка удаления
  const tdAction = document.createElement('td');
  const btnDelete = document.createElement('button');
  btnDelete.className = 'btn-delete';
  btnDelete.dataset.deleteId = transaction.id;
  btnDelete.textContent = '✕ удалить';
  tdAction.appendChild(btnDelete);

  tr.appendChild(tdDate);
  tr.appendChild(tdCategory);
  tr.appendChild(tdDesc);
  tr.appendChild(tdAmount);
  tr.appendChild(tdAction);

  DOM.body.appendChild(tr);
}

/**
 * Удаляет строку таблицы с заданным идентификатором транзакции.
 * Если строк больше не осталось, показывает строку-заглушку.
 * @param {string} id - Идентификатор транзакции.
 * @returns {void}
 */
export function removeTransactionRow(id) {
  const row = DOM.body.querySelector(`tr[data-id="${id}"]`);
  if (row) row.remove();

  // Показать «пусто» если таблица стала пустой (кроме emptyRow)
  const dataRows = DOM.body.querySelectorAll('tr[data-id]');
  if (dataRows.length === 0) {
    DOM.emptyRow.style.display = '';
  }
}

/**
 * Обновляет отображаемый баланс в шапке страницы.
 * Применяет CSS-класс «negative» при отрицательном балансе.
 * @param {number} total - Общая сумма всех транзакций.
 * @returns {void}
 */
export function updateTotal(total) {
  DOM.totalDisplay.textContent = formatAmount(total);
  if (total < 0) {
    DOM.totalDisplay.classList.add('negative');
  } else {
    DOM.totalDisplay.classList.remove('negative');
  }
}

/**
 * Отображает полные детали выбранной транзакции в блоке ниже таблицы.
 * @param {import('./transactions.js').Transaction} transaction - Объект транзакции.
 * @returns {void}
 */
export function showTransactionDetail(transaction) {
  const isPositive = transaction.amount >= 0;
  DOM.detailContent.innerHTML = `
    <div class="detail-row">
      <span class="detail-key">ID</span>
      <span class="detail-val">${transaction.id}</span>
    </div>
    <div class="detail-row">
      <span class="detail-key">Дата</span>
      <span class="detail-val">${transaction.date}</span>
    </div>
    <div class="detail-row">
      <span class="detail-key">Категория</span>
      <span class="detail-val">${transaction.category}</span>
    </div>
    <div class="detail-row">
      <span class="detail-key">Сумма</span>
      <span class="detail-val ${isPositive ? 'green' : 'red'}">${formatAmount(transaction.amount)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-key">Описание</span>
      <span class="detail-val">${transaction.description}</span>
    </div>
  `;
}

/**
 * Сбрасывает блок деталей транзакции до начального состояния-заглушки.
 * @returns {void}
 */
export function clearTransactionDetail() {
  DOM.detailContent.innerHTML =
    '<p class="detail-placeholder">Кликните на строку таблицы для просмотра подробного описания</p>';
}

/**
 * Отображает сообщение об ошибке под полем формы.
 * @param {string} fieldId - Суффикс id поля (например "amount", "category", "description").
 * @param {string} message - Текст ошибки.
 * @returns {void}
 */
export function showFieldError(fieldId, message) {
  const el = document.getElementById(`${fieldId}-error`);
  if (el) el.textContent = message;
}

/**
 * Очищает все сообщения об ошибках в форме.
 * @returns {void}
 */
export function clearFormErrors() {
  ['amount', 'category', 'description'].forEach((id) => {
    const el = document.getElementById(`${id}-error`);
    if (el) el.textContent = '';
  });
}