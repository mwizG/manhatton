'use client';

import { useState, useEffect } from 'react';
import { WeatherData } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeatherPanelProps {
  defaultCity?: string;
  defaultCountry?: string;
}

export function WeatherPanel({ defaultCity = 'Lusaka', defaultCountry = 'ZM' }: WeatherPanelProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [city, setCity] = useState(defaultCity);
  const [country, setCountry] = useState(defaultCountry);
  const [inputCity, setInputCity] = useState(defaultCity);
  const [inputCountry, setInputCountry] = useState(defaultCountry);

  const fetchWeather = async (cityName: string, countryName: string) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await apiClient.getWeatherCurrent(cityName, countryName);
      setWeather(data);
      setCity(cityName);
      setCountry(countryName);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch weather data'
      );
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(defaultCity, defaultCountry);
  }, [defaultCity, defaultCountry]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCity.trim() && inputCountry.trim()) {
      fetchWeather(inputCity, inputCountry);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Weather Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <Input
            type="text"
            placeholder="City"
            value={inputCity}
            onChange={(e) => setInputCity(e.target.value)}
            className="text-sm flex-1"
          />
          <Input
            type="text"
            placeholder="Country"
            value={inputCountry}
            onChange={(e) => setInputCountry(e.target.value)}
            className="text-sm flex-1"
          />
          <Button
            type="submit"
            variant="default"
            size="sm"
            disabled={isLoading}
            className="whitespace-nowrap"
          >
            {isLoading ? 'Loading...' : 'Search'}
          </Button>
        </form>

        {/* Error State */}
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !weather && (
          <div className="space-y-3 animate-pulse">
            <div className="h-8 bg-muted rounded-lg w-1/3"></div>
            <div className="h-4 bg-muted rounded-lg w-1/2"></div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="h-12 bg-muted rounded-lg"></div>
              <div className="h-12 bg-muted rounded-lg"></div>
            </div>
          </div>
        )}

        {/* Weather Data Display */}
        {weather && !isLoading && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {weather.location.city}, {weather.location.country}
              </h3>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(weather.timestamp).toLocaleTimeString()}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Temperature */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Temperature</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(weather.current.temperature)}°C
                </p>
              </div>

              {/* Condition */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Condition</p>
                <p className="text-sm font-semibold text-foreground capitalize">
                  {weather.current.condition}
                </p>
              </div>

              {/* Humidity */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Humidity</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(weather.current.humidity)}%
                </p>
              </div>

              {/* Wind Speed */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Wind Speed</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(weather.current.wind_speed)} m/s
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fetchWeather(city, country)}
              className="w-full"
            >
              Refresh Weather
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
