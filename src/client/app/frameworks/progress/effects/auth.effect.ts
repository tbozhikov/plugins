// angular
import { Injectable } from '@angular/core';

// libs
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

// module
import { LogService, WindowService } from '../../core/services/index';
import { Tracking, Text } from '../utils/index';
import { AuthService } from '../services/auth.service';
import * as actions from '../actions/auth.action';

@Injectable()
export class AuthEffects {

  @Effect() init$ = this.actions$
    .ofType(actions.ActionTypes.INIT)
    .startWith(new actions.InitAction())
    .map(action => {
      this.log.debug(actions.ActionTypes.INIT);
      let savedUser = this.authService.current;
      return (new actions.ChangeAction(savedUser));
    });

  @Effect({ dispatch: false }) login$ = this.actions$
    .ofType(actions.ActionTypes.LOGIN)
    .do(action => {
      this.authService.login();
    });

  @Effect({ dispatch: false }) loginSuccess$ = this.actions$
    .ofType(actions.ActionTypes.LOGIN_SUCCESS)
    .map(action => {
      this.authService.track(Tracking.Actions.LOGGED_IN, { label: action.payload.email });
      return (new actions.ChangeAction(action.payload));
    });

  @Effect({dispatch: false}) loginFailed$ = this.actions$
    .ofType(actions.ActionTypes.LOGIN_FAILED)
    .do(action => {
      this.win.alert(Text.ERRORS.LOGIN_FAILED);
    });

  @Effect() authChange$ = this.actions$
    .ofType(actions.ActionTypes.CHANGE)
    .map(action => {
      // persist user changes
      this.authService.current = action.payload;
      return (new actions.UpdatedAction({current: action.payload}));
    });

  @Effect() logout$ = this.actions$
    .ofType(actions.ActionTypes.LOGOUT)
    .map(action => {
      // analytics
      let label = this.authService.current ? this.authService.current.email : 'Unavailable';
      this.authService.track(Tracking.Actions.LOGGED_OUT, { label });
      return (new actions.ChangeAction(null));
    });

  constructor(private store: Store<any>, private log: LogService, private actions$: Actions, private win: WindowService, private authService: AuthService) { }
}
