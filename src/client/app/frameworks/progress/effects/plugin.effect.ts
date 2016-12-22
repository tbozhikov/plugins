// angular
import { Injectable } from '@angular/core';

// libs
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

// module
import { LogService } from '../../core/services/log.service';
import { PluginService } from '../services/plugins.service';
import * as actions from '../actions/plugin.action';

@Injectable()
export class PluginEffects {

  @Effect() init$ = this.actions$
    .ofType(actions.ActionTypes.INIT)
    .startWith(new actions.InitAction())
    .map(action => {
      let cachedList = this.pluginService.cachedList;
      return (new actions.ChangedAction(cachedList));
    });

  constructor(private store: Store<any>, private actions$: Actions, private log: LogService, private pluginService: PluginService) { }
}
