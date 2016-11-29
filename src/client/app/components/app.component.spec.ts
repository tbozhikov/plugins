import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Route } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { t } from '../frameworks/test/index';
import { TEST_CORE_PROVIDERS, TEST_HTTP_PROVIDERS } from '../frameworks/core/testing/index';
import { MultilingualModule } from '../frameworks/i18n/multilingual.module';
import { NavbarComponent, ToolbarComponent } from '../frameworks/progress/components/index';
import { AUTH_LOCK } from '../frameworks/progress/services/auth.service';
import { AuthLockMock } from '../frameworks/progress/testing/index';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { SearchComponent } from './search/search.component';

const config:Route[] = [
  {path: '', component: HomeComponent},
  {path: 'about', component: AboutComponent}
];

// test module configuration for each test
const testModuleConfig = () => {
  TestBed.configureTestingModule({
    imports: [
      FormsModule,
      MultilingualModule,
      NgbModule.forRoot(),
      StoreModule.provideStore({}),
      RouterTestingModule.withRoutes(config)
    ],
    declarations: [
      TestComponent, AppComponent,
      HomeComponent, AboutComponent,
      SearchComponent,
      NavbarComponent, ToolbarComponent
    ],
    providers: [
      TEST_CORE_PROVIDERS(),
      TEST_HTTP_PROVIDERS(),
      { provide: AUTH_LOCK, useValue: AuthLockMock }
    ]
  });
};

export function main() {
  t.describe('@Component: AppComponent', () => {
    let spy;

    t.be(() => {
      testModuleConfig();
      spy = t.spyOn(console, 'log');
    });

    t.it('should build without a problem',
      t.async(() => {
        TestBed.compileComponents()
          .then(() => {
            let fixture = TestBed.createComponent(TestComponent);
            fixture.detectChanges();
            t.e(fixture.nativeElement).toBeTruthy();
          });
      }));
  });
}

@Component({
  selector: 'test-cmp',
  template: '<sd-app></sd-app>'
})
class TestComponent {}
