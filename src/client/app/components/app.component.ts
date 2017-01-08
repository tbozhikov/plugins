// angular
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
// any operators needed throughout your application
import './operators';

// libs
import { ConfigService } from 'ng2-config';

// app
import { AnalyticsService } from '../frameworks/analytics/index';
import { MultilingualService } from '../frameworks/i18n/index';
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
export class AppComponent implements OnInit {
  constructor(public analytics: AnalyticsService,
    public log: LogService,
    public config: ConfigService,
    public multilang: MultilingualService) {
    log.debug(`Config env: ${Config.ENVIRONMENT().ENV}`);
  }

  public onActivate(e, outlet) {
    // outlet.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  ngOnInit(): void {
    this.multilang.init(this.config.getSettings().i18n);
  }

}
