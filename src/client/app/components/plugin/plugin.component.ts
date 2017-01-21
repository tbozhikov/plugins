import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

// libs
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

import { PluginService } from '../../frameworks/progress/services/plugins.service';
import { IPlugin } from '../../frameworks/progress/models/index';
import * as pluginActions from '../../frameworks/progress/actions/plugin.action';
import { IPluginState } from '../../frameworks/progress/states/plugin.state';
import * as showdown from 'showdown';

@Component({
  moduleId: module.id,
  selector: 'sd-detail',
  templateUrl: 'plugin.component.html',
  styleUrls: ['plugin.component.css']
})
export class PluginComponent implements OnInit, OnDestroy {
  plugin: IPlugin;
  pluginName: string;
  readme: string;
  loading: boolean = true;
  private _subs: Array<Subscription>;

  constructor(private store: Store<any>, private route: ActivatedRoute, private pluginService: PluginService) {
    this._subs = [];
  }

  ngOnInit() {
    this._subs.push(this.store.select('plugin').subscribe((s: IPluginState) => {
      if (s.selected && !s.searching) {
        this.loading = false;
        this.plugin = s.selected;
        this.pluginName = this.plugin.name;
        let converter: any = new showdown.Converter({tables: true});
        converter.setFlavor('github');
        if (this.plugin.readme) {
          this.readme = converter.makeHtml(this.plugin.readme); // <-- JUST FOR WIREFRAME
        } else {
          this.readme = 'No readme found.';
        }
      }
    }));
    this._subs.push(this.route.params.subscribe((params: Params) => {
      let id = params['id'];
      // console.log('route params:', id);
      this.pluginService.findPlugin(id).then((plugin: IPlugin) => {
        // try to show some details off cached data if available
        this.pluginName = plugin.name;
      });
      // fetch plugin detail
      this.store.dispatch(new pluginActions.ViewDetailAction(id));
    }));
  }

  ngOnDestroy() {
    for (let s of this._subs) {
      s.unsubscribe();
    }
  }
}
