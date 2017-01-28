import { TestBed, getTestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { JsonpModule } from '@angular/http';

// app
import { t } from '../../test/index';
import { TEST_CORE_PROVIDERS } from '../../core/testing/index';
import { PluginService } from './plugins.service';

// test module configuration for each test
const testModuleConfig = () => {
  TestBed.configureTestingModule({
    imports: [JsonpModule],
    providers: [
      TEST_CORE_PROVIDERS(),
      PluginService
    ]
  });
};

export function main() {
  t.describe('Plugins Service', () => {
    let injector: Injector;
    let pluginService: PluginService;

    t.be(() => {
      testModuleConfig();
      injector = getTestBed();
      pluginService = injector.get(PluginService);
    });

    t.it('should return hardcoded values', () => {
      t.e(pluginService.cachedList.length).toBe(8);
    });
  });
}
