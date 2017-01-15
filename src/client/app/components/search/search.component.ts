import { Component, OnInit } from '@angular/core';

// libs
import { Store } from '@ngrx/store';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';

// app
import { RouterExtensions } from '../../frameworks/core/services/router-extensions.service';
import { PluginService } from '../../frameworks/progress/services/plugins.service';
import * as pluginActions from '../../frameworks/progress/actions/plugin.action';

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

  constructor(private store: Store<any>, private pluginsService: PluginService, private router: RouterExtensions) {
    // function must be bound properly
    // https://ng-bootstrap.github.io/#/components/typeahead
    this.search = this.searchFn.bind(this);
  }

  public searchFn(text$: Observable<string>) {
    return text$
      .debounceTime(300)
      .distinctUntilChanged()
      .do(() => this.searching = true)
      .switchMap(term =>
        this.pluginsService.search(term)
          .do((res) => {
            // console.log(`search result:`, res);
            this.searchFailed = false;
          })
          .catch(() => {
            this.searchFailed = true;
            return Observable.of([]);
          }))
      .do((res) => {
        // console.log(res);
        this.searching = false;
      });
  }

  public selectItem(e: NgbTypeaheadSelectItemEvent) {
    if (e.item) {
      // we clear selected state before changing route since we want to allow searching to work on plugin detail page as well
      this.store.dispatch(new pluginActions.ChangedAction({ selected: null, searching: false }));
      setTimeout(() => {
        this.router.navigate(['/plugin', e.item.name]);
      }, 500);
    }
  }

  public valueFormatter(value: any): string {
    if (value) {
      return value.name;
    }
    return '';
  }

}
