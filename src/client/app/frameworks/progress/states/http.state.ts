import { IUser } from '../models/index';
import { RequestMethod } from '@angular/http';

export interface IActiveRequest {
  url: string;
  method: string | RequestMethod;
  data?: any;
  params?: any;
  errorMsg?: string;
}

export interface IRequestStatus {
  url: string;
  statusCode?: number;
  updates?: any;
  complete?: boolean;
  error?: boolean;
  cancel?: boolean;
}

export interface IHttpState {
  activeRequests?: Array<IActiveRequest>;
}

export const initialHttp: IHttpState = {
  activeRequests: []
};
