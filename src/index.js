/**
 * @fileoverview Главный модуль приложения учёта личных финансов.
 * Импортирует модули transactions, ui и связывает логику с DOM-событиями.
 * @module index
 */

import { addTransaction, removeTransaction, calculateTotal, findById } from './transactions.js';
import {
  renderTransaction,
  removeTransactionRow,
  updateTotal,
  showTransactionDetail,
  clearTransactionDetail,
  showFieldError,
  clearFormErrors,
} from './ui.js';

// ─── DOM-элементы формы ──────────────────────────────────────────────────────
/** @type {HTMLFormElement} */
const form = document.getElementById('transaction-form');

/** @type {HTMLInputElement} */
const inputAmount = document.getElementById('amount');

/** @type {HTMLSelectElement} */
const selectCategory = document.getElementById('category');

/** @type {HTMLInputElement} */
const inputDescription = document.getElementById('description');

/** @type {HTMLTableElement} */
const table = document.getElementById('transactions-table');

// ─── Валидация формы ─────────────────────────────────────────────────────────

/**
 * Валидирует поля формы добавления транзакции.
 * При ошибках вызывает showFieldError() для каждого некорректного поля.
 * @returns {boolean} true если все поля заполнены корректно, иначе false.
 */
function validateForm() {
  clearFormErrors();
  let valid = true;

  const amountVal = inputAmount.value.trim();
  if (!amountVal || isNaN(Number(amountVal))) {
    showFieldError('amount', 'Введите корректную сумму (число)');
    valid = false;
  } else if (Number(amountVal) === 0) {
    showFieldError('amount', 'Сумма не может быть равна нулю');
    valid = false;
  }

  if (!selectCategory.value) {
    showFieldError('category', 'Выберите категорию');
    valid = false;
  }

  if (!inputDescription.value.trim()) {
    showFieldError('description', 'Введите описание транзакции');
    valid = false;
  }

  return valid;
}

// ─── Обработчик отправки формы ────────────────────────────────────────────────

/**
 * Обрабатывает отправку формы: валидирует данные, создаёт транзакцию,
 * обновляет таблицу и итоговую сумму, сбрасывает форму.
 * @param {SubmitEvent} e - Событие отправки формы.
 * @returns {void}
 */
form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  // Создать и добавить транзакцию
  const transaction = addTransaction({
    amount: inputAmount.value,
    category: selectCategory.value,
    description: inputDescription.value.trim(),
  });

  // Отрисовать строку в таблице
  renderTransaction(transaction);

  // Пересчитать баланс
  updateTotal(calculateTotal());

  // Сбросить форму
  form.reset();
  clearFormErrors();
});

// ─── Делегирование событий на таблице ────────────────────────────────────────

/**
 * Обрабатывает клики внутри таблицы транзакций через делегирование событий.
 * — Клик по кнопке «удалить»: удаляет транзакцию из данных и DOM.
 * — Клик по строке: показывает полное описание транзакции.
 * @param {MouseEvent} e - Событие клика.
 * @returns {void}
 */
table.addEventListener('click', (e) => {
  // Проверяем, нажата ли кнопка удаления
  const deleteBtn = e.target.closest('[data-delete-id]');
  if (deleteBtn) {
    e.stopPropagation(); // Не всплываем до строки
    const id = deleteBtn.dataset.deleteId;
    removeTransaction(id);
    removeTransactionRow(id);
    updateTotal(calculateTotal());
    clearTransactionDetail();
    return;
  }

  // Проверяем, кликнули ли по строке с транзакцией
  const row = e.target.closest('tr[data-id]');
  if (row) {
    const id = row.dataset.id;
    const transaction = findById(id);
    if (transaction) {
      showTransactionDetail(transaction);

      // Прокрутить к блоку деталей
      document.getElementById('detail-card').scrollIntoView({ behavior: 'smooth' });
    }
  }
});