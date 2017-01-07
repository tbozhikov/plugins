import { Action } from '@ngrx/store';
import { type } from '../../core/utils/type';
import { PLUGIN } from '../common/categories';
import { IPlugin } from '../models/plugin.model';
import { IPluginState } from '../states/plugin.state';

/**
 * For each action type in an action group, make a simple
 * enum object for all of this group's action types.
 *
 * The 'type' utility function coerces strings into string
 * literal types and runs a simple check to guarantee all
 * action types in the application are unique.
 */
export interface IPluginActions {
  INIT: string;
  FETCH: string;
  FETCH_FAILED: string;
  VIEW_DETAIL: string;
  CHANGED: string;
}

export const ActionTypes: IPluginActions = {
  INIT: type(`${PLUGIN} Init`),
  FETCH: type(`${PLUGIN} Fetch`),
  FETCH_FAILED: type(`${PLUGIN} Fetch Failed`),
  VIEW_DETAIL:     type(`${PLUGIN} View Detail`),
  CHANGED:     type(`${PLUGIN} Changed`)
};

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 *
 * See Discriminated Unions: https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
 */
export class InitAction implements Action {
  type = ActionTypes.INIT;
  payload: string = null;
}

export interface IFetchOptions {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: string;
}
export class FetchAction implements Action {
  type = ActionTypes.FETCH;
  constructor(public payload?: IFetchOptions) { }
}

export class FetchFailedAction implements Action {
  type = ActionTypes.FETCH_FAILED;
  constructor(public payload?: any) { }
}

export class ViewDetailAction implements Action {
  type = ActionTypes.VIEW_DETAIL;
  constructor(public payload?: IPlugin) { }
}

export class ChangedAction implements Action {
  type = ActionTypes.CHANGED;
  constructor(public payload?: Array<IPlugin>) { }
}

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type Actions
  = InitAction
  | FetchAction
  | ChangedAction;
