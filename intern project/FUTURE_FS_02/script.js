const cityinput = document.querySelector('.city-input');
const searchbtn = document.querySelector('.search-btn');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');
const weatherInfoSection = document.querySelector('.weather-info');
const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityTxt = document.querySelector('.humidity-value-txt');
const windTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-icon');
const currentDateTxt = document.querySelector('.current-date-txt');
const forecastItemsContainer = document.querySelector('.forecast-container');
const toggleFavoritesBtn = document.querySelector('.toggle-favorites');
const favoritesList = document.querySelector('#favoritesList');
const addFavoriteBtn = document.querySelector('.add-favorite-btn');

const apikey = 'f92176c776029e3ee11398e6a7f384f4';

let currentCity = '';
let favoriteCities = [];

function initializeFavorites() {
    renderFavorites();
}

initializeFavorites();


toggleFavoritesBtn.addEventListener('click', () => {
    const icon = toggleFavoritesBtn.querySelector('.material-symbols-outlined');
    favoritesList.classList.toggle('show');
    icon.textContent = favoritesList.classList.contains('show') ? 'expand_less' : 'expand_more';
});


addFavoriteBtn?.addEventListener('click', () => {
    if (currentCity && !favoriteCities.includes(currentCity)) {
        favoriteCities.push(currentCity);
        renderFavorites();
        updateFavoriteButton();
    }
});


function updateFavoriteButton() {
    if (!addFavoriteBtn) return;

    const icon = addFavoriteBtn.querySelector('.material-symbols-outlined');
    if (!icon) return;

    if (favoriteCities.includes(currentCity)) {
        addFavoriteBtn.classList.add('active');
        addFavoriteBtn.disabled = true;
        icon.textContent = 'star'; 
    } else {
        addFavoriteBtn.classList.remove('active');
        addFavoriteBtn.disabled = false;
        icon.textContent = 'star_border'; 
    }
}


function renderFavorites() {
    favoritesList.innerHTML = '';
    favoriteCities.forEach(city => {
        const cityElement = document.createElement('div');
        cityElement.className = 'favorite-city';
        cityElement.innerHTML = `
            <span class="city-name">${city}</span>
            <button class="remove-favorite" title="Remove from favorites">×</button>
        `;

        cityElement.querySelector('.city-name').addEventListener('click', () => {
            updateWeatherInfo(city);
        });

        cityElement.querySelector('.remove-favorite').addEventListener('click', () => {
            favoriteCities = favoriteCities.filter(fav => fav !== city);
            renderFavorites();
            updateFavoriteButton();
        });

        favoritesList.appendChild(cityElement);
    });
}


searchbtn.addEventListener('click', () => {
    if (cityinput.value.trim() !== '') {
        updateWeatherInfo(cityinput.value.trim());
        cityinput.value = '';
        cityinput.blur();
    }
});

cityinput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && cityinput.value.trim() !== '') {
        updateWeatherInfo(cityinput.value.trim());
        cityinput.value = '';
        cityinput.blur();
    }
});


async function getFetchData(endPoint, city) {
    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apikey}&units=metric`;
        const response = await fetch(apiUrl);
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return { cod: 'error', message: 'Network error' };
    }
}


function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorms1.png';
    if (id <= 321) return 'dizzle.png';
    if (id <= 531) return 'cloudyr.png';
    if (id <= 622) return 'snowy.png';
    if (id <= 781) return 'tornado.png';
    if (id === 800) return 'sun.png';
    return 'cloudy12.png';
}


function getCurrentDate() {
    return new Date().toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    });
}


function showDisplaySection(section) {
    [notFoundSection, searchCitySection, weatherInfoSection].forEach(sec => sec.style.display = 'none');
    section.style.display = 'flex';
}


async function updateWeatherInfo(city) {
    const WeatherData = await getFetchData('weather', city);
    if (WeatherData.cod !== 200) {
        showDisplaySection(notFoundSection);
        return;
    }

    const {
        name: country,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed }
    } = WeatherData;

    currentCity = city;
    countryTxt.textContent = country;
    tempTxt.textContent = Math.round(temp) + '°C';
    conditionTxt.textContent = main;
    humidityTxt.textContent = humidity + '%';
    windTxt.textContent = speed + ' M/s';
    currentDateTxt.textContent = getCurrentDate();
    weatherSummaryImg.src = `/assets/${getWeatherIcon(id)}`;

    await updateForecastsInfo(city);
    updateFavoriteButton();
    showDisplaySection(weatherInfoSection);
}


async function updateForecastsInfo(city) {
    const forecastData = await getFetchData('forecast', city);
    if (!forecastData || !forecastData.list) return;

    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];

    forecastItemsContainer.innerHTML = '';

    forecastData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) &&
            !forecastWeather.dt_txt.includes(todayDate)) {
            updateForecastItems(forecastWeather);
        }
    });
}


function updateForecastItems(WeatherData) {
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = WeatherData;

    const formattedDate = new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
    });

    const forecastItem = `
        <div class="forecast-items-container">
            <h5 class="forecast-items-date regular-txt">${formattedDate}</h5>
            <img src="/assets/${getWeatherIcon(id)}" class="forecast-items-img" alt="forecast-icon">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `;

    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}
