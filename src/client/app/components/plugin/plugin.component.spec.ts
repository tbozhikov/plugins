// angular
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
  BaseRequestOptions,
  ConnectionBackend,
  Http,
  JsonpModule
} from '@angular/http';
import { MockBackend } from '@angular/http/testing';

// libs
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MomentModule } from 'angular2-moment';

import { t } from '../../shared/test/index';
import { CoreModule } from '../../shared/core/core.module';
import { AnalyticsModule } from '../../shared/analytics/analytics.module';
import { MultilingualModule } from '../../shared/i18n/multilingual.module';
import { authReducer } from '../../shared/progress/reducers/index';
import { AuthEffects } from '../../shared/progress/effects/index';
import { AuthService, AUTH_LOCK } from '../../shared/progress/services/auth.service';
import { PluginService } from '../../shared/progress/services/plugins.service';
import { StorageService } from '../../shared/progress/services/storage.service';
import { AuthLockMock } from '../../shared/progress/testing/index';
import { PluginComponent } from './plugin.component';

// test module configuration for each test
const testModuleConfig = () => {
  TestBed.configureTestingModule({
    imports: [
      CoreModule, RouterTestingModule, AnalyticsModule, JsonpModule,
      MomentModule,
      NgbModule.forRoot(),
      StoreModule.provideStore({ auth: authReducer }),
      EffectsModule.run(AuthEffects),
      MultilingualModule
    ],
    declarations: [PluginComponent, TestComponent],
    providers: [
      AuthService,
      StorageService,
      PluginService,
      { provide: AUTH_LOCK, useValue: AuthLockMock },
      BaseRequestOptions,
      MockBackend,
      {
        provide: Http, useFactory: function (backend: ConnectionBackend, defaultOptions: BaseRequestOptions) {
          return new Http(backend, defaultOptions);
        },
        deps: [MockBackend, BaseRequestOptions]
      }
    ]
  });
};

export function main() {
  t.describe('@Component: PluginComponent', () => {

    t.be(testModuleConfig);

    t.it('should work',
      t.async(() => {
        TestBed.compileComponents()
          .then(() => {
            let fixture = TestBed.createComponent(TestComponent);
            fixture.detectChanges();

            // let searchInstance = fixture.debugElement.children[0].componentInstance;
            let domEl = fixture.debugElement.children[0].nativeElement;

            t.e(domEl).toBeDefined();
            // t.e(domEl.querySelectorAll('.form-group')[0].innerHTML).toBe('HEADING');
          });
      }));
  });
}

@Component({
  selector: 'test-cmp',
  template: '<sd-detail></sd-detail>'
})
class TestComponent {

}
