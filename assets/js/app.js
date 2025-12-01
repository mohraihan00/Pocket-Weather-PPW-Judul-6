window.app = {
    state: {
        city: 'Bandar Lampung', // Default city
        lat: -5.4254,
        lon: 105.2580,
        unit: 'celsius', // 'celsius' or 'fahrenheit'
        theme: 'light',
        favorites: JSON.parse(localStorage.getItem('pocketWeatherFavorites')) || []
    },

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.loadTheme();
        this.renderFavorites();
        this.fetchWeather();
        
        // Auto-refresh every 5 minutes
        setInterval(() => this.fetchWeather(), 300000);
    },

    cacheDOM() {
        this.dom = {
            citySearch: document.getElementById('citySearch'),
            searchBtn: document.getElementById('searchBtn'),
            searchResults: document.getElementById('searchResults'),
            favoritesList: document.getElementById('favoritesList'),
            currentWeather: document.getElementById('currentWeather'),
            cityName: document.getElementById('cityName'),
            currentDate: document.getElementById('currentDate'),
            currentTemp: document.getElementById('currentTemp'),
            weatherDesc: document.getElementById('weatherDesc'),
            weatherIcon: document.getElementById('weatherIcon'),
            windSpeed: document.getElementById('windSpeed'),
            humidity: document.getElementById('humidity'),
            visibility: document.getElementById('visibility'),
            forecastGrid: document.getElementById('forecastGrid'),
            unitToggle: document.getElementById('unitToggle'),
            themeToggle: document.getElementById('themeToggle'),
            refreshBtn: document.getElementById('refreshBtn'),
            loadingOverlay: document.querySelector('.loading')
        };
    },

    bindEvents() {
        this.dom.searchBtn.addEventListener('click', () => this.handleSearch());
        this.dom.citySearch.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.handleSearch();
            this.handleAutocomplete(e.target.value);
        });
        
        // Close autocomplete when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.dom.citySearch.contains(e.target)) {
                this.dom.searchResults.classList.add('hidden');
            }
        });

        this.dom.unitToggle.addEventListener('click', () => this.toggleUnit());
        this.dom.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.dom.refreshBtn.addEventListener('click', () => this.fetchWeather());
    },

    async handleSearch() {
        const query = this.dom.citySearch.value.trim();
        if (!query) return;

        try {
            const results = await this.searchCity(query);
            if (results && results.length > 0) {
                const city = results[0];
                this.updateCity(city);
                this.dom.citySearch.value = '';
                this.dom.searchResults.classList.add('hidden');
            } else {
                alert('City not found');
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    },

    async handleAutocomplete(query) {
        if (query.length < 3) {
            this.dom.searchResults.classList.add('hidden');
            return;
        }

        const results = await this.searchCity(query);
        this.renderAutocomplete(results);
    },

    async searchCity(query) {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
        const response = await fetch(url);
        const data = await response.json();
        return data.results || [];
    },

    renderAutocomplete(results) {
        if (!results || results.length === 0) {
            this.dom.searchResults.classList.add('hidden');
            return;
        }

        this.dom.searchResults.innerHTML = results.map(city => `
            <div class="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center" 
                 data-lat="${city.latitude}" 
                 data-lon="${city.longitude}"
                 data-name="${city.name}"
                 data-country="${city.country}">
                <span>${city.name}, ${city.country}</span>
                <i class="fa-solid fa-chevron-right text-xs opacity-50"></i>
            </div>
        `).join('');

        this.dom.searchResults.classList.remove('hidden');

        // Add click listeners to items
        this.dom.searchResults.querySelectorAll('div').forEach(item => {
            item.addEventListener('click', () => {
                const city = {
                    name: item.dataset.name,
                    latitude: item.dataset.lat,
                    longitude: item.dataset.lon,
                    country: item.dataset.country
                };
                this.updateCity(city);
                this.dom.citySearch.value = '';
                this.dom.searchResults.classList.add('hidden');
            });
        });
    },

    updateCity(city) {
        this.state.city = city.name;
        this.state.lat = city.latitude;
        this.state.lon = city.longitude;
        this.addToFavorites(city);
        this.fetchWeather();
    },

    async fetchWeather() {
        this.dom.loadingOverlay.classList.remove('hidden');
        
        try {
            const unitParam = this.state.unit === 'fahrenheit' ? '&temperature_unit=fahrenheit' : '';
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${this.state.lat}&longitude=${this.state.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto${unitParam}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            this.renderCurrent(data.current);
            this.renderForecast(data.daily);
        } catch (error) {
            console.error('Weather fetch error:', error);
            alert('Failed to fetch weather data.');
        } finally {
            this.dom.loadingOverlay.classList.add('hidden');
        }
    },

    renderCurrent(current) {
        this.dom.cityName.textContent = this.state.city;
        this.dom.currentDate.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        this.dom.currentTemp.textContent = `${Math.round(current.temperature_2m)}°`;
        this.dom.windSpeed.textContent = `${current.wind_speed_10m} km/h`;
        this.dom.humidity.textContent = `${current.relative_humidity_2m}%`;
        this.dom.visibility.textContent = `${(current.visibility / 1000).toFixed(1)} km`;
        
        const weatherInfo = this.getWeatherInfo(current.weather_code);
        this.dom.weatherDesc.textContent = weatherInfo.desc;
        this.dom.weatherIcon.className = `fa-solid ${weatherInfo.icon} text-6xl`;
    },

    renderForecast(daily) {
        this.dom.forecastGrid.innerHTML = daily.time.slice(0, 5).map((time, index) => {
            const maxTemp = Math.round(daily.temperature_2m_max[index]);
            const minTemp = Math.round(daily.temperature_2m_min[index]);
            const code = daily.weather_code[index];
            const info = this.getWeatherInfo(code);
            const date = new Date(time).toLocaleDateString('en-US', { weekday: 'short' });

            return `
                <div class="weather-card bg-white dark:bg-slate-800 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition cursor-default">
                    <p class="font-bold text-blossom-blue dark:text-blossom-white mb-2">${date}</p>
                    <i class="fa-solid ${info.icon} text-3xl mb-3 text-blossom-accent weather-icon"></i>
                    <div class="flex justify-center gap-2 text-sm">
                        <span class="font-bold">${maxTemp}°</span>
                        <span class="opacity-60">${minTemp}°</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    getWeatherInfo(code) {
        // WMO Weather interpretation codes (WW)
        const codes = {
            0: { desc: 'Clear sky', icon: 'fa-sun' },
            1: { desc: 'Mainly clear', icon: 'fa-cloud-sun' },
            2: { desc: 'Partly cloudy', icon: 'fa-cloud-sun' },
            3: { desc: 'Overcast', icon: 'fa-cloud' },
            45: { desc: 'Fog', icon: 'fa-smog' },
            48: { desc: 'Depositing rime fog', icon: 'fa-smog' },
            51: { desc: 'Light drizzle', icon: 'fa-cloud-rain' },
            53: { desc: 'Moderate drizzle', icon: 'fa-cloud-rain' },
            55: { desc: 'Dense drizzle', icon: 'fa-cloud-rain' },
            61: { desc: 'Slight rain', icon: 'fa-cloud-showers-heavy' },
            63: { desc: 'Moderate rain', icon: 'fa-cloud-showers-heavy' },
            65: { desc: 'Heavy rain', icon: 'fa-cloud-showers-heavy' },
            71: { desc: 'Slight snow', icon: 'fa-snowflake' },
            73: { desc: 'Moderate snow', icon: 'fa-snowflake' },
            75: { desc: 'Heavy snow', icon: 'fa-snowflake' },
            95: { desc: 'Thunderstorm', icon: 'fa-bolt' },
        };
        return codes[code] || { desc: 'Unknown', icon: 'fa-cloud' };
    },

    toggleUnit() {
        this.state.unit = this.state.unit === 'celsius' ? 'fahrenheit' : 'celsius';
        this.dom.unitToggle.textContent = this.state.unit === 'celsius' ? '°C' : '°F';
        this.fetchWeather();
    },

    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark');
        this.dom.themeToggle.innerHTML = this.state.theme === 'light' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    },

    loadTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.state.theme = 'dark';
            document.documentElement.classList.add('dark');
            this.dom.themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    },

    addToFavorites(city) {
        // Check if already exists
        if (!this.state.favorites.some(f => f.name === city.name)) {
            this.state.favorites.unshift(city);
            if (this.state.favorites.length > 5) this.state.favorites.pop(); // Keep max 5
            localStorage.setItem('pocketWeatherFavorites', JSON.stringify(this.state.favorites));
            this.renderFavorites();
        }
    },

    renderFavorites() {
        if (this.state.favorites.length === 0) {
            this.dom.favoritesList.innerHTML = '<li class="text-sm opacity-60 italic">No favorites yet.</li>';
            return;
        }

        this.dom.favoritesList.innerHTML = this.state.favorites.map(city => `
            <li class="flex justify-between items-center bg-white/50 dark:bg-slate-700/50 p-3 rounded-xl cursor-pointer hover:bg-white/80 dark:hover:bg-slate-700 transition group">
                <span class="font-medium" onclick="app.updateCity({name: '${city.name}', latitude: ${city.latitude}, longitude: ${city.longitude}})">${city.name}</span>
                <button onclick="app.removeFavorite('${city.name}', event)" class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </li>
        `).join('');
    },

    removeFavorite(name, event) {
        if (event) event.stopPropagation();
        this.state.favorites = this.state.favorites.filter(f => f.name !== name);
        localStorage.setItem('pocketWeatherFavorites', JSON.stringify(this.state.favorites));
        this.renderFavorites();
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => app.init());
