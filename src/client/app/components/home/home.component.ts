import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';

// libs
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

// app
import { RouterExtensions } from '../../frameworks/core/index';
import { IAppState } from '../../frameworks/ngrx/index';
import { IUser, IPlugin } from '../../frameworks/progress/models/index';
import { IAuthState } from '../../frameworks/progress/states/index';
import * as authActions from '../../frameworks/progress/actions/auth.action';

@Component({
  moduleId: module.id,
  selector: 'sd-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class HomeComponent implements OnInit, OnDestroy {
  public current: IUser;
  public plugins$: Observable<any>;
  public cardView: boolean;
  private _sub: Subscription;
  constructor(private store: Store<any>, private router: RouterExtensions) {
    this.plugins$ = store.select('plugin');
    this.cardView = true;
  }

  ngOnInit() {
    this._sub = this.store.select('auth').subscribe((auth: IAuthState) => {
      this.current = auth.current;
    });
  }

  ngOnDestroy() {
    if (this._sub) this._sub.unsubscribe();
  }
  public login() {
    this.store.dispatch(new authActions.LoginAction());
  }

  public logout() {
    this.store.dispatch(new authActions.LogoutAction());
  }

  public toggle() {
    this.cardView = !this.cardView;
  }

  public onSelect(plugin: IPlugin) {
    console.log('Click');
    this.router.navigate(['/plugin', plugin.title]);
  }
}
