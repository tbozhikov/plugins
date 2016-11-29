import { IModalState, initialModal } from '../states/modal.state';
import * as actions from '../actions/modal.action';

export function modalReducer(
    state: IModalState = initialModal,
    action: actions.Actions
): IModalState {
  switch (action.type) {
    case actions.ActionTypes.OPENED:
      return (<any>Object).assign({}, state, {
        open: true,
        cmpType: action.payload.cmpType,
        title: action.payload.title
      });

    case actions.ActionTypes.CLOSED:
      return (<any>Object).assign({}, state, {
        open: false,
        cmpType: null,
        title: null
      });

    default:
      return state;
  }
}
