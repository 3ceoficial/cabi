class MiJornadaPro {
    constructor() {
        this.timer = {
            startTime: null,
            pausedTime: 0,
            interval: null,
            isRunning: false,
            isPaused: false
        };

        this.settings = {
            tarifaInicial: 728.00,
            precioKm: 247.00,
            precioMinuto: 106.00,
            tarifaMinima: 1457.00,
            comision: 25.00
        };

        this.wakeLock = null;

        this.init();
    }

    init() {
        this.loadSettings();
        this.restoreTimerState();
        this.setupEventListeners();
        this.setupPageVisibilityHandlers();
        this.updateTodayStats();
        this.updateReports();
        this.loadHistory();
        this.updateTimer();
        this.startPersistentTimer();
    }

    // Timer State Persistence
    restoreTimerState() {
        const savedState = localStorage.getItem('timerState');
        if (savedState) {
            const state = JSON.parse(savedState);
            
            if (state.isRunning) {
                const now = Date.now();
                const elapsedSinceLastUpdate = now - state.lastUpdate;
                
                this.timer.isRunning = true;
                this.timer.isPaused = state.isPaused;
                this.timer.startTime = state.startTime;
                this.timer.pausedTime = state.pausedTime;
                
                // Si no está pausado, agregar el tiempo que pasó mientras la app estaba cerrada
                if (!state.isPaused) {
                    this.timer.startTime = state.startTime;
                    this.updateTimerControls();
                    this.updateStatus('working');
                    this.showBackgroundTimerBadge();
                    this.requestWakeLock();
                } else {
                    this.updateTimerControls();
                    this.updateStatus('paused');
                    document.getElementById('pause-btn').innerHTML = '<i class="fas fa-play"></i> Reanudar';
                }
                
                this.showNotification('¡Jornada restaurada! El cronómetro siguió funcionando en segundo plano', 'background');
            }
        }
    }

    saveTimerState() {
        const state = {
            isRunning: this.timer.isRunning,
            isPaused: this.timer.isPaused,
            startTime: this.timer.startTime,
            pausedTime: this.timer.pausedTime,
            lastUpdate: Date.now()
        };
        localStorage.setItem('timerState', JSON.stringify(state));
    }

    clearTimerState() {
        localStorage.removeItem('timerState');
    }

    setupPageVisibilityHandlers() {
        // Guardar estado cuando la página se oculta
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.timer.isRunning && !this.timer.isPaused) {
                this.saveTimerState();
                console.log('Aplicación en segundo plano - Estado guardado');
            } else if (!document.hidden && this.timer.isRunning && !this.timer.isPaused) {
                // La aplicación vuelve a estar activa
                this.updateTimer();
                console.log('Aplicación activa - Cronómetro actualizado');
            }
        });

        // Guardar estado antes de cerrar la ventana
        window.addEventListener('beforeunload', () => {
            this.saveTimerState();
        });

        // Detectar cuando la aplicación se cierra/minimiza en móviles
        window.addEventListener('pagehide', () => {
            this.saveTimerState();
        });

        // Detectar cuando la aplicación vuelve a estar visible en móviles
        window.addEventListener('pageshow', (event) => {
            if (event.persisted && this.timer.isRunning) {
                this.updateTimer();
                if (!this.timer.isPaused) {
                    this.showBackgroundTimerBadge();
                }
            }
        });
    }

    startPersistentTimer() {
        // Cronómetro que se actualiza cada segundo
        setInterval(() => {
            if (this.timer.isRunning && !this.timer.isPaused) {
                this.updateTimer();
                // Guardar estado cada 5 segundos para mayor seguridad
                if (Date.now() % 5000 < 1000) {
                    this.saveTimerState();
                }
            }
        }, 1000);

        // Respaldo adicional: guardar estado cada 30 segundos
        setInterval(() => {
            if (this.timer.isRunning) {
                this.saveTimerState();
            }
        }, 30000);
    }

    // Wake Lock Functions
    async requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake Lock activado - La pantalla se mantendrá activa');
                
                this.wakeLock.addEventListener('release', () => {
                    console.log('Wake Lock liberado');
                });
            } catch (err) {
                console.log('Error al activar Wake Lock:', err);
            }
        }
    }

    releaseWakeLock() {
        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
            console.log('Wake Lock liberado manualmente');
        }
    }

    // Background Timer Badge
    showBackgroundTimerBadge() {
        const badge = document.getElementById('background-timer-badge');
        badge.classList.add('active');
    }

    hideBackgroundTimerBadge() {
        const badge = document.getElementById('background-timer-badge');
        badge.classList.remove('active');
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Timer controls
        document.getElementById('start-btn').addEventListener('click', () => this.startTimer());
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseTimer());
        document.getElementById('stop-btn').addEventListener('click', () => this.showFinishModal());

        // Quick trip
        document.getElementById('add-trip-btn').addEventListener('click', () => this.addQuickTrip());

        // Settings
        document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());
        document.getElementById('export-data').addEventListener('click', () => this.exportData());
        document.getElementById('clear-data').addEventListener('click', () => this.clearAllData());

        // Modal
        document.getElementById('close-modal').addEventListener('click', () => this.hideFinishModal());
        document.getElementById('confirm-finish').addEventListener('click', () => this.finishJourney());
        document.getElementById('cancel-finish').addEventListener('click', () => this.hideFinishModal());

        // Real-time calculation in modal
        document.getElementById('modal-km').addEventListener('input', () => this.updateModalSummary());
        document.getElementById('modal-trips').addEventListener('input', () => this.updateModalSummary());

        // Report period change
        document.getElementById('report-period').addEventListener('change', () => this.updateReports());

        // History filter
        document.getElementById('filter-date').addEventListener('change', () => this.loadHistory());
        document.getElementById('clear-filter').addEventListener('click', () => {
            document.getElementById('filter-date').value = '';
            this.loadHistory();
        });
    }

    // Tab Navigation
    switchTab(tabName) {
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Update reports if reports tab is opened
        if (tabName === 'reports') {
            this.updateReports();
        }
    }

    // Timer Functions
    startTimer() {
        if (!this.timer.isRunning) {
            this.timer.startTime = Date.now() - this.timer.pausedTime;
            this.timer.isRunning = true;
            this.timer.isPaused = false;
            
            this.updateTimerControls();
            this.updateStatus('working');
            this.saveTimerState();
            this.requestWakeLock();
            this.showBackgroundTimerBadge();
            
            this.showNotification('¡Jornada iniciada! El cronómetro funcionará en segundo plano', 'success');
        }
    }

    pauseTimer() {
        if (this.timer.isRunning && !this.timer.isPaused) {
            this.timer.isPaused = true;
            this.timer.pausedTime = Date.now() - this.timer.startTime;
            
            document.getElementById('pause-btn').innerHTML = '<i class="fas fa-play"></i> Reanudar';
            this.updateStatus('paused');
            this.saveTimerState();
            this.releaseWakeLock();
            this.hideBackgroundTimerBadge();
            
            this.showNotification('Cronómetro pausado', 'warning');
        } else if (this.timer.isPaused) {
            this.timer.startTime = Date.now() - this.timer.pausedTime;
            this.timer.isPaused = false;
            
            document.getElementById('pause-btn').innerHTML = '<i class="fas fa-pause"></i> Pausar';
            this.updateStatus('working');
            this.saveTimerState();
            this.requestWakeLock();
            this.showBackgroundTimerBadge();
            
            this.showNotification('Cronómetro reanudado', 'success');
        }
    }

    updateTimer() {
        const display = document.getElementById('timer-display');
        
        if (this.timer.isRunning && !this.timer.isPaused) {
            const elapsed = Date.now() - this.timer.startTime;
            display.textContent = this.formatTime(elapsed);
        } else if (this.timer.isPaused) {
            display.textContent = this.formatTime(this.timer.pausedTime);
        }
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateTimerControls() {
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const stopBtn = document.getElementById('stop-btn');
        
        if (this.timer.isRunning) {
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-flex';
            stopBtn.style.display = 'inline-flex';
        } else {
            startBtn.style.display = 'inline-flex';
            pauseBtn.style.display = 'none';
            stopBtn.style.display = 'none';
        }
    }

    updateStatus(status) {
        const indicator = document.getElementById('status-indicator');
        const text = document.getElementById('status-text');
        
        indicator.className = `status-indicator ${status}`;
        
        switch(status) {
            case 'working':
                text.textContent = 'Trabajando';
                break;
            case 'paused':
                text.textContent = 'En Pausa';
                break;
            default:
                text.textContent = 'Descanso';
                break;
        }
    }

    // Modal Functions
    showFinishModal() {
        const modal = document.getElementById('trip-modal');
        const duration = this.timer.isRunning ? Date.now() - this.timer.startTime : this.timer.pausedTime;
        
        document.getElementById('summary-duration').textContent = this.formatTime(duration);
        this.updateModalSummary();
        
        modal.classList.add('active');
    }

    hideFinishModal() {
        document.getElementById('trip-modal').classList.remove('active');
        document.getElementById('modal-km').value = '';
        document.getElementById('modal-trips').value = '1';
    }

    updateModalSummary() {
        const km = parseFloat(document.getElementById('modal-km').value) || 0;
        const trips = parseInt(document.getElementById('modal-trips').value) || 1;
        const duration = this.timer.isRunning ? Date.now() - this.timer.startTime : this.timer.pausedTime;
        const minutes = Math.floor(duration / 60000);
        
        const earnings = this.calculateEarnings(km, minutes, trips);
        
        document.getElementById('summary-gross').textContent = `$${earnings.gross.toFixed(2)}`;
        document.getElementById('summary-commission').textContent = `$${earnings.commission.toFixed(2)}`;
        document.getElementById('summary-net').textContent = `$${earnings.net.toFixed(2)}`;
    }

    finishJourney() {
        const km = parseFloat(document.getElementById('modal-km').value) || 0;
        const trips = parseInt(document.getElementById('modal-trips').value) || 1;
        const endTime = Date.now();
        const duration = this.timer.isRunning ? endTime - this.timer.startTime : this.timer.pausedTime;
        const minutes = Math.floor(duration / 60000);
        
        const earnings = this.calculateEarnings(km, minutes, trips);
        
        const journey = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            startTime: new Date(endTime - duration).toISOString(),
            endTime: new Date(endTime).toISOString(),
            duration: duration,
            kilometers: km,
            trips: trips,
            grossEarnings: earnings.gross,
            commission: earnings.commission,
            netEarnings: earnings.net
        };
        
        this.saveJourney(journey);
        this.resetTimer();
        this.hideFinishModal();
        this.updateTodayStats();
        this.loadHistory();
        
        this.showNotification('¡Jornada finalizada exitosamente!');
    }

    resetTimer() {
        clearInterval(this.timer.interval);
        this.timer = {
            startTime: null,
            pausedTime: 0,
            interval: null,
            isRunning: false,
            isPaused: false
        };
        
        this.clearTimerState();
        this.releaseWakeLock();
        this.hideBackgroundTimerBadge();
        document.getElementById('timer-display').textContent = '00:00:00';
        this.updateTimerControls();
        this.updateStatus('rest');
    }

    // Quick Trip Function
    addQuickTrip() {
        const km = parseFloat(document.getElementById('trip-km').value);
        const minutes = parseInt(document.getElementById('trip-minutes').value);
        
        if (!km || !minutes) {
            this.showNotification('Por favor, completa todos los campos', 'error');
            return;
        }
        
        const earnings = this.calculateEarnings(km, minutes, 1);
        const now = new Date();
        
        const journey = {
            id: Date.now(),
            date: now.toISOString().split('T')[0],
            startTime: new Date(now.getTime() - (minutes * 60000)).toISOString(),
            endTime: now.toISOString(),
            duration: minutes * 60000,
            kilometers: km,
            trips: 1,
            grossEarnings: earnings.gross,
            commission: earnings.commission,
            netEarnings: earnings.net,
            isQuickEntry: true
        };
        
        this.saveJourney(journey);
        
        // Clear form
        document.getElementById('trip-km').value = '';
        document.getElementById('trip-minutes').value = '';
        
        this.updateTodayStats();
        this.loadHistory();
        this.showNotification('¡Viaje registrado exitosamente!');
    }

    // Calculation Functions
    calculateEarnings(kilometers, minutes, trips = 1) {
        // Calculate per trip
        const costPerDistance = kilometers * this.settings.precioKm;
        const costPerTime = minutes * this.settings.precioMinuto;
        const subtotalGross = this.settings.tarifaInicial + costPerDistance + costPerTime;
        
        // Apply minimum fare
        const grossPerTrip = Math.max(subtotalGross, this.settings.tarifaMinima);
        const totalGross = grossPerTrip * trips;
        
        // Calculate commission
        const commission = totalGross * (this.settings.comision / 100);
        const net = totalGross - commission;
        
        return {
            gross: totalGross,
            commission: commission,
            net: net
        };
    }

    // Data Management
    saveJourney(journey) {
        let journeys = JSON.parse(localStorage.getItem('journeys')) || [];
        journeys.push(journey);
        localStorage.setItem('journeys', JSON.stringify(journeys));
    }

    getJourneys(filterDate = null) {
        let journeys = JSON.parse(localStorage.getItem('journeys')) || [];
        
        if (filterDate) {
            journeys = journeys.filter(journey => journey.date === filterDate);
        }
        
        return journeys.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    }

    // Statistics Functions
    updateTodayStats() {
        const today = new Date().toISOString().split('T')[0];
        const todayJourneys = this.getJourneys(today);
        
        const totalHours = todayJourneys.reduce((sum, journey) => sum + (journey.duration / 3600000), 0);
        const totalKm = todayJourneys.reduce((sum, journey) => sum + journey.kilometers, 0);
        const totalEarnings = todayJourneys.reduce((sum, journey) => sum + journey.netEarnings, 0);
        const totalTrips = todayJourneys.reduce((sum, journey) => sum + journey.trips, 0);
        
        document.getElementById('today-hours').textContent = `${totalHours.toFixed(1)}h`;
        document.getElementById('today-km').textContent = `${totalKm.toFixed(1)} km`;
        document.getElementById('today-earnings').textContent = `$${totalEarnings.toFixed(2)}`;
        document.getElementById('today-trips').textContent = totalTrips;
    }

    updateReports() {
        const period = document.getElementById('report-period').value;
        const journeys = this.getJourneysForPeriod(period);
        
        const totalHours = journeys.reduce((sum, journey) => sum + (journey.duration / 3600000), 0);
        const totalKm = journeys.reduce((sum, journey) => sum + journey.kilometers, 0);
        const totalEarnings = journeys.reduce((sum, journey) => sum + journey.netEarnings, 0);
        const totalTrips = journeys.reduce((sum, journey) => sum + journey.trips, 0);
        
        // Update period totals
        document.getElementById('period-hours').textContent = `${totalHours.toFixed(1)}h`;
        document.getElementById('period-km').textContent = `${totalKm.toFixed(1)} km`;
        document.getElementById('period-earnings').textContent = `$${totalEarnings.toFixed(2)}`;
        document.getElementById('period-trips').textContent = totalTrips;
        
        // Calculate averages
        const avgPerHour = totalHours > 0 ? totalEarnings / totalHours : 0;
        const avgPerKm = totalKm > 0 ? totalEarnings / totalKm : 0;
        const avgPerTrip = totalTrips > 0 ? totalEarnings / totalTrips : 0;
        
        // Get unique days
        const uniqueDays = new Set(journeys.map(j => j.date)).size;
        const avgHoursPerDay = uniqueDays > 0 ? totalHours / uniqueDays : 0;
        
        document.getElementById('avg-per-hour').textContent = `$${avgPerHour.toFixed(2)}/h`;
        document.getElementById('avg-per-km').textContent = `$${avgPerKm.toFixed(2)}/km`;
        document.getElementById('avg-per-trip').textContent = `$${avgPerTrip.toFixed(2)}`;
        document.getElementById('avg-hours-day').textContent = `${avgHoursPerDay.toFixed(1)}h`;
    }

    getJourneysForPeriod(period) {
        const now = new Date();
        let startDate;
        
        switch(period) {
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
                break;
            default:
                return this.getJourneys();
        }
        
        const startDateStr = startDate.toISOString().split('T')[0];
        return this.getJourneys().filter(journey => journey.date >= startDateStr);
    }

    // History Functions
    loadHistory() {
        const filterDate = document.getElementById('filter-date').value;
        const journeys = this.getJourneys(filterDate);
        const historyList = document.getElementById('history-list');
        
        if (journeys.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No hay jornadas registradas</h3>
                    <p>${filterDate ? 'No se encontraron jornadas para la fecha seleccionada' : 'Comienza tu primera jornada para ver el historial'}</p>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = journeys.map(journey => `
            <div class="history-item">
                <div class="history-header">
                    <span class="history-date">
                        ${new Date(journey.startTime).toLocaleDateString('es-ES', { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short' 
                        })}
                        ${journey.isQuickEntry ? '<i class="fas fa-bolt" title="Entrada rápida"></i>' : ''}
                    </span>
                    <span class="history-earnings">$${journey.netEarnings.toFixed(2)}</span>
                </div>
                <div class="history-details">
                    <span><i class="fas fa-clock"></i> ${this.formatTime(journey.duration)}</span>
                    <span><i class="fas fa-road"></i> ${journey.kilometers.toFixed(1)} km</span>
                    <span><i class="fas fa-route"></i> ${journey.trips} viaje${journey.trips > 1 ? 's' : ''}</span>
                </div>
            </div>
        `).join('');
    }

    // Settings Functions
    loadSettings() {
        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        
        // Update form with current settings
        document.getElementById('tarifa-inicial').value = this.settings.tarifaInicial;
        document.getElementById('precio-km').value = this.settings.precioKm;
        document.getElementById('precio-minuto').value = this.settings.precioMinuto;
        document.getElementById('tarifa-minima').value = this.settings.tarifaMinima;
        document.getElementById('comision').value = this.settings.comision;
    }

    saveSettings() {
        this.settings = {
            tarifaInicial: parseFloat(document.getElementById('tarifa-inicial').value),
            precioKm: parseFloat(document.getElementById('precio-km').value),
            precioMinuto: parseFloat(document.getElementById('precio-minuto').value),
            tarifaMinima: parseFloat(document.getElementById('tarifa-minima').value),
            comision: parseFloat(document.getElementById('comision').value)
        };
        
        localStorage.setItem('settings', JSON.stringify(this.settings));
        this.showNotification('¡Configuración guardada exitosamente!');
    }

    // Data Export/Import
    exportData() {
        const data = {
            journeys: this.getJourneys(),
            settings: this.settings,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `mi-jornada-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        this.showNotification('¡Datos exportados exitosamente!');
    }

    clearAllData() {
        if (confirm('¿Estás seguro de que deseas borrar todos los datos? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('journeys');
            localStorage.removeItem('settings');
            
            this.resetTimer();
            this.settings = {
                tarifaInicial: 728.00,
                precioKm: 247.00,
                precioMinuto: 106.00,
                tarifaMinima: 1457.00,
                comision: 25.00
            };
            
            this.loadSettings();
            this.updateTodayStats();
            this.updateReports();
            this.loadHistory();
            
            this.showNotification('Todos los datos han sido borrados');
        }
    }

    // Utility Functions
    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MiJornadaPro();
    
    // Register Service Worker for PWA functionality
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered successfully:', registration.scope);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }
    
    // PWA Install prompt
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('PWA: Install prompt available');
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button or banner (could be implemented in future)
        console.log('PWA: Ready to install');
    });
    
    window.addEventListener('appinstalled', (evt) => {
        console.log('PWA: App was installed');
    });
});