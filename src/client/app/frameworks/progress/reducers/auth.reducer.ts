import { IAuthState, initialAuth } from '../states/auth.state';
import * as actions from '../actions/auth.action';

export function authReducer(
    state: IAuthState = initialAuth,
    action: actions.Actions
): IAuthState {
  switch (action.type) {
    case actions.ActionTypes.UPDATED:
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
}
