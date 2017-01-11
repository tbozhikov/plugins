import { Component, OnInit, OnDestroy } from '@angular/core';

// libs
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

// app
import { RouterExtensions } from '../../frameworks/core/index';
import { IAppState } from '../../frameworks/ngrx/index';
import { IUser, IPlugin } from '../../frameworks/progress/models/index';
import { IAuthState, IPluginState } from '../../frameworks/progress/states/index';
import * as authActions from '../../frameworks/progress/actions/auth.action';
import * as pluginActions from '../../frameworks/progress/actions/plugin.action';

@Component({
  moduleId: module.id,
  selector: 'sd-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  public current: IUser;
  public plugins: Array<IPlugin> = [];
  public total: number = 0;
  public cardView: boolean;
  public sideBar: boolean;
  public isLoading: boolean = true;
  private _subs: Array<Subscription>;
  constructor(private store: Store<any>, private router: RouterExtensions) {
    this._subs = [];
    // ensure no plugin is selected
    this.store.dispatch(new pluginActions.ViewDetailAction(null));
    this.cardView = true;
  }

  ngOnInit() {
    this._subs.push(this.store.select('auth').subscribe((auth: IAuthState) => {
      this.current = auth.current;
    }));
    this._subs.push(this.store.select('plugin').subscribe((s: IPluginState) => {
      this.plugins = s.list;
      this.total = s.total;
      if (this.plugins.length) {
        this.isLoading = false;
      }

      if (s.selected) {
        this.router.navigate(['/plugin', s.selected.id]);
      }
    }));
  }

  ngOnDestroy() {
    for (let sub of this._subs) {
      sub.unsubscribe();
    }
  }
  public login() {
    this.store.dispatch(new authActions.LoginAction());
  }

  public logout() {
    this.store.dispatch(new authActions.LogoutAction());
  }

  public toggleCard() {
    this.cardView = !this.cardView;
  }

  public toggleSideBar() {
    this.sideBar = !this.sideBar;
  }

  public onScroll() {
    if (!this.isLoading) {
      this.isLoading = true;
      this.store.select('plugin').take(1).subscribe((s: IPluginState) => {
        if (s.list.length < s.total) {
          // load next batch
          this.store.dispatch(new pluginActions.FetchAction({
            limit: s.limit,
            offset: s.offset + 100,
            order: s.order,
            sort: s.orderBy
          }));
        } else {
          // no more to load
          this.isLoading = false;
        }
      });
    }
  }
}
