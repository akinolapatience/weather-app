export async function fetchWeatherData() {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe%2FBerlin";

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch weather data");
  return await response.json();
}
