export const mockWeatherData = {
  list: Array(40).fill({
    dt_txt: "2026-04-21 12:00:00",
    main: {
      temp: 22.5,
      humidity: 60,
      pressure: 760
    },
    weather: [{ main: "Clear", icon: "01d", description: "clear sky" }],
    wind: { speed: 4.5 }
  }),
  city: { name: "Moscow" }
};
 
export const mockPollutionData = {
  list: [{ main: { aqi: 1 } }]
};