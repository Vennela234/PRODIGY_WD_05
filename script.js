// Using your OpenWeatherMap API key
const API_KEY = '77e4c31127269ff964cc31b785d5f5ee';

const elements = {
  searchBtn: document.getElementById('searchBtn'),
  locBtn: document.getElementById('locBtn'),
  cityInput: document.getElementById('cityInput'),
  unitsSelect: document.getElementById('units'),
  card: document.getElementById('card'),
  icon: document.getElementById('icon'),
  temp: document.getElementById('temp'),
  feels: document.getElementById('feels'),
  location: document.getElementById('location'),
  desc: document.getElementById('desc'),
  humidity: document.getElementById('humidity'),
  wind: document.getElementById('wind'),
  pressure: document.getElementById('pressure'),
  message: document.getElementById('message')
};

function showMessage(text, isError = false){
  elements.message.textContent = text;
  elements.message.style.color = isError ? 'crimson' : '';
}

async function fetchWeatherByCity(city, units='metric'){
  showMessage('Loading...');
  try{
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${units}`;
    const res = await fetch(url);
    if(!res.ok){
      const data = await res.json();
      throw new Error(data.message || 'Failed to fetch');
    }
    const data = await res.json();
    renderWeather(data, units);
    showMessage('');
  }catch(err){
    console.error(err);
    showMessage('Error: ' + err.message, true);
    elements.card.classList.add('hidden');
  }
}

async function fetchWeatherByCoords(lat, lon, units='metric'){
  showMessage('Loading...');
  try{
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
    const res = await fetch(url);
    if(!res.ok) throw new Error('Failed to fetch weather for coordinates');
    const data = await res.json();
    renderWeather(data, units);
    showMessage('');
  }catch(err){
    console.error(err);
    showMessage('Error: ' + err.message, true);
    elements.card.classList.add('hidden');
  }
}

function renderWeather(data, units){
  if(!data || !data.weather) return;
  const iconCode = data.weather[0].icon;
  elements.icon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  elements.icon.alt = data.weather[0].description;
  elements.temp.textContent = Math.round(data.main.temp) + (units === 'metric' ? '°C' : '°F');
  elements.feels.textContent = `Feels like ${Math.round(data.main.feels_like)}${units === 'metric' ? '°C' : '°F'}`;
  elements.location.textContent = `${data.name}, ${data.sys && data.sys.country ? data.sys.country : ''}`;
  elements.desc.textContent = capitalize(data.weather[0].description);
  elements.humidity.textContent = data.main.humidity;
  elements.wind.textContent = (data.wind && data.wind.speed != null) ? data.wind.speed : '--';
  elements.pressure.textContent = data.main.pressure;
  elements.card.classList.remove('hidden');
}

function capitalize(str){ return str.charAt(0).toUpperCase() + str.slice(1); }

elements.searchBtn.addEventListener('click', ()=>{
  const city = elements.cityInput.value.trim();
  if(!city){ showMessage('Please enter a city name', true); return; }
  fetchWeatherByCity(city, elements.unitsSelect.value);
});

elements.cityInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') elements.searchBtn.click(); });

elements.locBtn.addEventListener('click', ()=>{
  if(!navigator.geolocation){ showMessage('Geolocation is not supported in your browser', true); return; }
  showMessage('Getting your location...');
  navigator.geolocation.getCurrentPosition((pos)=>{
    const {latitude, longitude} = pos.coords;
    fetchWeatherByCoords(latitude, longitude, elements.unitsSelect.value);
  }, (err)=>{
    console.error(err);
    showMessage('Geolocation denied or unavailable', true);
  }, { timeout: 10000 });
});


fetchWeatherByCity('New York', 'metric');
