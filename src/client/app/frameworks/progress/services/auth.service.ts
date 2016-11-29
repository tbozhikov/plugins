import { Injectable, Inject, OpaqueToken, NgZone } from '@angular/core';

// libs
import { Store, ActionReducer, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { tokenNotExpired } from 'angular2-jwt';

// app
import { Analytics, AnalyticsService } from '../../analytics/index';
import { LogService, WindowService } from '../../core/index';
import { IUser, UserModel } from '../models/index';
import { Tracking } from '../utils/index';
import { StorageService } from './storage.service';
import * as actions from '../actions/auth.action';

// Auth0 Lock
export const AUTH_LOCK: OpaqueToken = new OpaqueToken('Auth0Lock');

@Injectable()
export class AuthService extends Analytics {
  // Auth0
  private lock: any;

  constructor(public analytics: AnalyticsService, private store: Store<any>, private storage: StorageService, private log: LogService, @Inject(AUTH_LOCK) private authLock: any, private win: WindowService, private ngZone: NgZone) {
    super(analytics);
    this.category = Tracking.Categories.USERS;

    // config Auth0
    this.lock = new authLock('r96lh3DyVfFMGdyAgrZTSsO8y8bX7eY4', 'progress.auth0.com', {});

    // Add callback for lock `authenticated` event
    this.lock.on('authenticated', (authResult: any) => {
      this.log.debug('authenticated');
      // this.log.debug(authResult);

      // Fetch profile information
      this.lock.getProfile(authResult.idToken, (error, profile) => {
        if (error) {
          // Handle error
          this.win.alert(error);
          return;
        }

        profile.authIdToken = authResult.idToken;
        this.ngZone.run(() => {
          this.store.dispatch({ type: actions.ActionTypes.LOGIN_SUCCESS, payload: profile });
        });
      });
    });
  }

  public login() {
    // Call the show method to display the widget.
    this.lock.show((error: string, profile: Object, id_token: string) => {
      this.log.debug('lock.show');
      this.log.debug(error);
      if (error) {
        console.log(error);
      }
      this.log.debug(profile);
      this.log.debug(id_token);
    });
  }

  public authenticated() {
    // Check if there's an unexpired JWT
    return tokenNotExpired();
  }

  public set current(user: IUser) {
    if (user) {
      // this.http.authToken = user.auth_token;
      this.log.debug(user);
      // persist to storage
      this.storage.setItem(StorageService.KEYS.USER, user);
      // this.storage.setItem(StorageService.KEYS.RECENT_USERNAME, user.email);
    } else {
      // clear storage
      this.storage.removeItem(StorageService.KEYS.USER);
    }
  }

  public get current(): IUser {
    let auth = this.authenticated();
    this.log.debug(`Current User token valid? ${auth}`);
    let value = this.storage.getItem(StorageService.KEYS.USER);
    this.log.debug(`Current User stored:`);
    this.log.debug(value);
    if (value) {
      return new UserModel(value);
    }
    return null;
  }
}
