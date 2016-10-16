// libs
import { Store } from '@ngrx/store';

// app
import { BaseComponent } from '../../frameworks/core/index';

@BaseComponent({
  moduleId: module.id,
  selector: 'sd-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
})
export class HomeComponent {

  constructor(private store: Store<any>) {
    
  }
}
