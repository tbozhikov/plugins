// angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
// any operators needed throughout your application
import './operators';

// app
import { AnalyticsService } from '../frameworks/analytics/index';
import { Config, LogService } from '../frameworks/core/index';

/**
 * This class represents the main application component.
 */
@Component({
  moduleId: module.id,
  selector: 'sd-app',
  templateUrl: 'app.component.html',
  changeDetection: ChangeDetectionStrategy.Default // Everything else uses OnPush
})
export class AppComponent {
  constructor(public analytics: AnalyticsService, public log: LogService) {
    log.debug(`Config env: ${Config.ENVIRONMENT().ENV}`);
  }

  public onActivate(e, outlet) {
    // outlet.scrollTop = 0;
    window.scrollTo(0, 0);
  }
}
