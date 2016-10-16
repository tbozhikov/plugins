// angular
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

// libs
import { MultilingualModule } from '../../frameworks/i18n/multilingual.module';

// app
import { t } from '../../frameworks/test/index';
import { CoreModule } from '../../frameworks/core/core.module';
import { AnalyticsModule } from '../../frameworks/analytics/analytics.module';
import { AboutComponent } from './about.component';

// test module configuration for each test
const testModuleConfig = () => {
  TestBed.configureTestingModule({
    imports: [CoreModule, RouterTestingModule, AnalyticsModule, MultilingualModule],
    declarations: [AboutComponent, TestComponent]
  });
};

export function main() {
  t.describe('@Component: AboutComponent', () => {

    t.be(testModuleConfig);

    t.it('should work',
      t.async(() => {
        TestBed.compileComponents()
          .then(() => {
            let fixture = TestBed.createComponent(TestComponent);
            fixture.detectChanges();
            let aboutDOMEl = fixture.debugElement.children[0].nativeElement;

	          t.e(aboutDOMEl.querySelectorAll('p')[0].textContent.trim()).toEqual('WIP');
          });
      }));
  });
}

@Component({
  selector: 'test-cmp',
  template: '<sd-about></sd-about>'
})
class TestComponent { }
