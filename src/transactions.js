/**
 * @fileoverview Модуль для управления массивом транзакций.
 * @module transactions
 */

import { generateId, formatDate } from './utils.js';

/**
 * @typedef {Object} Transaction
 * @property {string}  id          - Уникальный идентификатор транзакции.
 * @property {string}  date        - Дата и время добавления (форматированная строка).
 * @property {number}  amount      - Сумма транзакции (положительная или отрицательная).
 * @property {string}  category    - Категория транзакции.
 * @property {string}  description - Полное описание транзакции.
 */

/**
 * Внутреннее хранилище транзакций.
 * @type {Transaction[]}
 */
let transactions = [];

/**
 * Создаёт и добавляет новую транзакцию в хранилище.
 * @param {Object} data - Данные из формы.
 * @param {number|string} data.amount      - Сумма транзакции.
 * @param {string}        data.category    - Категория транзакции.
 * @param {string}        data.description - Описание транзакции.
 * @returns {Transaction} Созданный объект транзакции.
 */
export function addTransaction({ amount, category, description }) {
  /** @type {Transaction} */
  const transaction = {
    id: generateId(),
    date: formatDate(new Date()),
    amount: parseFloat(amount),
    category,
    description,
  };
  transactions.push(transaction);
  return transaction;
}

/**
 * Удаляет транзакцию из хранилища по её идентификатору.
 * @param {string} id - Идентификатор транзакции для удаления.
 * @returns {boolean} true если транзакция найдена и удалена, false если не найдена.
 */
export function removeTransaction(id) {
  const index = transactions.findIndex((t) => t.id === id);
  if (index === -1) return false;
  transactions.splice(index, 1);
  return true;
}

/**
 * Возвращает копию массива всех транзакций.
 * @returns {Transaction[]} Массив транзакций.
 */
export function getTransactions() {
  return [...transactions];
}

/**
 * Вычисляет общую сумму всех транзакций.
 * @returns {number} Итоговая сумма (может быть отрицательной).
 */
export function calculateTotal() {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Ищет транзакцию по идентификатору.
 * @param {string} id - Идентификатор транзакции.
 * @returns {Transaction|undefined} Найденная транзакция или undefined.
 */
export function findById(id) {
  return transactions.find((t) => t.id === id);
}