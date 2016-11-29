import { TestBed, getTestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { JsonpModule } from '@angular/http';

// app
import { t } from '../../test/index';
import { PluginService } from './plugins.service';

// test module configuration for each test
const testModuleConfig = () => {
  TestBed.configureTestingModule({
    imports: [JsonpModule],
    providers: [
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
      t.e(pluginService.getAll()).toEqual(pluginService.plugins);
    });
  });
}
