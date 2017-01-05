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
  public model: any;
  public search: Function;
  public searching = false;
  public searchFailed = false;

  constructor(private pluginsService: PluginService) {
    // function must be bound properly
    // https://ng-bootstrap.github.io/#/components/typeahead
    this.search = this.searchFn.bind(this);
  }

  public searchFn(text$: Observable<string>) {
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
