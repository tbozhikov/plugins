import { TestBed, getTestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';

// app
import { t } from '../../test/index';
import { WindowService } from '../../core/index';
import { CoreModule } from '../../core/core.module';
import { AuthService } from './auth.service';

var lsCache: any = {};

class WindowMock {
  public localStorage: any = {
    setItem: (key, value) => {
      lsCache[key] = value;
      console.log(key, value);
    },
    getItem: (key) => {
      return lsCache[key];
    },
    removeItem: (key) => {
      delete lsCache[key];
    }
  };
}
// test module configuration for each test
const testModuleConfig = () => {
  TestBed.configureTestingModule({
    imports: [
      CoreModule.forRoot([{provide: WindowService, useClass: WindowMock }])
    ],
    providers: [
      AuthService
    ]
  });
};

export function main() {
  t.describe('progress: AuthService', () => {
    let injector: Injector;
    let auth: AuthService;
    let spy: any;

    t.be(() => {
      testModuleConfig();
      injector = getTestBed();
      auth = injector.get(AuthService);
      spy = t.spyOn(console, 'log');
    });

    // t.it('setItem', () => {
    //   storage.setItem('test', { title: 'Test' });
    //   t.e(spy).toHaveBeenCalledWith('test', '{"title":"Test"}');
    // });
  });
}
