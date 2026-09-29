import { useEffect, useState } from 'react';
import { useFetchData } from './useFetchData';

interface OpenMeteoResponse {
  current_weather: {
    temperature: number;
    weathercode: number;
  };
}

export function useHubWeather() {
  // Lokasi Hub JKT-04 (Simulasi koordinat Jakarta Selatan)
  const LAT = -6.2088;
  const LON = 106.8456;
  const URL = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true`;

  const { data, isLoading, isError, error } = useFetchData<OpenMeteoResponse>(URL);
  const [weatherDescription, setWeatherDescription] = useState('Memuat Cuaca...');

  useEffect(() => {
    if (data?.current_weather) {
      const code = data.current_weather.weathercode;
      // WMO Weather interpretation codes (simplified)
      if (code === 0) setWeatherDescription('Cerah');
      else if (code >= 1 && code <= 3) setWeatherDescription('Berawan');
      else if (code >= 51 && code <= 67) setWeatherDescription('Hujan Ringan');
      else if (code >= 80 && code <= 99) setWeatherDescription('Hujan Badai');
      else setWeatherDescription('Kabut');
    }
  }, [data]);

  return { 
    temperature: data?.current_weather?.temperature,
    weatherDescription,
    isLoading, 
    isError, 
    error 
  };
}
