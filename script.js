const API_URL = 'https://script.google.com/macros/s/AKfycbzxiPziON6tOceqX5KPZDCg82Q613SfsCDQdG_QyBqs8wbnFIgRjLHj-crxZM0yj0xU/exec;

function addGoal() {
    const goalName = prompt("Введите название цели:");
    if (goalName) {
        fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({type: 'goal', name: goalName, details: 'started'})
        }).then(response => response.text())
          .then(data => {
              alert(data);
              loadGoals();
          });
    }
}

function addEvent() {
    const eventName = prompt("Введите название события:");
    if (eventName) {
        fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({type: 'event', name: eventName, details: 'scheduled'})
        }).then(response => response.text())
          .then(data => {
              alert(data);
              loadEvents();
          });
    }
}

function loadGoals() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            const goals = data.filter(item => item[0] === 'goal');
            document.getElementById('goals').innerHTML = goals.map(goal => `<div>${goal[1]}</div>`).join('');
        });
}

function loadEvents() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            const events = data.filter(item => item[0] === 'event');
            document.getElementById('events').innerHTML = events.map(event => `<div>${event[1]}</div>`).join('');
        });
}

document.getElementById('subscribe').onclick = function() {
    alert("Подписка куплена!");
    // Здесь можно добавить логику для снятия ограничений
};

loadGoals();
loadEvents();
