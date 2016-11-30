import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { PluginService, plugin } from '../../frameworks/progress/services/plugins.service';
import * as showdown from 'showdown';

@Component({
    moduleId: module.id,
    selector: 'sd-detail',
    templateUrl: 'plugin.component.html',
    styleUrls: ['plugin.component.css']
})
export class PluginComponent implements OnInit {
    Plugin: plugin;
    title: string;
    readme: string;
    constructor(private route: ActivatedRoute, private pluginService: PluginService) { }

    ngOnInit() {
        this.route.params.forEach((params: Params) => {
            this.title = params['id'];
            this.Plugin = this.pluginService.findPlugin(this.title);
            let converter = new showdown.Converter();
            this.readme = converter.makeHtml(this.Plugin.readme);
        });
    }
}