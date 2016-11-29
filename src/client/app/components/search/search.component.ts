import { Component, OnInit } from '@angular/core';

// libs
import { Observable } from 'rxjs/Observable';

// app
import { PluginService } from '../../frameworks/progress/index';

@Component({
    moduleId: module.id,
    selector: 'sd-search',
    templateUrl: 'search.component.html',
    styleUrls: ['search.component.css']
})
export class SearchComponent {
    model: any;
    searching = false;
    searchFailed = false;

    constructor(private pluginsService: PluginService) { }

    search = (text$: Observable<string>) =>
        text$
            .debounceTime(300)
            .distinctUntilChanged()
            .do(() => this.searching = true)
            .switchMap(term =>
                this.pluginsService.search(term)
                    .do(() => this.searchFailed = false)
                    .catch(() => {
                        this.searchFailed = true;
                        return Observable.of([]);
                    }))
            .do(() => this.searching = false);

}
