import { Action } from '@ngrx/store';
import { type } from '../../core/utils/type';
import { HTTP } from '../common/categories';
import { IHttpState, IActiveRequest } from '../states/http.state';

export interface IHttpActions {
  UPDATE: string;
  REQUEST_NEW: string;
  REQUEST_ERROR: string;
  REQUEST_COMPLETE: string;
}

export const ActionTypes: IHttpActions = {
  UPDATE:     type(`${HTTP} Uupdate`),
  REQUEST_NEW:   type(`${HTTP} Request New`),
  REQUEST_ERROR:    type(`${HTTP} Request Error`),
  REQUEST_COMPLETE:   type(`${HTTP} Request Complete`)
};

export class UpdateAction implements Action {
  type = ActionTypes.UPDATE;
  constructor(public payload: any) { }
}

export class RequestNewAction implements Action {
  type = ActionTypes.REQUEST_NEW;
  constructor(public payload: IActiveRequest) { }
}

export class RequestErrorAction implements Action {
  type = ActionTypes.REQUEST_ERROR;
  constructor(public payload?: any) { }
}

export class RequestCompleteAction implements Action {
  type = ActionTypes.REQUEST_COMPLETE;
  constructor(public payload?: string) { }
}

export type Actions
  = UpdateAction
  | RequestNewAction
  | RequestErrorAction
  | RequestCompleteAction;
