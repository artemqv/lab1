import React, { useState, useEffect } from 'react';
import './App.css';
import { mockWeatherData } from './searchingMock';

const API_KEY = '80303563016287d5757613923cab570b';

const App: React.FC = () => {
  const [city, setCity] = useState<string>('Moscow');
  const [weather, setWeather] = useState<any>(null);
  const [pollution, setPollution] = useState<any>(null);
  const [input, setInput] = useState('');

  const fetchData = async (targetCity: string) => {
    try {
      const geo = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${targetCity}&limit=1&appid=${API_KEY}`).then(r => r.json());
      if (geo.length > 0) {
        const { lat, lon, name } = geo[0];
        const wData = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`).then(r => r.json());
        const pData = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`).then(r => r.json());
        setWeather(wData);
        setPollution(pData);
        setCity(name);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { 
    fetchData(city);
    const timer = setInterval(() => fetchData(city), 10800000); // [cite: 5]
    return () => clearInterval(timer);
  }, []);

  if (!weather) return <div style={{color: 'white'}}>Loading...</div>;
  const current = weather.list[0];

  return (
    <div className="app-container">
      {/* 1. Статичный поиск сверху */}
      <div className="search-box">
        <input 
          className="search-input"
          style={{width: '100%', padding: '12px', borderRadius: '15px', border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', outline: 'none'}}
          placeholder="Search city..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchData(input)}
        />
      </div>

      {/* 2. Прокручиваемая область */}
      <div className="scrollable-content">
        
        {/* Основная инфо [cite: 17, 18] */}
        <div style={{textAlign: 'center', padding: '10px 0 30px'}}>
          <p style={{opacity: 0.7, fontSize: '14px'}}>Today, {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}</p>
          <h1 style={{fontSize: '36px', margin: '5px 0', fontWeight: 'bold'}}>{city}</h1>
          <div style={{position: 'relative', display: 'inline-block', marginTop: '10px'}}>
            <span style={{fontSize: '90px', fontWeight: 'bold', letterSpacing: '-4px'}}>+{Math.round(current.main.temp)}°</span>
            <img 
              src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`} 
              style={{width: '130px', position: 'absolute', right: '-90px', top: '-10px'}} 
              alt="weather icon" 
            />
          </div>
        </div>

        {/* Почасовой прогноз [cite: 21-30] */}
        <div className="hourly-scroll">
          {weather.list.slice(0, 5).map((h: any, i: number) => (
            <div key={i} className="hourly-item">
              <span style={{opacity: 0.6, fontSize: '11px'}}>{i === 0 ? 'Now' : h.dt_txt.split(' ')[1].slice(0, 5)}</span>
              <img src={`https://openweathermap.org/img/wn/${h.weather[0].icon}.png`} width="40" alt="icon" />
              <b style={{fontSize: '14px'}}>{Math.round(h.main.temp)}°</b>
            </div>
          ))}
        </div>

        {/* Параметры [cite: 32-38] */}
        <div className="stats-grid">
          <div className="stat-item"><span>Humidity</span><b>{current.main.humidity}%</b></div>
          <div className="stat-item"><span>Wind</span><b>{Math.round(current.wind.speed)}m/s</b></div>
          <div className="stat-item"><span>Pressure</span><b>{current.main.pressure}</b></div>
          <div className="stat-item"><span>AQI</span><b>{pollution?.list[0].main.aqi}</b></div>
        </div>

        {/* Список на неделю (Нижняя плашка) [cite: 39-62] */}
        <div className="forecast-panel">
          {weather.list.filter((_: any, i: number) => i % 8 === 0).map((day: any, i: number) => (
            <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <span style={{width: '120px', fontSize: '15px'}}>{new Date(day.dt_txt).toLocaleDateString('en-US', {weekday: 'long', day: 'numeric'})}</span>
              <img src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} width="35" alt="icon" />
              <div style={{width: '70px', textAlign: 'right'}}>
                <span style={{fontWeight: 'bold', fontSize: '15px'}}>+{Math.round(day.main.temp_max)}°</span>
                <span style={{opacity: 0.4, marginLeft: '10px', fontSize: '13px'}}>+{Math.round(day.main.temp_min)}°</span>
              </div>
            </div>
          ))}
        </div>

      </div> {/* Конец scrollable-content */}
    </div>
  );
};

export default App;