alert("Привет, мир!");
console.log("Hello, console!");

let name = "Dima Zimnov"
let birthYear = 2007
let isStudent = true

console.log("Hello, my name is: " + name + " I was born: " + birthYear + " I am student: " + isStudent)

let score = prompt("Введите ваш балл:");
if (score >= 90) {
 console.log("Отлично!");
} else if (score >= 70) {
 console.log("Хорошо");
} else {
 console.log("Можно лучше!");
}

for (let i = 1; i <= 5; i++) {
 console.log(`Итерация: ${i}`);
}
