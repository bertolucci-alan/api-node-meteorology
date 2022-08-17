import { StormGlass } from '@src/clients/stormGlass';
import { ForecastPoint } from '@src/clients/types/ForecastPoint';
import { AxiosError } from 'axios';
import { ForecastProcessingInternalError } from './errors/ForecastProcessingInternalError';
import { IBeach } from './types/IBeaches';
import { ITimeForecast } from './types/ITimeForecast';

export interface IBeachForecast extends Omit<IBeach, 'user'>, ForecastPoint {}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  public async processForecastForBeaches(
    beaches: IBeach[]
  ): Promise<ITimeForecast[]> {
    const pointsWithCorrectSource: IBeachForecast[] = [];
    try {
      for (const beach of beaches) {
        const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
        const erichedBeachData = this.erichedBeachData(points, beach);
        pointsWithCorrectSource.push(...erichedBeachData);
      }
      return this.mapForecastByTime(pointsWithCorrectSource);
    } catch (err) {
      throw new ForecastProcessingInternalError((err as AxiosError).message);
    }
  }

  private erichedBeachData(
    points: ForecastPoint[],
    beach: IBeach
  ): IBeachForecast[] {
    return points.map((e) => ({
      ...{
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: 1,
      },
      ...e,
    }));
  }

  public mapForecastByTime(forecast: IBeachForecast[]): ITimeForecast[] {
    const forecastByTime: ITimeForecast[] = [];
    for (const point of forecast) {
      const timePoint = forecastByTime.find((f) => f.time === point.time);
      if (timePoint) {
        timePoint.forecast.push(point);
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point],
        });
      }
    }
    return forecastByTime;
  }
}
