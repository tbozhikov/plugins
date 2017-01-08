import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { PluginService } from '../../frameworks/progress/services/plugins.service';
import { IPlugin } from '../../frameworks/progress/models/index';
import * as showdown from 'showdown';
// REMOVE BELOW AFTER API WIREUP
import { ReadMe } from '../../frameworks/progress/testing/mocks/plugins.mock';
@Component({
  moduleId: module.id,
  selector: 'sd-detail',
  templateUrl: 'plugin.component.html',
  styleUrls: ['plugin.component.css']
})
export class PluginComponent implements OnInit {
  Plugin: IPlugin;
  readme: string;
  constructor(private route: ActivatedRoute, private pluginService: PluginService) { }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      let id = params['id'];
      this.pluginService.findPlugin(id).then((plugin: IPlugin) => {
        this.Plugin = plugin;
        let converter = new showdown.Converter();
        //this.readme = converter.makeHtml(this.Plugin.readme);
        this.readme = converter.makeHtml(ReadMe); // JUST FOR WIREFRAME
      });
    });
  }
}
