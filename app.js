// Weather Dashboard App
class WeatherDashboard {
    constructor() {
        this.map = null;
        this.currentMarker = null;
        this.chart = null;
        this.apiKey = 'demo_key'; // We'll use demo data for now
        this.init();
    }

    // Initialize the dashboard
    init() {
        this.initMap();
        this.bindEvents();
        console.log('🌦️ Weather Dashboard initialized!');
    }

    // Initialize Leaflet map
    initMap() {
        // Create map centered on London
        this.map = L.map('map').setView([51.505, -0.09], 10);

        // Add CartoDB professional tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap © CartoDB',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);
        // Add click event to map
        this.map.on('click', (e) => {
            this.getWeatherForLocation(e.latlng.lat, e.latlng.lng);
        });

        // Add some demo markers for major cities
        this.addDemoCities();
    }

    // Add demo city markers
    addDemoCities() {
        const cities = [
            { name: 'London', lat: 51.505, lng: -0.09, temp: '22°C', desc: 'Partly cloudy' },
            { name: 'Paris', lat: 48.8566, lng: 2.3522, temp: '25°C', desc: 'Sunny' },
            { name: 'Berlin', lat: 52.5200, lng: 13.4050, temp: '18°C', desc: 'Rainy' },
            { name: 'Madrid', lat: 40.4168, lng: -3.7038, temp: '28°C', desc: 'Clear sky' },
            { name: 'Rome', lat: 41.9028, lng: 12.4964, temp: '26°C', desc: 'Few clouds' }
        ];

        cities.forEach(city => {
            const marker = L.marker([city.lat, city.lng])
                .addTo(this.map)
                .bindPopup(`
                    <div class="popup-weather">
                        <h4>📍 ${city.name}</h4>
                        <div class="popup-temp">${city.temp}</div>
                        <div class="popup-desc">${city.desc}</div>
                        <small>Click for detailed forecast</small>
                    </div>
                `);

            // Add click event to marker
            marker.on('click', () => {
                this.showCityWeather(city);
            });
        });
    }

    // Bind DOM events
    bindEvents() {
        // Search button
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.searchCity();
        });

        // Enter key in search box
        document.getElementById('citySearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchCity();
            }
        });

        // Locate user button
        document.getElementById('locateBtn').addEventListener('click', () => {
            this.locateUser();
        });

        // Layer toggle button
        document.getElementById('layerBtn').addEventListener('click', () => {
            this.toggleWeatherLayer();
        });
    }

    // Get weather for clicked location
    getWeatherForLocation(lat, lng) {
        // Remove previous marker
        if (this.currentMarker) {
            this.map.removeLayer(this.currentMarker);
        }

        // Add new marker
        this.currentMarker = L.marker([lat, lng]).addTo(this.map);

        // Show loading
        this.showLoading();

        // Simulate API call with demo data
        setTimeout(() => {
            const demoWeather = this.generateDemoWeather(lat, lng);
            this.displayWeather(demoWeather);
            this.updateChart(demoWeather.forecast);
        }, 1000);
    }

    // Generate demo weather data
    generateDemoWeather(lat, lng) {
        const temps = [15, 18, 22, 25, 28, 24, 20];
        const descriptions = ['Sunny', 'Partly cloudy', 'Cloudy', 'Light rain', 'Clear sky'];
        const currentTemp = temps[Math.floor(Math.random() * temps.length)];

        return {
            location: {
                name: `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
                coordinates: { lat, lng }
            },
            current: {
                temperature: currentTemp,
                feelsLike: currentTemp + 2,
                humidity: Math.floor(Math.random() * 40) + 40,
                pressure: Math.floor(Math.random() * 50) + 1000,
                description: descriptions[Math.floor(Math.random() * descriptions.length)],
                windSpeed: Math.floor(Math.random() * 15) + 3,
                visibility: Math.floor(Math.random() * 5) + 5
            },
            forecast: this.generateForecast()
        };
    }

    // Generate demo forecast data
    generateForecast() {
        const forecast = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            forecast.push({
                date: date.toLocaleDateString(),
                temperature: Math.floor(Math.random() * 15) + 15,
                humidity: Math.floor(Math.random() * 40) + 40,
                description: i === 0 ? 'Today' : date.toLocaleDateString('en', { weekday: 'short' })
            });
        }

        return forecast;
    }

    // Display weather information
    displayWeather(weather) {
        const weatherDiv = document.getElementById('currentWeather');

        weatherDiv.innerHTML = `
            <div class="weather-location">
                <h4>📍 ${weather.location.name}</h4>
            </div>
            <div class="temperature">${weather.current.temperature}°C</div>
            <div class="weather-description">${weather.current.description}</div>
            
            <div class="weather-detail">
                <span>Feels like:</span>
                <strong>${weather.current.feelsLike}°C</strong>
            </div>
            <div class="weather-detail">
                <span>Humidity:</span>
                <strong>${weather.current.humidity}%</strong>
            </div>
            <div class="weather-detail">
                <span>Pressure:</span>
                <strong>${weather.current.pressure} hPa</strong>
            </div>
            <div class="weather-detail">
                <span>Wind:</span>
                <strong>${weather.current.windSpeed} km/h</strong>
            </div>
            <div class="weather-detail">
                <span>Visibility:</span>
                <strong>${weather.current.visibility} km</strong>
            </div>
        `;
    }

    // Update forecast chart
    updateChart(forecastData) {
        const ctx = document.getElementById('forecastChart').getContext('2d');

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Create new chart
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: forecastData.map(item => item.description),
                datasets: [{
                    label: 'Temperature (°C)',
                    data: forecastData.map(item => item.temperature),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Search for city
    searchCity() {
        const query = document.getElementById('citySearch').value.trim();
        if (!query) return;

        // Demo city search
        const demoCities = {
            'london': { lat: 51.505, lng: -0.09 },
            'paris': { lat: 48.8566, lng: 2.3522 },
            'berlin': { lat: 52.5200, lng: 13.4050 },
            'madrid': { lat: 40.4168, lng: -3.7038 },
            'rome': { lat: 41.9028, lng: 12.4964 },
            'new york': { lat: 40.7128, lng: -74.0060 },
            'tokyo': { lat: 35.6762, lng: 139.6503 }
        };

        const city = demoCities[query.toLowerCase()];
        if (city) {
            this.map.setView([city.lat, city.lng], 12);
            this.getWeatherForLocation(city.lat, city.lng);
            document.getElementById('citySearch').value = '';
        } else {
            alert('City not found. Try: London, Paris, Berlin, Madrid, Rome, New York, Tokyo');
        }
    }

    // Locate user
    locateUser() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    this.map.setView([lat, lng], 12);
                    this.getWeatherForLocation(lat, lng);
                },
                (error) => {
                    alert('Location access denied. Showing London instead.');
                    this.map.setView([51.505, -0.09], 12);
                }
            );
        } else {
            alert('Geolocation not supported by browser.');
        }
    }

    // Toggle weather layer (demo)
    toggleWeatherLayer() {
        alert('Weather layers feature - coming soon!\nWill show temperature, precipitation, and wind overlays.');
    }

    // Show loading state
    showLoading() {
        document.getElementById('currentWeather').innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div class="loading"></div>
                <p style="margin-top: 1rem;">Loading weather data...</p>
            </div>
        `;
    }

    // Show city weather (for marker clicks)
    showCityWeather(city) {
        this.map.setView([city.lat, city.lng], 12);
        this.getWeatherForLocation(city.lat, city.lng);
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new WeatherDashboard();
});