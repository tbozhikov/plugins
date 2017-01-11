import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

// app
import { RouterExtensions } from '../../../../core/services/router-extensions.service';
import { IPlugin } from '../../../models/index';
import { IPluginState } from '../../../states/index';
import * as pluginActions from '../../../actions/plugin.action';

export class BasePlugin {

  constructor(public store: Store<any>, public router: RouterExtensions) {

  }

  public onSelect(plugin: IPlugin) {
    this.router.navigate([`/plugin`, plugin.name]);
  }
}
