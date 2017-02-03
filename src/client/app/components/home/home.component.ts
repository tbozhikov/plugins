import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer } from '@angular/core';

// libs
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

// app
import { RouterExtensions } from '../../shared/core/index';
import { IAppState } from '../../shared/ngrx/index';
import { IUser, IPlugin } from '../../shared/progress/models/index';
import { IAuthState, IPluginState } from '../../shared/progress/states/index';
import * as authActions from '../../shared/progress/actions/auth.action';
import * as pluginActions from '../../shared/progress/actions/plugin.action';

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
  public sideBar: boolean = false;
  public isLoading: boolean = true;
  @ViewChild('sidebar') el: ElementRef;
  @ViewChild('mainBody') elBody: ElementRef;
  @ViewChild('preBar') elBar: ElementRef;

  private _subs: Array<Subscription>;

  constructor(private store: Store<any>, private router: RouterExtensions, public renderer: Renderer) {
    this._subs = [];
    // ensure no plugin is selected
    this.store.dispatch(new pluginActions.ChangedAction({ selected: null, searching: false }));
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
    if (this.sideBar) {
      // Resize main body of plugins
      this.renderer.setElementClass(this.elBody.nativeElement, 'hasSideBar', true);
      // Show the sidebar
      this.renderer.setElementClass(this.el.nativeElement, 'hide', false);
      // Resize the icon bar to show the toggle icon
      this.renderer.setElementClass(this.elBar.nativeElement, 'hasSideBar', true);
    } else {
      this.renderer.setElementClass(this.elBody.nativeElement, 'hasSideBar', false);
      this.renderer.setElementClass(this.elBar.nativeElement, 'hasSideBar', false);
      this.renderer.setElementClass(this.el.nativeElement, 'hide', true);
    }
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
