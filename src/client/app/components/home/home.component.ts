import { ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { PluginService, plugin } from '../../services/plugins.service';
import { Router } from '@angular/router';
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
    this.store.dispatch({ type: AUTH_ACTIONS.LOGIN });
  }

  public logout() {
    this.store.dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }

  public toggle() {
    this.cardView = !this.cardView;
  }

  public onSelect(plugin: plugin) {
    console.log('Click')
    this.router.navigate(['/plugin', plugin.title]);
  }
}