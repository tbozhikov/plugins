import { IHttpState, IRequestStatus, initialHttp } from '../states/http.state';
import * as actions from '../actions/http.action';
import { includes } from 'lodash';

const finshedErrorCodes: Array<number> = [401, 422, 0];

export function httpReducer(
    state: IHttpState = initialHttp,
    action: actions.Actions
): IHttpState {
  let changeState = () => {
    return Object.assign({}, state, action.payload);
  };
  let modifyActiveRequests = (status: IRequestStatus) => {
    let activeRequests = [...state.activeRequests];
    for (let i = 0; i < activeRequests.length; i++) {
      let req = activeRequests[i];
      let resUrl = status.url ? status.url.split('?')[0] : '';
      if (req.url === resUrl) {

        if (status.updates) {
          console.log(`updating pending request...${req.url}`, status.updates);
          activeRequests[i] = Object.assign({}, req, status.updates);
        }

        if (status.complete || (status.error && includes(finshedErrorCodes, status.statusCode))) {
          activeRequests.splice(i, 1);
        }
        break;
      }
    }
    return activeRequests;
  };
  switch (action.type) {
    case actions.ActionTypes.UPDATE:
      return changeState();
    case actions.ActionTypes.REQUEST_NEW:
      action.payload = { activeRequests: [...state.activeRequests, action.payload] };
      return changeState();
    case actions.ActionTypes.REQUEST_ERROR:
      action.payload = {
        activeRequests: modifyActiveRequests({
          url: action.payload.url,
          error: true,
          statusCode: action.payload.statusCode,
          updates: {
            errorMsg: action.payload.errorMsg
          }
        })
      };
      return changeState();
    case actions.ActionTypes.REQUEST_COMPLETE:
      action.payload = {
        activeRequests: modifyActiveRequests({
          url: action.payload,
          complete: true
        })
      };
      return changeState();
    default:
      return state;
  }
}
