import { Component, Input } from '@angular/core';

// libs
import { Store } from '@ngrx/store';

// app
import { RouterExtensions } from '../../../core/services/router-extensions.service';

@Component({
  moduleId: module.id,
  selector: 'sidebar',
  templateUrl: 'sidebar.component.html',

})
export class SidebarComponent {

  constructor(public store: Store<any>) {
  }

}
