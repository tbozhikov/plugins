// angular
import { Injectable } from '@angular/core';

// libs
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

// module
import { LogService } from '../../core/services/log.service';
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
        return (new actions.ChangedAction({ list: cachedList }));
      } else {
        let s: IPluginState = state.plugin;
        return (new actions.FetchAction({
          limit: s.limit,
          offset: s.offset,
          sort: s.orderBy,
          order: s.order
        }));
      }
    });

  @Effect() fetch$ = this.actions$
    .ofType(actions.ActionTypes.FETCH)
    .switchMap(action => {
      // this.store.dispatch({ type: ACTIVITY_ACTIONS.TOGGLE, payload: true });
      let params = action.payload;
      return this.http.get('getPlugins', { params })
        .map(res => {
          console.log(res);
          this.pluginService.cachedList = res;
          this.pluginService.track(Tracking.Actions.PLUGIN_LIST_LOADED, { label: res.length });
          return (new actions.ChangedAction({ list: res }));
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
          console.log(res.count);
          return (new actions.ChangedAction({ total: res.count }));
        })
        .catch(error => Observable.of(new actions.FetchFailedAction(error)));
    });

  constructor(private store: Store<any>, private actions$: Actions, private log: LogService, private pluginService: PluginService, private http: HttpService) { }
}
