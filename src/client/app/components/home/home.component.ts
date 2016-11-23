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
  plugins: Array<plugin>;
  cardView: boolean;
  constructor(private store: Store<any>) {
    this.plugins = plugins;
    this.cardView = true;
  }

  public login() {
    this.store.dispatch({ type: AUTH_ACTIONS.LOGIN });
  }

  public logout() {
    this.store.dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }

  public toggle() {
    this.cardView = !this.cardView;
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
declare class plugin {
  title: string;
  author: string;
  stars: number;
  description: string;
  ios: boolean;
  android: boolean;
  repo: string;
}

var plugins: Array<plugin> = [
  {
    title: 'SQLLite',
    author: 'nathanael',
    stars: 5,
    description: 'A sqlite Nativescript module for ios and android',
    ios: true,
    android: true,
    repo: 'https://github.com/nathanael/sqlite'
  },
  {
    title: 'Shimer',
    author: 'walkerrunpdx',
    stars: 5,
    description: 'Facebook shimer effect plugin',
    ios: true,
    android: true,
    repo: 'https://github.com/walkerrunpdx/shimer'
  },
  {
    title: 'Orientation',
    author: 'nathanael',
    stars: 5,
    description: 'A sqlite Nativescript module for ios and android',
    ios: true,
    android: true,
    repo: 'https://github.com/nathanael/sqlite'
  },
  {
    title: 'CardView',
    author: 'walkerrunpdx',
    stars: 5,
    description: 'Facebook shimer effect plugin',
    ios: true,
    android: true,
    repo: 'https://github.com/walkerrunpdx/shimer'
  },
  {
    title: 'SQLLite',
    author: 'nathanael',
    stars: 5,
    description: 'A sqlite Nativescript module for ios and android',
    ios: true,
    android: true,
    repo: 'https://github.com/nathanael/sqlite'
  },
  {
    title: 'Shimer',
    author: 'walkerrunpdx',
    stars: 5,
    description: 'Facebook shimer effect plugin',
    ios: true,
    android: true,
    repo: 'https://github.com/walkerrunpdx/shimer'
  }
]