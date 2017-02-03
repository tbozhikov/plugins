import { Action } from '@ngrx/store';
import { type } from '../../core/utils/type';
import { AUTH } from '../common/categories';
import { IAuthState } from '../states/auth.state';

/**
 * For each action type in an action group, make a simple
 * enum object for all of this group's action types.
 *
 * The 'type' utility function coerces strings into string
 * literal types and runs a simple check to guarantee all
 * action types in the application are unique.
 */
export interface IAuthActions {
  INIT: string;
  CHANGE: string;
  UPDATED: string;
  LOGIN: string;
  LOGIN_SUCCESS: string;
  LOGIN_FAILED: string;
  LOGOUT: string;
  REGISTER: string;
}

export const ActionTypes: IAuthActions = {
  INIT:         type(`${AUTH} Init`),
  CHANGE:       type(`${AUTH} Change`),
  UPDATED:      type(`${AUTH} Updated`),
  LOGIN:        type(`${AUTH} Login`),
  LOGIN_SUCCESS:type(`${AUTH} LoginSuccess`),
  LOGIN_FAILED: type(`${AUTH} LoginFailed`),
  LOGOUT:       type(`${AUTH} Logout`),
  REGISTER:     type(`${AUTH} Register`)
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

export class ChangeAction implements Action {
  type = ActionTypes.CHANGE;
  constructor(public payload: any) { }
}

export class UpdatedAction implements Action {
  type = ActionTypes.UPDATED;
  constructor(public payload: IAuthState) { }
}

export class LoginAction implements Action {
  type = ActionTypes.LOGIN;
  payload: string = null;
}

export class LoginSuccessAction implements Action {
  type = ActionTypes.LOGIN_SUCCESS;
  constructor(public payload: any) { }
}

export class LoginFailedAction implements Action {
  type = ActionTypes.LOGIN_FAILED;
  constructor(public payload: IAuthState) { }
}

export class LogoutAction implements Action {
  type = ActionTypes.LOGOUT;
  payload: string = null;
}

export class RegisterAction implements Action {
  type = ActionTypes.REGISTER;
  constructor(public payload: any) { }
}

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type Actions
  = InitAction
  | ChangeAction
  | UpdatedAction
  | LoginAction
  | LoginSuccessAction
  | LoginFailedAction
  | LogoutAction
  | RegisterAction;
