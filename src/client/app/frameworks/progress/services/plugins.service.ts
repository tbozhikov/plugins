// angular
import { Injectable } from '@angular/core';
import { Jsonp, URLSearchParams } from '@angular/http';

// libs
import { ConfigService } from 'ng2-config';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

// app
import { Analytics, AnalyticsService } from '../../analytics/index';
import { LogService } from '../../core/services/log.service';
import { StorageService } from './storage.service';
import * as pluginActions from '../actions/plugin.action';
import { PluginModel, IPlugin } from '../models/index';
import { IPluginState } from '../states/index';
import { pluginsMock } from '../testing/mocks/plugins.mock';

@Injectable()
export class PluginService extends Analytics {

  constructor(
    public analytics: AnalyticsService,
    private store: Store<any>,
    private storage: StorageService,
    private log: LogService,
    public config: ConfigService,
    private _jsonp: Jsonp) {
    super(analytics);
  }

  public findPlugin(title: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.store.select('plugin').take(1).subscribe((state: IPluginState) => {
        for (let plugin of state.list) {
          if (plugin.title === title) {
            resolve(plugin);
          }
        }
      });
    });
  }

  public search(term: string): any {
    if (term === '') {
      return Observable.of([]);
    }

    let wikiUrl = 'https://en.wikipedia.org/w/api.php';
    let params = new URLSearchParams();
    params.set('search', term);
    params.set('action', 'opensearch');
    params.set('format', 'json');
    params.set('callback', 'JSONP_CALLBACK');

    return this._jsonp
      .get(wikiUrl, { search: params })
      .map(res => res.json())
      .map(response => {

        this.store.dispatch(new pluginActions.ChangedAction(response));
      });
  }

  public get cachedList(): Array<IPlugin | any> {
    let plugins = this.storage.getItem(StorageService.KEYS.PLUGINS);
    if (plugins) {
      return this.modelize(plugins);
    } else {
      return null;
    }
  }

  public set cachedList(list: Array<IPlugin | any>) {
    this.storage.setItem(StorageService.KEYS.PLUGINS, list);
    this.modelize(list);
  }

  private modelize(list: Array<any>): Array<PluginModel> {
    for (let i = 0; i < list.length; i++) {
      list[i] = new PluginModel(list[i]);
    }
    return list;
  }


}
