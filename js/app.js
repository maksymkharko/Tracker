class App {
    constructor() {
        this.goals = [];
        this.events = [];
        this.maxGoals = 10;
        this.maxEvents = 5;
        
        this.initializeElements();
        this.initializeTheme();
        this.loadData();
        this.addEventListeners();
        this.startTimeUpdates();
        this.updateCounters();
    }

    initializeElements() {
        // Theme
        this.themeToggle = document.getElementById('themeToggle');
        
        // Data controls
        this.copyMdBtn = document.getElementById('copyMdBtn');
        this.pasteMdBtn = document.getElementById('pasteMdBtn');
        this.dataModal = document.getElementById('dataModal');
        this.copyModal = document.getElementById('copyModal');
        this.dataField = document.getElementById('dataField');
        this.saveDataBtn = document.getElementById('saveDataBtn');
        this.closeDataBtn = document.getElementById('closeDataBtn');
        this.copySelectedBtn = document.getElementById('copySelectedBtn');
        this.closeCopyBtn = document.getElementById('closeCopyBtn');
        this.selectAllGoals = document.getElementById('selectAllGoals');
        this.selectAllEvents = document.getElementById('selectAllEvents');
        this.copyGoalsList = document.getElementById('copyGoalsList');
        this.copyEventsList = document.getElementById('copyEventsList');
        
        // Buttons
        this.addGoalBtn = document.getElementById('addGoalBtn');
        this.addEventBtn = document.getElementById('addEventBtn');

        // Lists
        this.goalsList = document.getElementById('goalsList');
        this.eventsList = document.getElementById('eventsList');

        // Modals
        this.goalModal = document.getElementById('goalModal');
        this.eventModal = document.getElementById('eventModal');
        this.achievementModal = document.getElementById('achievementModal');

        // Forms
        this.goalForm = document.getElementById('goalForm');
        this.eventForm = document.getElementById('eventForm');

        // Update button texts
        this.copyMdBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 12L8 4M8 4L5 7M8 4L11 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Экспорт
        `;

        this.pasteMdBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 4L8 12M8 12L5 9M8 12L11 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Импорт
        `;
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeNames = {
            'light': '🌞 Светлая тема',
            'dark': '🌙 Темная тема',
            'lgbt': '🌈 ЛГБТ+ тема'
        };
        this.themeToggle.textContent = themeNames[savedTheme];
        this.themeToggle.className = 'control-btn theme-toggle';
    }

    addEventListeners() {
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Data controls
        this.copyMdBtn.addEventListener('click', async () => {
            // Добавляем задержку перед закрытием меню
            setTimeout(async () => {
                const ExportManager = (await import('./exportManager.js')).default;
                await ExportManager.export();
            }, 300); // 300мс задержка
        });

        this.pasteMdBtn.addEventListener('click', () => {
            this.showPasteData();
        });

        this.saveDataBtn.addEventListener('click', async () => {
            const ExportManager = (await import('./exportManager.js')).default;
            const success = await ExportManager.import(this.dataField.value);
            if (success) {
                this.loadData(); // Перезагружаем данные
                this.hideModals();
                this.showAchievement('Данные успешно импортированы');
            } else {
                this.showError('Ошибка при импорте данных');
            }
        });
        this.closeDataBtn.addEventListener('click', () => this.hideModals());
        this.copySelectedBtn.addEventListener('click', () => this.copySelectedData());
        this.closeCopyBtn.addEventListener('click', () => this.hideModals());
        
        // Select all checkboxes
        this.selectAllGoals.addEventListener('change', (e) => this.toggleAllCheckboxes('goals', e.target.checked));
        this.selectAllEvents.addEventListener('change', (e) => this.toggleAllCheckboxes('events', e.target.checked));
        
        // Goals and events
        this.addGoalBtn.addEventListener('click', () => this.showModal(this.goalModal));
        this.addEventBtn.addEventListener('click', () => this.showModal(this.eventModal));
        
        this.goalForm.addEventListener('submit', (e) => this.handleGoalSubmit(e));
        this.eventForm.addEventListener('submit', (e) => this.handleEventSubmit(e));

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModals();
            }
        });

        // Закрытие модального окна достижений по кнопке
        document.querySelector('.close-btn').addEventListener('click', () => this.hideModals());
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        let newTheme;
        
        // Циклическое переключение тем
        if (currentTheme === 'light') newTheme = 'dark';
        else if (currentTheme === 'dark') newTheme = 'lgbt';
        else newTheme = 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Обновляем текст кнопки
        const themeNames = {
            'light': '🌞 Светлая тема',
            'dark': '🌙 Темная тема',
            'lgbt': '🌈 ЛГБТ+ тема'
        };
        this.themeToggle.textContent = themeNames[newTheme];
        this.themeToggle.className = 'control-btn theme-toggle';
    }

    loadData() {
        try {
            // Загрузка целей
            const savedGoals = localStorage.getItem('goals');
            if (savedGoals) {
                this.goals = JSON.parse(savedGoals).map(goal => ({
                    ...goal,
                    startDate: new Date(goal.startDate),
                    endDate: new Date(goal.endDate)
                }));
            }

            // Загрузка событий
            const savedEvents = localStorage.getItem('events');
            if (savedEvents) {
                this.events = JSON.parse(savedEvents).map(event => ({
                    ...event,
                    date: new Date(event.date)
                }));
            }

            this.updateUI();
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
            this.showError('Ошибка при загрузке данных');
        }
    }

    saveData() {
        try {
            localStorage.setItem('goals', JSON.stringify(this.goals));
            localStorage.setItem('events', JSON.stringify(this.events));
            this.updateCounters();
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error);
            this.showError('Ошибка при сохранении данных');
        }
    }

    updateCounters() {
        document.querySelector('.goals-section h2').textContent = 
            `Мои цели (${this.goals.length}/${this.maxGoals})`;
        document.querySelector('.events-section h2').textContent = 
            `Мои события (${this.events.length}/${this.maxEvents})`;
    }

    showModal(modal) {
        if (modal === this.goalModal && this.goals.length >= this.maxGoals) {
            this.showError(`Достигнут лимит целей (${this.maxGoals})`);
            return;
        }
        if (modal === this.eventModal && this.events.length >= this.maxEvents) {
            this.showError(`Достигнут лимит событий (${this.maxEvents})`);
            return;
        }
        modal.classList.add('active');
    }

    hideModals() {
        this.goalModal.classList.remove('active');
        this.eventModal.classList.remove('active');
        this.achievementModal.classList.remove('active');
        this.dataModal.classList.remove('active');
        this.copyModal.classList.remove('active');
    }

    showError(message) {
        this.showAchievement(message);
    }

    handleGoalSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('goalName').value;
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1); // Цель на 1 год
        
        this.goals.push({
            type: 'goal',
            name,
            startDate,
            endDate,
            milestones: {}
        });

        this.saveData();
        this.updateUI();
        this.hideModals();
        this.vibrate();
        e.target.reset();
    }

    handleEventSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('eventName').value;
        // Преобразуем введенную дату в Варшавское время
        const localDate = new Date(document.getElementById('eventDateTime').value);
        const date = new Date(localDate.toLocaleString("en-US", {timeZone: "Europe/Warsaw"}));
        
        this.events.push({
            type: 'event',
            name,
            date,
            notified: false
        });

        this.saveData();
        this.updateUI();
        this.hideModals();
        this.vibrate();
        e.target.reset();
    }

    updateUI() {
        this.updateGoalsList();
        this.updateEventsList();
        this.updateCounters();
    }

    updateGoalsList() {
        this.goalsList.innerHTML = this.goals.map(goal => {
            const timeElapsed = this.formatTimeElapsed(goal.startDate);
            
            return `
                <div class="goal-item">
                    <button class="delete-cross" onclick="app.deleteGoal('${goal.name}')" title="Удалить"></button>
                    <h3>${goal.name}</h3>
                    <div class="time-info">
                        <p>Прошло:</p>
                        ${timeElapsed}
                    </div>
                </div>
            `;
        }).join('');
    }

    updateEventsList() {
        this.eventsList.innerHTML = this.events.map(event => {
            const timeLeft = this.formatTimeLeft(event.date);
            const progress = this.calculateEventProgress(event);
            
            return `
                <div class="event-item">
                    <button class="delete-cross" onclick="app.deleteEvent('${event.name}')" title="Удалить"></button>
                    <h3>${event.name}</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                        <div class="progress-text">${progress.toFixed(2)}%</div>
                    </div>
                    <div class="time-info">
                        <p>Осталось:</p>
                        ${timeLeft}
                    </div>
                </div>
            `;
        }).join('');
    }

    calculateEventProgress(event) {
        // Получаем текущее время в Варшаве
        const warsawTime = new Date().toLocaleString("en-US", {timeZone: "Europe/Warsaw"});
        const now = new Date(warsawTime);
        const total = event.date - now;
        const elapsed = event.date - now;
        
        // Если событие уже прошло, показываем 100%
        if (elapsed <= 0) return 100;
        
        // Если до события больше 100 дней, используем это как максимум
        const maxDuration = 100 * 24 * 60 * 60 * 1000; // 100 дней в миллисекундах
        const duration = Math.min(total, maxDuration);
        
        return Math.max(0, Math.min(100, ((maxDuration - elapsed) / maxDuration) * 100));
    }

    deleteGoal(name) {
        this.goals = this.goals.filter(goal => goal.name !== name);
        this.saveData();
        this.updateUI();
        this.vibrate();
    }

    deleteEvent(name) {
        this.events = this.events.filter(event => event.name !== name);
        this.saveData();
        this.updateUI();
        this.vibrate();
    }

    formatTimeElapsed(startDate) {
        // Получаем текущее время в Варшаве
        const warsawTime = new Date().toLocaleString("en-US", {timeZone: "Europe/Warsaw"});
        const now = new Date(warsawTime);
        const diff = now - startDate;
        return this.formatDuration(diff);
    }

    formatTimeLeft(date) {
        // Получаем текущее время в Варшаве
        const warsawTime = new Date().toLocaleString("en-US", {timeZone: "Europe/Warsaw"});
        const now = new Date(warsawTime);
        const diff = date - now;
        return this.formatDuration(diff);
    }

    formatDuration(ms) {
        const seconds = Math.floor(Math.abs(ms) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        return `
            <div class="time-display">
                <div class="time-unit">
                    <span>${String(days).padStart(2, '0')}</span>
                    <span>дней</span>
                </div>
                <div class="time-unit">
                    <span>${String(hours % 24).padStart(2, '0')}</span>
                    <span>часов</span>
                </div>
                <div class="time-unit">
                    <span>${String(minutes % 60).padStart(2, '0')}</span>
                    <span>минут</span>
                </div>
                <div class="time-unit">
                    <span>${String(seconds % 60).padStart(2, '0')}</span>
                    <span>секунд</span>
                </div>
            </div>
        `;
    }

    startTimeUpdates() {
        // Обновление времени
        const updateTime = () => {
            const now = new Date();
            
            // Обновляем человекочитаемое время
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            document.getElementById('humanClock').textContent = `${hours}:${minutes}:${seconds}`;
            
            // Обновляем дату
            const options = { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric'
            };
            document.getElementById('humanDate').textContent = now.toLocaleDateString('ru-RU', options);
        };

        // Обновляем время каждую секунду
        updateTime();
        setInterval(updateTime, 1000);

        // Обновляем UI и проверяем события
        setInterval(() => {
            this.updateUI();
            this.checkAchievements();
            this.checkEventProximity();
        }, 1000);
    }

    checkAchievements() {
        this.goals.forEach(goal => {
            const progress = this.calculateProgress(goal);
            const milestones = [
                { value: 25, message: '25% пути пройдено!' },
                { value: 50, message: 'Половина пути пройдена!' },
                { value: 75, message: '75% пути пройдено!' },
                { value: 100, message: 'Цель достигнута!' }
            ];

            milestones.forEach(milestone => {
                if (progress >= milestone.value && !goal.milestones[`milestone${milestone.value}`]) {
                    goal.milestones[`milestone${milestone.value}`] = true;
                    this.showAchievement(`${goal.name}: ${milestone.message}`);
                    this.saveData();
                }
            });
        });
    }

    calculateProgress(goal) {
        const total = goal.endDate - goal.startDate;
        const current = Date.now() - goal.startDate;
        return Math.min(100, (current / total) * 100);
    }

    checkEventProximity() {
        // Получаем текущее время в Варшаве
        const warsawTime = new Date().toLocaleString("en-US", {timeZone: "Europe/Warsaw"});
        const now = new Date(warsawTime);
        
        this.events.forEach(event => {
            const timeLeft = event.date - now;
            if (timeLeft <= 10000 && timeLeft > 0 && !event.notified) {
                event.notified = true;
                this.vibrate();
                this.showAchievement(`${event.name} через 10 секунд!`);
                this.saveData();
            }
        });
    }

    showAchievement(message) {
        document.getElementById('achievementText').textContent = message;
        this.showModal(this.achievementModal);
        this.vibrate();
        setTimeout(() => this.hideModals(), 3000);
    }

    vibrate() {
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }
    }

    // Новые методы для работы с данными
    formatDate(date) {
        // Форматируем дату в Варшавском времени
        return new Date(date).toLocaleString("ru-RU", {
            timeZone: "Europe/Warsaw",
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    generateSimpleFormat() {
        let text = 'Цели:\n';
        this.goals.forEach(goal => {
            text += `${goal.name} \\ ${this.formatDate(goal.startDate)}\n`;
        });
        
        text += '\nСобытия:\n';
        this.events.forEach(event => {
            text += `${event.name} \\ ${this.formatDate(event.date)}\n`;
        });

        // Добавляем закодированные данные для восстановления
        const data = {
            goals: this.goals,
            events: this.events,
            version: '1.0'
        };
        text += `\n[data:${btoa(JSON.stringify(data))}]`;
        
        return text;
    }

    async copyAllData() {
        try {
            const text = this.generateSimpleFormat();
            await navigator.clipboard.writeText(text);
            this.showAchievement('Все данные скопированы');
        } catch (error) {
            this.showError('Ошибка при копировании данных');
        }
    }

    showPasteData() {
        this.dataModal.classList.add('active');
        this.dataField.value = '';
        this.dataField.placeholder = `Вставьте данные в формате:

## Цели
- [<Название цели / YYYY-MM-DDThh:mm]

## События
[>Название события / YYYY-MM-DDThh:mm]`;
    }

    parseDate(dateStr) {
        const [datePart, timePart] = dateStr.trim().split(' ');
        const [day, month, year] = datePart.split('.');
        const [hours, minutes] = timePart ? timePart.split(':') : ['00', '00'];
        return new Date(year, month - 1, day, hours, minutes);
    }

    importData() {
        try {
            const text = this.dataField.value;
            
            // Пытаемся найти закодированные данные
            const match = text.match(/\[data:(.+?)\]/);
            if (match) {
                // Если нашли закодированные данные, используем их
                const data = JSON.parse(atob(match[1]));
                
                this.goals = data.goals.map(goal => ({
                    ...goal,
                    startDate: new Date(goal.startDate),
                    endDate: new Date(goal.endDate)
                }));

                this.events = data.events.map(event => ({
                    ...event,
                    date: new Date(event.date)
                }));
            } else {
                // Если нет закодированных данных, парсим текстовый формат
                this.goals = [];
                this.events = [];
                
                const lines = text.split('\n');
                let currentSection = '';
                
                lines.forEach(line => {
                    line = line.trim();
                    if (line === 'Цели:') {
                        currentSection = 'goals';
                    } else if (line === 'События:') {
                        currentSection = 'events';
                    } else if (line && line.includes('\\')) {
                        const [name, dateStr] = line.split('\\');
                        if (currentSection === 'goals') {
                            const startDate = this.parseDate(dateStr);
                            const endDate = new Date(startDate);
                            endDate.setFullYear(endDate.getFullYear() + 1);
                            this.goals.push({
                                type: 'goal',
                                name: name.trim(),
                                startDate,
                                endDate,
                                milestones: {}
                            });
                        } else if (currentSection === 'events') {
                            this.events.push({
                                type: 'event',
                                name: name.trim(),
                                date: this.parseDate(dateStr),
                                notified: false
                            });
                        }
                    }
                });
            }

            this.saveData();
            this.updateUI();
            this.hideModals();
            this.showAchievement('Данные успешно импортированы');
        } catch (error) {
            console.error('Ошибка при импорте:', error);
            this.showError('Ошибка при импорте данных: ' + error.message);
        }
    }

    showCopyModal() {
        // Обновляем списки для копирования
        this.updateCopyLists();
        this.copyModal.classList.add('active');
    }

    updateCopyLists() {
        // Обновляем список целей
        this.copyGoalsList.innerHTML = this.goals.map(goal => `
            <div class="copy-item">
                <label>
                    <input type="checkbox" name="goal" value="${goal.name}">
                    ${goal.name} (${this.formatDate(goal.startDate)})
                </label>
            </div>
        `).join('');

        // Обновляем список событий
        this.copyEventsList.innerHTML = this.events.map(event => `
            <div class="copy-item">
                <label>
                    <input type="checkbox" name="event" value="${event.name}">
                    ${event.name} (${this.formatDate(event.date)})
                </label>
            </div>
        `).join('');

        // Сбрасываем чекбоксы "Выбрать все"
        this.selectAllGoals.checked = false;
        this.selectAllEvents.checked = false;
    }

    toggleAllCheckboxes(type, checked) {
        const container = type === 'goals' ? this.copyGoalsList : this.copyEventsList;
        container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    async copySelectedData() {
        try {
            // Получаем выбранные цели
            const selectedGoals = Array.from(this.copyGoalsList.querySelectorAll('input[type="checkbox"]:checked'))
                .map(checkbox => this.goals.find(goal => goal.name === checkbox.value))
                .filter(Boolean);

            // Получаем выбранные события
            const selectedEvents = Array.from(this.copyEventsList.querySelectorAll('input[type="checkbox"]:checked'))
                .map(checkbox => this.events.find(event => event.name === checkbox.value))
                .filter(Boolean);

            if (selectedGoals.length === 0 && selectedEvents.length === 0) {
                this.showError('Выберите хотя бы один элемент для копирования');
                return;
            }

            // Генерируем текст для копирования
            let text = '';
            if (selectedGoals.length > 0) {
                text += 'Цели:\n';
                selectedGoals.forEach(goal => {
                    text += `${goal.name} \\ ${this.formatDate(goal.startDate)}\n`;
                });
            }
            
            if (selectedEvents.length > 0) {
                if (text) text += '\n';
                text += 'События:\n';
                selectedEvents.forEach(event => {
                    text += `${event.name} \\ ${this.formatDate(event.date)}\n`;
                });
            }

            // Добавляем закодированные данные
            const data = {
                goals: selectedGoals,
                events: selectedEvents,
                version: '1.0'
            };
            text += `\n[data:${btoa(JSON.stringify(data))}]`;

            // Копируем в буфер обмена
            await navigator.clipboard.writeText(text);
            this.hideModals();
            this.showAchievement('Выбранные элементы скопированы');
        } catch (error) {
            console.error('Ошибка при копировании:', error);
            this.showError('Ошибка при копировании данных');
        }
    }
}

// Initialize the app
const app = new App();

function showCopyNotification() {
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = 'Данные скопированы!';
    document.body.appendChild(notification);
    
    // Показываем уведомление
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Скрываем и удаляем через 2 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Обновляем обработчик копирования
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showCopyNotification();
    } catch (err) {
        console.error('Ошибка при копировании:', err);
    }
} 
