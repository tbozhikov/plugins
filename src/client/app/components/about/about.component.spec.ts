// libs
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

// app
import { t } from '../../shared/test/index';
import { CoreModule } from '../../shared/core/core.module';
import { AnalyticsModule } from '../../shared/analytics/analytics.module';
import { MultilingualModule } from '../../shared/i18n/multilingual.module';
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
