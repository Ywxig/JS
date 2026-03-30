# Transaction Analyzer

Консольное приложение для анализа финансовых транзакций на JavaScript.

## Запуск

```bash
node main.js
```

---

## Структура транзакции

| Поле | Тип | Описание |
|------|-----|----------|
| `transaction_id` | string | Уникальный идентификатор |
| `transaction_date` | string | Дата в формате `YYYY-MM-DD` |
| `transaction_amount` | number | Сумма транзакции |
| `transaction_type` | string | Тип: `debit` или `credit` |
| `transaction_description` | string | Описание |
| `merchant_name` | string | Название магазина / сервиса |
| `card_type` | string | Тип карты: `debit` или `credit` |

---

## Описание функций

### `getUniqueTransactionTypes(transactions)`
Возвращает массив уникальных типов транзакций.  
Использует `Set`, чтобы автоматически убрать дубликаты, затем spread-оператор `...` превращает `Set` обратно в массив.

```js
getUniqueTransactionTypes(transactions);
// => ["debit", "credit"]
```

---

### `calculateTotalAmount(transactions)`
Считает и возвращает сумму всех транзакций.  
Использует `reduce`, который проходит по массиву и накапливает итог в переменной `sum`.

```js
calculateTotalAmount(transactions);
// => 5075.49
```

---

### `calculateTotalAmountByDate(transactions, year?, month?, day?)`
Считает сумму транзакций за указанный период. Все параметры даты необязательны — можно передать только год, только месяц, или любую комбинацию.  
Внутри фильтрует транзакции по совпадению даты, затем считает сумму через `calculateTotalAmount`.

```js
calculateTotalAmountByDate(transactions, 2024, 3);
// => 2625.5  (все транзакции за март 2024)

calculateTotalAmountByDate(transactions, 2024, 2, 14);
// => 350  (транзакции за 14 февраля 2024)
```

---

### `getTransactionByType(transactions, type)`
Возвращает массив транзакций указанного типа: `"debit"` или `"credit"`.  
Использует `filter` для отбора объектов, у которых `transaction_type` совпадает с переданным значением.

```js
getTransactionByType(transactions, "debit");
// => [{ transaction_id: "T001", ... }, ...]
```

---

### `getTransactionsInDateRange(transactions, startDate, endDate)`
Возвращает транзакции, совершённые в диапазоне дат (включительно).  
Сравнивает строки дат в формате `YYYY-MM-DD` — такой формат позволяет сравнивать даты как обычные строки.

```js
getTransactionsInDateRange(transactions, "2024-02-01", "2024-02-28");
// => транзакции T003, T004, T005
```

---

### `getTransactionsByMerchant(transactions, merchantName)`
Возвращает все транзакции, совершённые с указанным магазином или сервисом.  
Использует `filter` по полю `merchant_name`.

```js
getTransactionsByMerchant(transactions, "Employer Inc.");
// => транзакции T002, T008
```

---

### `calculateAverageTransactionAmount(transactions)`
Возвращает среднее значение суммы транзакций.  
Делит общую сумму на количество транзакций. Если массив пустой — возвращает `0`, чтобы избежать деления на ноль.

```js
calculateAverageTransactionAmount(transactions);
// => 507.55
```

---

### `getTransactionsByAmountRange(transactions, min, max)`
Возвращает транзакции, сумма которых находится в диапазоне от `min` до `max` включительно.  
Использует `filter` с двойным условием по полю `transaction_amount`.

```js
getTransactionsByAmountRange(transactions, 100, 500);
// => транзакции T001, T004, T005, T007, T009
```

---

### `calculateTotalDebitAmount(transactions)`
Считает общую сумму только дебетовых транзакций.  
Комбинирует две уже существующие функции: сначала фильтрует через `getTransactionByType`, затем суммирует через `calculateTotalAmount`.

```js
calculateTotalDebitAmount(transactions);
// => 1375.49
```

---

### `findMostTransactionsMonth(transactions)`
Возвращает номер месяца, в котором было больше всего транзакций.  
Собирает объект `counts` с количеством транзакций по каждому месяцу, затем сортирует и берёт первый результат. Возвращает `null` для пустого массива.

```js
findMostTransactionsMonth(transactions);
// => "03"  (март)
```

---

### `findMostDebitTransactionMonth(transactions)`
Возвращает номер месяца с наибольшим количеством дебетовых транзакций.  
Фильтрует только дебетовые транзакции и передаёт их в `findMostTransactionsMonth`.

```js
findMostDebitTransactionMonth(transactions);
// => "03"  (март)
```

---

### `mostTransactionTypes(transactions)`
Определяет, каких транзакций больше.  
Считает количество дебетовых и кредитовых транзакций и сравнивает их.

- Возвращает `"debit"` — если дебетовых больше
- Возвращает `"credit"` — если кредитовых больше
- Возвращает `"equal"` — если поровну

```js
mostTransactionTypes(transactions);
// => "debit"
```

---

### `getTransactionsBeforeDate(transactions, date)`
Возвращает транзакции, совершённые строго до указанной даты.  
Сравнивает строки дат: всё, что меньше переданной даты, попадает в результат.

```js
getTransactionsBeforeDate(transactions, "2024-02-01");
// => транзакции T001, T002
```

---

### `findTransactionById(transactions, id)`
Находит и возвращает транзакцию по её уникальному идентификатору.  
Использует `find`, который останавливается на первом совпадении. Если транзакция не найдена — возвращает `null`.

```js
findTransactionById(transactions, "T005");
// => { transaction_id: "T005", ... }

findTransactionById(transactions, "T999");
// => null
```

---

### `mapTransactionDescriptions(transactions)`
Возвращает массив, содержащий только описания всех транзакций.  
Использует `map` для извлечения поля `transaction_description` из каждого объекта.

```js
mapTransactionDescriptions(transactions);
// => ["Grocery shopping", "Salary payment", ...]
```

---

## Контрольные вопросы

### 1. Какие методы массивов можно использовать для обработки объектов в JavaScript?

| Метод | Для чего используется |
|-------|-----------------------|
| `map()` | Преобразует каждый элемент массива и возвращает новый массив |
| `filter()` | Отбирает элементы по условию и возвращает новый массив |
| `reduce()` | Сворачивает массив в одно значение (например, сумму) |
| `find()` | Возвращает первый элемент, подходящий по условию |
| `forEach()` | Перебирает элементы без возврата нового массива |
| `some()` | Возвращает `true`, если хотя бы один элемент подходит по условию |
| `every()` | Возвращает `true`, если все элементы подходят по условию |
| `sort()` | Сортирует элементы массива |

В данном проекте активно используются `map`, `filter`, `reduce`, `find` и `forEach`.

---

### 2. Как сравнивать даты в строковом формате в JavaScript?

Если дата записана в формате `YYYY-MM-DD` (год-месяц-день), её можно сравнивать как обычную строку с помощью операторов `<`, `>`, `<=`, `>=`, `===`.

Это работает потому, что формат `YYYY-MM-DD` является лексикографически упорядоченным — более ранняя дата всегда будет "меньше" более поздней при строковом сравнении.

```js
"2024-01-15" < "2024-03-01"  // => true
"2024-12-31" > "2024-06-01"  // => true
"2024-02-14" === "2024-02-14" // => true
```

Именно этот подход используется в функциях `getTransactionsInDateRange` и `getTransactionsBeforeDate`.

Если формат даты другой (например, `DD.MM.YYYY`), строковое сравнение не сработает корректно — тогда нужно использовать объект `Date`:

```js
new Date("2024-01-15") < new Date("2024-03-01") // => true
```
