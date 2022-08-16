import { IBeachForecast } from '../forecast';

export interface ITimeForecast {
  time: string;
  forecast: IBeachForecast[];
}
