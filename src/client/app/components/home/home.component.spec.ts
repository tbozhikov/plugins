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
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

// app
import { t } from '../../shared/test/index';
import { CoreModule } from '../../shared/core/core.module';
import { AnalyticsModule } from '../../shared/analytics/analytics.module';
import { MultilingualModule } from '../../shared/i18n/multilingual.module';
import { authReducer } from '../../shared/progress/reducers/index';
import { AuthEffects } from '../../shared/progress/effects/index';
import { AuthService, AUTH_LOCK } from '../../shared/progress/services/auth.service';
import { StorageService } from '../../shared/progress/services/storage.service';
import { PluginService } from '../../shared/progress/services/plugins.service';
import { AuthLockMock } from '../../shared/progress/testing/index';
import { HomeComponent } from './home.component';
import { SearchComponent } from '../search/search.component';

// test module configuration for each test
const testModuleConfig = () => {
  TestBed.configureTestingModule({
    imports: [
      CoreModule, RouterTestingModule, AnalyticsModule, JsonpModule,
      InfiniteScrollModule,
      NgbModule.forRoot(),
      StoreModule.provideStore({ auth: authReducer }),
      EffectsModule.run(AuthEffects),
      MultilingualModule
    ],
    declarations: [HomeComponent, SearchComponent, TestComponent],
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
  t.describe('@Component: HomeComponent', () => {

    t.be(testModuleConfig);

    t.it('should work',
      t.async(() => {
        TestBed.compileComponents()
          .then(() => {
            let fixture = TestBed.createComponent(TestComponent);
            fixture.detectChanges();

            // let homeInstance = fixture.debugElement.children[0].componentInstance;
            let homeDOMEl = fixture.debugElement.children[0].nativeElement;

            t.e(homeDOMEl.querySelectorAll('p')[0].textContent.trim()).toBe('HEADING');
          });
      }));
  });
}

@Component({
  selector: 'test-cmp',
  template: '<sd-home></sd-home>'
})
class TestComponent {

}
