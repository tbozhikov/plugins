import { Component, Input } from '@angular/core';

// libs
import { Store } from '@ngrx/store';

// app
import { BasePlugin } from './inherited/base';
import { RouterExtensions } from '../../../core/services/router-extensions.service';

@Component({
  moduleId: module.id,
  selector: 'plugin-row',
  templateUrl: 'plugin-row.component.html'
})
export class PluginRowComponent extends BasePlugin {
  @Input() plugin;

  constructor(public store: Store<any>, public router: RouterExtensions) {
    super(store, router);
  }
}
