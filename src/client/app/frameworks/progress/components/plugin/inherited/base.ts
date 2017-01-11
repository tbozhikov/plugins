import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

// app
import { IPlugin } from '../../../models/index';
import { IPluginState } from '../../../states/index';
import * as pluginActions from '../../../actions/plugin.action';

export class BasePlugin {

  constructor(public store: Store<any>) {

  }

  public onSelect(plugin: IPlugin) {
    console.log('Click');
    this.store.dispatch(new pluginActions.ViewDetailAction(plugin));
  }
}
