import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
    moduleId: module.id,
    selector: 'sd-detail',
    templateUrl: 'plugin.component.html'
})
export class PluginComponent implements OnInit {
    title: string;
    constructor(private route: ActivatedRoute) { }

    ngOnInit() {
        this.route.params.forEach((params: Params) => {
            this.title = params['id'];
        });
    }
}