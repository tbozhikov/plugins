import { ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

// libs
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

// app
import { BaseComponent, RouterExtensions } from '../../frameworks/core/index';
import { IAppState } from '../../frameworks/ngrx/index';
import { IUser } from '../../frameworks/progress/models/index';
import { IAuthState } from '../../frameworks/progress/states/index';
import * as authActions from '../../frameworks/progress/actions/auth.action';
import { PluginService, plugin } from '../../frameworks/progress/services/plugins.service';

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
  constructor(private store: Store<any>, private pluginService: PluginService, private router: Router) {
    this.plugins = this.pluginService.getAll();
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

  public onSelect(plugin: plugin) {
    console.log('Click')
    this.router.navigate(['/plugin', plugin.title]);
  }
}
