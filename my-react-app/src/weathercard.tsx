import React from 'react';

const WeatherCard: React.FC<{data: any, pollution: any, city: string}> = ({ data, pollution, city }) => {
  const current = data.list[0];
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col h-full text-white font-sans">
      {/* 1. Верхняя часть (Текущая погода) */}
      <div className="px-8 pt-8 pb-4 text-center">
        <p className="text-sm opacity-60 font-light">{date}</p>
        <h1 className="text-4xl font-bold tracking-tight mt-1">{city}</h1>
        
        <div className="relative flex justify-center items-center my-8">
          <span className="text-8xl font-bold">+{Math.round(current.main.temp)}°</span>
          {/* Иконка должна быть крупной и сбоку [cite: 9, 10] */}
          <img 
            src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`} 
            className="absolute -right-2 w-32 h-32 drop-shadow-xl" 
            alt="weather icon" 
          />
        </div>

        {/* 2. Почасовой прогноз (в ряд) [cite: 21-30] */}
        <div className="flex justify-between items-center mb-8 bg-white/5 rounded-3xl p-4 border border-white/5">
          {data.list.slice(0, 4).map((h: any, i: number) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[10px] opacity-50 mb-1">{i === 0 ? "Now" : h.dt_txt.split(' ')[1].slice(0, 5)}</span>
              <img src={`https://openweathermap.org/img/wn/${h.weather[0].icon}.png`} className="w-8 h-8" alt="icon" />
              <span className="text-sm font-bold">{Math.round(h.main.temp)}°</span>
            </div>
          ))}
        </div>

        {/* 3. Параметры (в один ряд)  */}
        <div className="flex justify-between px-2 opacity-80">
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-wider">Hum</p>
            <p className="text-xs font-bold">{current.main.humidity}%</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-wider">Wind</p>
            <p className="text-xs font-bold">{Math.round(current.wind.speed)}m/s</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-wider">Press</p>
            <p className="text-xs font-bold">{current.main.pressure}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-wider">AQI</p>
            <p className="text-xs font-bold">{pollution?.list[0].main.aqi}</p>
          </div>
        </div>
      </div>

      {/* 4. Нижняя плашка (Прогноз на неделю) [cite: 39-62] */}
      <div className="flex-1 bg-white/10 backdrop-blur-md rounded-t-[3rem] mt-4 px-8 py-6 border-t border-white/20 shadow-inner">
        <div className="space-y-4">
          {data.list.filter((_: any, i: number) => i % 8 === 0).map((day: any, i: number) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-sm w-24 font-medium">{new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}</span>
              <img src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} className="w-8 h-8" alt="icon" />
              <div className="flex gap-2 text-sm">
                <span className="font-bold">+{Math.round(day.main.temp)}°</span>
                <span className="opacity-30">+{Math.round(day.main.temp - 3)}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;