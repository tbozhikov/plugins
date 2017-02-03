import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Title }  from '@angular/platform-browser';
// app
import { RouterExtensions } from '../../../core/services/router-extensions.service';
import { Config } from '../../../core/utils/config';

@Component({
  moduleId: module.id,
  selector: 'sd-navbar',
  templateUrl: 'navbar.component.html',
  styleUrls: ['navbar.component.css']
})
export class NavbarComponent {

  public showViewAll: boolean;

  constructor(private router: Router, private titleService: Title) {
    router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        if (e.url.indexOf('/plugin/') > -1) {
          this.showViewAll = true;
        } else {
          this.showViewAll = false;
          // reset page title
          this.titleService.setTitle(Config.APP_TITLE);
        }

      }
    });
  }
}
