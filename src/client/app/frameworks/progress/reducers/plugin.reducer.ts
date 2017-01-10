import { IPluginState, initialPlugins } from '../states/plugin.state';
import * as actions from '../actions/plugin.action';

export function pluginReducer(
    state: IPluginState = initialPlugins,
    action: actions.Actions
): IPluginState {
  switch (action.type) {
    case actions.ActionTypes.CHANGED:
      return (<any>Object).assign({}, state, action.payload );
    case actions.ActionTypes.VIEW_DETAIL:
      return (<any>Object).assign({}, state, { selected: action.payload });
    default:
      return state;
  }
}
