import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
// app
import { RouterExtensions } from '../../../core/services/router-extensions.service';

@Component({
  moduleId: module.id,
  selector: 'sd-navbar',
  templateUrl: 'navbar.component.html',
  styleUrls: ['navbar.component.css']
})
export class NavbarComponent {

  public showViewAll: boolean;

  constructor(private router: Router) {
    router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.showViewAll = e.url.indexOf('/plugin/') > -1;
      }
    });
  }
}
