import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { PluginService } from '../../frameworks/progress/services/plugins.service';
import { IPlugin } from '../../frameworks/progress/models/index';
import * as showdown from 'showdown';

@Component({
    moduleId: module.id,
    selector: 'sd-detail',
    templateUrl: 'plugin.component.html',
    styleUrls: ['plugin.component.css']
})
export class PluginComponent implements OnInit {
    Plugin: IPlugin;
    title: string;
    readme: string;
    constructor(private route: ActivatedRoute, private pluginService: PluginService) { }

    ngOnInit() {
        this.route.params.forEach((params: Params) => {
            this.title = params['id'];
            this.pluginService.findPlugin(this.title).then((plugin) => {
              this.Plugin = plugin;
              let converter = new showdown.Converter();
              this.readme = converter.makeHtml(this.Plugin.readme);
            });
        });
    }
}
