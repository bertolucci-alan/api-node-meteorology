import { AxiosError } from 'axios';
import * as HTTPUtil from '@src/util/request/request';
import { ClientRequestError } from './errors/ClientRequestError';
import { StormGlassResponseError } from './errors/StormGlassReponseError';
import { ForecastPoint } from './types/ForecastPoint';
import {
  StormGlassForecastResponse,
  StormGlassPoint,
} from './types/StormGlassForecastResponse';
import config, { IConfig } from 'config';
import { TimeUtil } from '@src/util/time';

const stormGlassResourceConfig: IConfig = config.get(
  'App.resources.StormGlass'
);
export class StormGlass {
  readonly stormGlassApiParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
  readonly stormGlassApiSource = 'noaa';

  constructor(protected request = new HTTPUtil.Request()) {}

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    const endTimestamp = TimeUtil.getUnixTimeForAFutureDay(1);
    try {
      const response = await this.request.get<StormGlassForecastResponse>(
        `${stormGlassResourceConfig.get(
          'apiUrl'
        )}/weather/point?lat=${lat}&lng=${lng}&params=${
          this.stormGlassApiParams
        }&source=${this.stormGlassApiSource}&end=${endTimestamp}`,
        {
          headers: {
            Authorization: stormGlassResourceConfig.get('apiToken'),
          },
        }
      );
      return this.normalizeResponse(response.data);
    } catch (err) {
      const axiosError = err as AxiosError;
      //if the error is from the response of the StormGlass server
      if (HTTPUtil.Request.isRequest(err as AxiosError)) {
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(axiosError.response?.data)} Code: ${
            axiosError.response?.status
          }`
        );
      }
      throw new ClientRequestError(axiosError.message);
    }
  }

  public normalizeResponse(
    points: StormGlassForecastResponse
  ): ForecastPoint[] {
    //fazendo o bind porque this.isValidPoint é um método da instância da classe
    //StormGlass, caso não haja o bind, o método vai ser undefined
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      swellDirection: point.swellDirection[this.stormGlassApiSource],
      swellHeight: point.swellHeight[this.stormGlassApiSource],
      swellPeriod: point.swellPeriod[this.stormGlassApiSource],
      time: point.time,
      waveDirection: point.waveDirection[this.stormGlassApiSource],
      waveHeight: point.waveHeight[this.stormGlassApiSource],
      windDirection: point.windDirection[this.stormGlassApiSource],
      windSpeed: point.windSpeed[this.stormGlassApiSource],
    }));
  }

  //Partial faz com que as propriedades possam ser undefined
  private isValidPoint(point: Partial<StormGlassPoint>): boolean {
    //!! faz com que o retorno seja boolean
    return !!(
      point.time &&
      point.swellDirection?.[this.stormGlassApiSource] &&
      point.swellHeight?.[this.stormGlassApiSource] &&
      point.swellPeriod?.[this.stormGlassApiSource] &&
      point.waveDirection?.[this.stormGlassApiSource] &&
      point.waveHeight?.[this.stormGlassApiSource] &&
      point.windDirection?.[this.stormGlassApiSource] &&
      point.windSpeed?.[this.stormGlassApiSource]
    );
  }
}
