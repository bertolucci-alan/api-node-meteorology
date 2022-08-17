import axios, { Axios, AxiosError } from 'axios';

import { AxiosRequestConfig, AxiosResponse } from 'axios';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RequestConfig extends AxiosRequestConfig {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Response<T = unknown> extends AxiosResponse<T> {}

export class Request {
  constructor(private request: Axios = axios) {}

  public get<T>(url: string, config: RequestConfig): Promise<Response<T>> {
    return this.request.get<T, Response<T>>(url, config);
  }

  public static isRequest(error: AxiosError): boolean {
    return !!(error.response && error.response.status);
  }
}
