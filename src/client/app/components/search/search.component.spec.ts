// angular
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
  BaseRequestOptions,
  ConnectionBackend,
  Http
} from '@angular/http';
import { MockBackend } from '@angular/http/testing';

// libs
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { t } from '../../frameworks/test/index';
import { CoreModule } from '../../frameworks/core/core.module';
import { AnalyticsModule } from '../../frameworks/analytics/analytics.module';
import { MultilingualModule } from '../../frameworks/i18n/multilingual.module';
import { authReducer, AuthEffects, AuthService, AUTH_LOCK, StorageService } from '../../frameworks/progress/index';
import { AuthLockMock } from '../../frameworks/progress/testing/index';
import { SearchComponent } from './search.component';

// test module configuration for each test
const testModuleConfig = () => {
  TestBed.configureTestingModule({
    imports: [
      CoreModule, RouterTestingModule, AnalyticsModule,
      StoreModule.provideStore({ auth: authReducer }),
      EffectsModule.run(AuthEffects),
      MultilingualModule
    ],
    declarations: [SearchComponent, TestComponent],
    providers: [
      AuthService,
      StorageService,
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
  t.describe('@Component: SearchComponent', () => {

    t.be(testModuleConfig);

    t.it('should work',
      t.async(() => {
        TestBed.compileComponents()
          .then(() => {
            let fixture = TestBed.createComponent(TestComponent);
            fixture.detectChanges();

            // let searchInstance = fixture.debugElement.children[0].componentInstance;
            let domEl = fixture.debugElement.children[0].nativeElement;

            t.e(domEl.querySelectorAll('.form-group').html()).toBe('HEADING');
          });
      }));
  });
}

@Component({
  selector: 'test-cmp',
  template: '<sd-search></sd-search>'
})
class TestComponent {

}
