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
import { Tracking, Text } from '../utils/index';

@Injectable()
export class PluginEffects {

  @Effect() init$ = this.actions$
    .ofType(actions.ActionTypes.INIT)
    .startWith(new actions.InitAction())
    .map(action => {
      let cachedList = this.pluginService.cachedList;
      if (cachedList) {
        return (new actions.ChangedAction(cachedList));
      } else {
        return (new actions.FetchAction());
      }
    });

  @Effect() fetch$ = this.actions$
    .ofType(actions.ActionTypes.FETCH)
    .switchMap(action => {
      // this.store.dispatch({ type: ACTIVITY_ACTIONS.TOGGLE, payload: true });
      return this.http.get('getPlugins')
        .map(res => {
          console.log(res);
          this.pluginService.cachedList = res;
          this.store.dispatch(new actions.ChangedAction(res));
          this.pluginService.track(Tracking.Actions.LOGGED_IN, { label: res.account.email });
          return (new actions.ChangedAction(res));
        })
        .catch(error => Observable.of(new actions.FetchFailedAction(error)));
    });

  constructor(private store: Store<any>, private actions$: Actions, private log: LogService, private pluginService: PluginService, private http: HttpService) { }
}
