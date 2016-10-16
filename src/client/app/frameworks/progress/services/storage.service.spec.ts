import { TestBed, getTestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';

// app
import { t } from '../../test/index';
import { WindowService } from '../../core/index';
import { CoreModule } from '../../core/core.module';
import { StorageService } from './storage.service';

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
      StorageService
    ]
  });
};

export function main() {
  t.describe('progress: StorageService', () => {
    let injector: Injector;
    let storage: StorageService;
    let spy: any;

    t.be(() => {
      testModuleConfig();
      injector = getTestBed();
      storage = injector.get(StorageService);
      spy = t.spyOn(console, 'log');
    });

    t.it('KEYS', () => {
      t.e(StorageService.KEYS).toEqual({
        USER: 'tns-plugins-user',
        RECENT_USERNAME: 'tns-plugins-recent-username'
      });
    });

    t.it('setItem', () => {
      storage.setItem('test', { title: 'Test' });
      t.e(spy).toHaveBeenCalledWith('test', '{"title":"Test"}');
    });

    t.it('getItem', () => {
      let item = storage.getItem('test');
      t.e(item).toEqual({ title: 'Test' });
    });

    t.it('removeItem', () => {
      storage.removeItem('test');
      t.e(lsCache).toEqual({});
    });
  });
}
