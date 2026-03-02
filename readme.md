# Лабораторная работа №2

## функция `forEach`

```JS

function forEach(array, callback) {
  if (!Array.isArray(array)) {
    throw new TypeError(array + ' is not an array');
  }

  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }

  for (let i = 0; i < array.length; i++) {
    callback(array[i], i, array);
  }
}

```
Функция *последовательно* перебирает элементы массива и выполняет для каждого из них заданное вами действие.

> возможные ощибки
> 1. Если передать вместо колбэка что-то другое (например, число или строку), возникнет ошибка.
> 2. Если вместо массива передать число или строку, функция также выдаст ошибку, так как ожидается именно массив.

