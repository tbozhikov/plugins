import { Injectable } from '@angular/core';
import { Jsonp, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';

import { LogService } from '../../core/services/log.service';
import { StorageService } from './storage.service';
import * as pluginActions from '../actions/plugin.action';
import { PluginModel, IPlugin } from '../models/index';
import { IPluginState } from '../states/index';
import { pluginsMock } from '../testing/mocks/plugins.mock';

@Injectable()
export class PluginService {

    constructor(private store: Store<any>, private storage: StorageService, private log: LogService, private _jsonp: Jsonp) { }

    findPlugin(title: string): Promise<any> {
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

    search(term: string):any {
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

  public get cachedList(): Array<IPlugin> {
    let plugins = pluginsMock;//this.storage.getItem(StorageService.KEYS.PLUGINS);
    if (plugins) {
      for (let i = 0; i < plugins.length; i++) {
        plugins[i] = new PluginModel(plugins[i]);
      }
      return plugins;
    }
    return null;
  }


}
