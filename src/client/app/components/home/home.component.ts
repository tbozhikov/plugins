import { ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';

// libs
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

// app
import { BaseComponent } from '../../frameworks/core/index';
import { IUser } from '../../frameworks/progress/models/index';
import { AUTH_ACTIONS, IAuthState } from '../../frameworks/progress/services/auth.service';

@BaseComponent({
  moduleId: module.id,
  selector: 'sd-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class HomeComponent implements OnInit, OnDestroy {
  public current: IUser;
  private _sub: Subscription;

  constructor(private store: Store<any>) {

  }

  public login() {
    this.store.dispatch({ type: AUTH_ACTIONS.LOGIN });
  }

  public logout() {
    this.store.dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }

  ngOnInit() {
    this._sub = this.store.select('auth').subscribe((auth: IAuthState) => {
      this.current = auth.current;
    });
  }

  ngOnDestroy() {
    if (this._sub) this._sub.unsubscribe();
  }
}
