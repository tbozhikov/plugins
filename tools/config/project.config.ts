import { join } from 'path';
import { SeedAdvancedConfig } from './seed-advanced.config';
import { ExtendPackages } from './seed.config.interfaces';

/**
 * This class extends the basic seed configuration, allowing for project specific overrides. A few examples can be found
 * below.
 */
export class ProjectConfig extends SeedAdvancedConfig {

  PROJECT_TASKS_DIR = join(process.cwd(), this.TOOLS_DIR, 'tasks', 'project');

  constructor() {
    super();
    this.APP_TITLE = 'Official source for NativeScript plugins';
    this.ENABLE_SCSS = true;

    /* Enable typeless compiler runs (faster) between typed compiler runs. */
    // this.TYPED_COMPILE_INTERVAL = 5;

    // Add `NPM` third-party libraries to be injected/bundled.
    this.NPM_DEPENDENCIES = [
      ...this.NPM_DEPENDENCIES,
      // {src: 'jquery/dist/jquery.min.js', inject: 'libs'},
    ];

    // Add `local` third-party libraries to be injected/bundled.
    this.APP_ASSETS = [
      ...this.APP_ASSETS,
      // {src: `${this.APP_SRC}/your-path-to-lib/libs/jquery-ui.js`, inject: true, vendor: false}
      // {src: `${this.CSS_SRC}/path-to-lib/test-lib.css`, inject: true, vendor: false},
    ];

    // dev
    this.SYSTEM_CONFIG.packages['angular2-jwt'] = {
      defaultExtension: 'js'
    };
    this.SYSTEM_CONFIG.paths['npm:'] = `node_modules/`;
    if (!this.SYSTEM_CONFIG.map) this.SYSTEM_CONFIG.map = {};
    this.SYSTEM_CONFIG.map['angular2-jwt'] = `npm:angular2-jwt/angular2-jwt.js`;

    // prod
    this.SYSTEM_BUILDER_CONFIG.paths['angular2-jwt'] = `node_modules/angular2-jwt/angular2-jwt.js`;

    let additionalPackages: ExtendPackages[] = [];

    additionalPackages.push(
      {
        name: '@ng-bootstrap/ng-bootstrap',
        path: `${this.APP_BASE}node_modules/@ng-bootstrap/ng-bootstrap/bundles/ng-bootstrap.js`,
        packageMeta: {
          main: 'bundles/ng-bootstrap.js',
          defaultExtension: 'js'
        }
      },
      {
        name: 'angular2-infinite-scroll',
        packageMeta: {
          main: 'angular2-infinite-scroll.js',
          defaultExtension: 'js'
        }
      },
      {
        name: 'showdown',
        packageMeta: {
          main: 'dist/showdown.min.js',
          defaultExtension: 'js'
        }
      },
      {
        name: 'moment',
        packageMeta: {
          main: 'min/moment.min.js',
          defaultExtension: 'js'
        }
      },
      {
        name: 'angular2-moment',
        packageMeta: {
          main: 'index.js',
          defaultExtension: 'js'
        }
      }
    );

    this.addPackagesBundles(additionalPackages);

    /* Add to or override NPM module configurations: */
    // this.mergeObject(this.PLUGIN_CONFIGS['browser-sync'], { ghostMode: false });
  }

}
