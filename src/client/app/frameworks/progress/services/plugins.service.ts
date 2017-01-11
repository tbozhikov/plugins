// angular
import { Injectable } from '@angular/core';
import { Jsonp, URLSearchParams } from '@angular/http';

// libs
import { ConfigService } from 'ng2-config';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { uniqBy, orderBy } from 'lodash';

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

  public findPlugin(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.store.select('plugin').take(1).subscribe((state: IPluginState) => {
        for (let plugin of state.list) {
          if (plugin.id === id) {
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
      this.log.debug(`found ${plugins.length} cached plugins.`);
      return this.serialize(plugins);
    } else {
      return null;
    }
  }

  public set cachedList(list: Array<IPlugin | any>) {
    this.store.select('plugin').take(1).subscribe((s: IPluginState) => {
      if (s.list && s.list.length) {
        // ensure uniqueness of list and order it
        list = orderBy(uniqBy(s.list.concat(list), (item: IPlugin) => item.id), [s.orderBy], [s.order]);
      }
      this.log.debug(`caching ${list.length} plugins.`);
      this.storage.setItem(StorageService.KEYS.PLUGINS, list);
      this.serialize(list);
    });
  }

  private serialize(list: Array<any>): Array<PluginModel> {
    for (let i = 0; i < list.length; i++) {
      list[i] = new PluginModel(list[i]);
    }
    return list;
  }


}
