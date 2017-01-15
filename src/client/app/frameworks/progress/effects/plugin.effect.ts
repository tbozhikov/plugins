// angular
import { Injectable } from '@angular/core';

// libs
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

// module
import { LogService } from '../../core/services/log.service';
import { IAppState } from '../../ngrx/state/app.state';
import { HttpService } from '../services/http.service';
import { PluginService } from '../services/plugins.service';
import * as actions from '../actions/plugin.action';
import { IPluginState } from '../states/plugin.state';
import { Tracking, Text } from '../utils/index';

@Injectable()
export class PluginEffects {

  @Effect() init$ = this.actions$
    .ofType(actions.ActionTypes.INIT)
    .startWith(new actions.InitAction())
    .withLatestFrom(this.store)
    .map(([action, state]) => {
      let cachedList = this.pluginService.cachedList;
      if (cachedList) {
        if (state.plugin.freshFetch) {
          setTimeout(() => {
            // dispatch a fresh fetch to grab any latest changes
            this.store.dispatch(this.freshFetch(state));
          }, 1000);
        }
        // go ahead and populate list in view with previously cached list
        return (new actions.ChangedAction({ list: cachedList }));
      } else {
        return this.freshFetch(state, true);
      }
    });

  @Effect() fetch$ = this.actions$
    .ofType(actions.ActionTypes.FETCH)
    .withLatestFrom(this.store)
    .switchMap(([action, state]) => {
      // this.store.dispatch({ type: ACTIVITY_ACTIONS.TOGGLE, payload: true });
      let params = action.payload;
      let changeSet: IPluginState = {
        freshFetch: false, // reset since this is only used on init to fetch freshest data
        offset: params.offset // update offset for next infinite load
      };
      return this.http.get('getPlugins', { params })
        .map(res => {
          // console.log(res);
          if (state.plugin.freshFetch) {
            // we cache initial list for return visits to be fast
            this.pluginService.cachedList = res;
          } else {
            // loading more
            res = [...state.plugin.list, ...res];
          }
          // track each time plugin list (via fresh or infinite load) is loaded
          this.pluginService.track(Tracking.Actions.PLUGIN_LIST_LOADED, { label: res.length });
          changeSet.list = res;
          return (new actions.ChangedAction(changeSet));
        })
        .catch(error => Observable.of(new actions.FetchFailedAction(error)));
    });

  @Effect() viewDetail$ = this.actions$
    .ofType(actions.ActionTypes.VIEW_DETAIL)
    .withLatestFrom(this.store)
    .switchMap(([action, state]) => {
      // this.store.dispatch({ type: ACTIVITY_ACTIONS.TOGGLE, payload: true });
      return this.http.get(`getPlugin/${action.payload}`)
        .map(res => {
          // console.log(res[0]);
          // track each time plugin list (via fresh or infinite load) is loaded
          this.pluginService.track(Tracking.Actions.PLUGIN_VIEWED_DETAIL, { label: action.payload });
          return (new actions.ChangedAction({selected: res[0], searching: false}));
        })
        .catch(error => Observable.of(new actions.FetchFailedAction(error)));
    });

  @Effect() getTotal$ = this.actions$
    .ofType(actions.ActionTypes.GET_TOTAL)
    .startWith(new actions.GetTotalAction())
    .switchMap(action => {
      // this.store.dispatch({ type: ACTIVITY_ACTIONS.TOGGLE, payload: true });
      return this.http.get('getPluginCount')
        .map(res => {
          // console.log(+res.count);
          return (new actions.ChangedAction({ total: +res.count }));
        })
        .catch(error => Observable.of(new actions.FetchFailedAction(error)));
    });

  constructor(private store: Store<any>, private actions$: Actions, private log: LogService, private pluginService: PluginService, private http: HttpService) { }

  private freshFetch(state: IAppState, asObservable?: boolean) {
    let s: IPluginState = state.plugin;
    let action = new actions.FetchAction({
      limit: s.limit,
      offset: s.offset,
      sort: s.orderBy,
      order: s.order
    });
    return asObservable ? (action) : action;
  }
}
