import _ from 'lodash';
import { StormGlass } from '@src/clients/stormGlass';
import { ForecastPoint } from '@src/clients/types/ForecastPoint';
import { AxiosError } from 'axios';
import { ForecastProcessingInternalError } from './errors/ForecastProcessingInternalError';
import { IBeach } from '../models/beach';
import { ITimeForecast } from './types/ITimeForecast';
import logger from '@src/logger';
import { Rating } from './rating';

export interface IBeachForecast extends Omit<IBeach, 'user'>, ForecastPoint {}

export class Forecast {
  constructor(
    protected stormGlass = new StormGlass(),
    protected RatingService: typeof Rating = Rating
  ) {}

  public async processForecastForBeaches(
    beaches: IBeach[]
  ): Promise<ITimeForecast[]> {
    try {
      const beachForecast = await this.calculateRating(beaches);
      const timeForecast = this.mapForecastByTime(beachForecast);
      return timeForecast.map((t) => ({
        time: t.time,
        forecast: _.orderBy(t.forecast, ['rating'], ['desc']),
      }));
    } catch (err) {
      logger.error(err);
      throw new ForecastProcessingInternalError((err as AxiosError).message);
    }
  }

  private async calculateRating(beaches: IBeach[]): Promise<IBeachForecast[]> {
    const pointsWithCorrectSource: IBeachForecast[] = [];
    logger.info(`Preparing the forecast for ${beaches.length} beaches`);

    for (const beach of beaches) {
      const rating = new this.RatingService(beach);
      const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
      const erichedBeachData = this.erichedBeachData(points, beach, rating);
      pointsWithCorrectSource.push(...erichedBeachData);
    }
    return pointsWithCorrectSource;
  }

  private erichedBeachData(
    points: ForecastPoint[],
    beach: IBeach,
    rating: Rating
  ): IBeachForecast[] {
    return points.map((point) => ({
      ...{
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: rating.getRateForPoint(point),
      },
      ...point,
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
