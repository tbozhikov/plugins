import { Component, OnInit } from '@angular/core';

// libs
import { Observable } from 'rxjs/Observable';

// app
import { PluginService } from '../../frameworks/progress/services/plugins.service';

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

    public search(text$: Observable<string>) {
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

}
