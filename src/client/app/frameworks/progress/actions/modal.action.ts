import { Action } from '@ngrx/store';
import { type } from '../../core/utils/type';
import { MODAL } from '../common/categories';
import { IModalState, IModalOptions } from '../states/modal.state';

/**
 * For each action type in an action group, make a simple
 * enum object for all of this group's action types.
 *
 * The 'type' utility function coerces strings into string
 * literal types and runs a simple check to guarantee all
 * action types in the application are unique.
 */
export interface IModalActions {
  OPEN: string;
  OPENED: string;
  CLOSE: string;
  CLOSED: string;
}

export const ActionTypes: IModalActions = {
  OPEN:     type(`${MODAL} Open`),
  OPENED:   type(`${MODAL} Opened`),
  CLOSE:    type(`${MODAL} Close`),
  CLOSED:   type(`${MODAL} Closed`)
};

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 *
 * See Discriminated Unions: https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
 */
export class OpenAction implements Action {
  type = ActionTypes.OPEN;
  constructor(public payload: IModalOptions) { }
}

export class OpenedAction implements Action {
  type = ActionTypes.OPENED;
  constructor(public payload: IModalState) { }
}

export class CloseAction implements Action {
  type = ActionTypes.CLOSE;
  constructor(public payload?: any) { }
}

export class ClosedAction implements Action {
  type = ActionTypes.CLOSED;
  payload: string = null;
}

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type Actions
  = OpenAction
  | OpenedAction
  | CloseAction
  | ClosedAction;
