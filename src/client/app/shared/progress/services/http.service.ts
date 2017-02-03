// angular
import { Injectable } from '@angular/core';
import { Http, Response, Request, RequestOptions, RequestMethod, Headers, URLSearchParams } from '@angular/http';

// libs
import { Store, ActionReducer, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subscriber } from 'rxjs/Subscriber';
import { isObject, isString, includes } from 'lodash';

// app
import { LogService, WindowService } from '../../core/services/index';
import { Config } from '../../core/utils/index';
import { Analytics, AnalyticsService } from '../../analytics/index';
import { Tracking } from '../utils/index';
import * as httpActions from '../actions/http.action';
import { IActiveRequest } from '../states/http.state';

export interface IHttpOptions {
  url?: string;
  method?: string | RequestMethod;
  prefix?: string;
  params?: any;
  data?: any;
  headers?: any;
}

@Injectable()
export class HttpService extends Analytics {
  private _prefix: string = 'http://nativescript.rocks:3004/api/';
  private _suffix: string = '';
  private _authToken: string;

  constructor(analytics: AnalyticsService, private store: Store<any>, private log: LogService, private win: WindowService, private http: Http) {
    super(analytics);
    this.category = Tracking.Categories.HTTP;
  }

  public get(optionsOrUrl: string | IHttpOptions, options?: IHttpOptions): Observable<any> {
    options = this.optionsHandler(optionsOrUrl, options);
    options.method = RequestMethod.Get;
    return this.requestHandler(options);
  }

  public post(optionsOrUrl: string | IHttpOptions, options?: IHttpOptions): Observable<any> {
    options = this.optionsHandler(optionsOrUrl, options);
    options.method = RequestMethod.Post;
    return this.requestHandler(options);
  }

  public set authToken(value: string) {
    this._authToken = value;
  }

  public prepUrl(options: IHttpOptions): string {
    let url = options.url;
    if (options.prefix) {
      // ignore suffix, custom api call
      return `${options.prefix}${url}`;
    } else {
      url = `${url}${this._suffix}`;
      return `${this._prefix}${url}`;
    }
  }

  public prepReqOptions(options: IHttpOptions): RequestOptions {
    let url = this.prepUrl(options);
    this._log(`get: ${url}`);

    let headers = new Headers({ 'Content-Type': 'application/json' });
    if (this._authToken) headers.append('X-Auth-Token', this._authToken);
    if (options.headers) {
      for (let key in options.headers) {
        headers.append(key, options.headers[key]);
      }
    }

    let search = this.prepParams(options.params);
    // this.log(search);

    let data = {};
    if (options.data) {
      let body = JSON.stringify(options.data);
      this._log(body);
      data = { body };
    }

    return new RequestOptions(Object.assign({}, { url, headers, method: options.method }, search, data));
  }

  public request(options: IHttpOptions): Observable<any> {
    let rOptions: RequestOptions = this.prepReqOptions(options);

    let shared = new Observable((obs: Subscriber<any>) => {
      this._log(`subscribe: ${rOptions.url}`);
      let sub: Subscription = this.http.request(new Request(rOptions))
        .map((res: Response) => this.extractData(res))
        .catch((error: any) => this.handleError(error, rOptions.url))
        .subscribe((data: any) => {
          // console.log(`HttpService request data!`);
          // console.log(data);
          obs.next(data);
        }, (err: any) => {
          obs.error(err);
        });
      return () => {
        this._log(`unsubscribe: ${rOptions.url}`);
        // this.cancel(rOptions.url);
        if (sub) sub.unsubscribe();
      };
    }).share();

    let activeRequest: IActiveRequest = {
      url: rOptions.url,
      data: options.data,
      params: options.params,
      method: options.method
    };
    this.store.dispatch(new httpActions.RequestNewAction(activeRequest));
    return shared;
  }

  private requestHandler(options: IHttpOptions): Observable<any> {
    let req: Observable<any> = this.request(options);
    // modify observable based on options
    // TODO: make cancelable
    // if (!options.ignoreCancel) {
    //   // make all requests cancelable by default
    //   req = req.takeUntil(this.actions$.ofType(HTTP_ACTIONS.CANCEL));
    // }
    return req;
  }

  private optionsHandler(optionsOrUrl: string | IHttpOptions, options?: IHttpOptions): IHttpOptions {
    // create options
    options = isObject(options) ? options : {};
    return isObject(optionsOrUrl) ? Object.assign({}, optionsOrUrl, options) : Object.assign({}, options, { url: optionsOrUrl });
  }

  private prepParams(params?: any): any {
    if (isObject(params)) {
      let p = new URLSearchParams();
      for (let key in params) {
        p.set(key, params[key]);
      }
      return { search: p };
    } else {
      return {};
    }
  }

  private extractData(res: Response) {
    // console.log('EXTRACTING DATA');
    // console.log(res);
    this.requestFinished(res.url);
    let body = res.json();
    return body || { };
  }

  private handleError (error: any, url: string): Observable<any> {
    // TODO: potentially check network conditions here
    // error.status === 0 when offline
    let errorMsg = error.message ? error.message :
      (error.status ? `${error.status}: ${error.statusText}` : 'Server error');
    this._log(errorMsg, true);
    this.track(Tracking.Actions.HTTP_ERROR, { label: errorMsg });
    this.requestError(url, errorMsg, error.status);
    return Observable.throw({ error: errorMsg });
  }

  private requestError(url: string, errorMsg: any, statusCode: number) {
    this.store.dispatch(new httpActions.RequestErrorAction({ url, errorMsg, statusCode }));
  }

  private requestFinished(url: string) {
    this._log(`COMPLETE: ${url}`);
    this.store.dispatch(new httpActions.RequestCompleteAction(url));
  }

  private _log(value: any, err?: boolean) {
    this.log[err ? 'error' : 'debug'](isString(value) ? `HttpService ${value}` : value);
  }
}
