const API_URL = 'https://script.google.com/macros/s/AKfycbzxiPziON6tOceqX5KPZDCg82Q613SfsCDQdG_QyBqs8wbnFIgRjLHj-crxZM0yj0xU/exec;

// Добавление цели
function addGoal() {
    const goalName = prompt("Введите название цели:");
    if (goalName) {
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({type: 'goal', name: goalName, details: 'started'})
        })
        .then(response => response.text())
        .then(data => {
            alert(data); // "Данные успешно добавлены!"
            loadGoals(); // Обновляем список целей
        })
        .catch(error => console.error('Ошибка:', error));
    }
}

// Добавление события
function addEvent() {
    const eventName = prompt("Введите название события:");
    if (eventName) {
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({type: 'event', name: eventName, details: 'scheduled'})
        })
        .then(response => response.text())
        .then(data => {
            alert(data); // "Данные успешно добавлены!"
            loadEvents(); // Обновляем список событий
        })
        .catch(error => console.error('Ошибка:', error));
    }
}

// Загрузка целей
function loadGoals() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            const goals = data.filter(item => item[0] === 'goal'); // Фильтруем только цели
            document.getElementById('goals').innerHTML = goals.map(goal => `<div>${goal[1]}</div>`).join('');
        })
        .catch(error => console.error('Ошибка:', error));
}

// Загрузка событий
function loadEvents() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            const events = data.filter(item => item[0] === 'event'); // Фильтруем только события
            document.getElementById('events').innerHTML = events.map(event => `<div>${event[1]}</div>`).join('');
        })
        .catch(error => console.error('Ошибка:', error));
}

// Имитация подписки
document.getElementById('subscribe').onclick = function() {
    alert("Подписка куплена!");
    // Здесь можно добавить логику для снятия ограничений
};

// Загружаем данные при запуске
loadGoals();
loadEvents();
