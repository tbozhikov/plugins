import { join } from 'path';
import { SeedAdvancedConfig } from './seed-advanced.config';

/**
 * This class extends the basic seed configuration, allowing for project specific overrides. A few examples can be found
 * below.
 */
export class ProjectConfig extends SeedAdvancedConfig {

  PROJECT_TASKS_DIR = join(process.cwd(), this.TOOLS_DIR, 'tasks', 'project');

  constructor() {
    super();
    this.APP_TITLE = 'The Official NativeScript Plugins Resource';
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
      defaultExtension : 'js'
    };
    this.SYSTEM_CONFIG.paths['npm:'] = `${this.APP_BASE}node_modules/`;
    if (!this.SYSTEM_CONFIG.map) this.SYSTEM_CONFIG.map = {};
    this.SYSTEM_CONFIG.map['angular2-jwt'] = `npm:angular2-jwt/angular2-jwt`;
    this.SYSTEM_CONFIG.map['js-base64'] = `npm:js-base64/base64`;
    // all this stuff is nonsense but needed for angular2-jwt
    this.SYSTEM_CONFIG.map['base64-js'] = `npm:base64-js/index`;
    this.SYSTEM_CONFIG.map['buffer'] = `npm:buffer/index`;
    this.SYSTEM_CONFIG.map['ieee754'] = `npm:ieee754/index`;

    // prod
    // this.SYSTEM_BUILDER_CONFIG.packages['angular2-jwt'] = {
    //   defaultExtension : 'js'
    // };
    this.SYSTEM_BUILDER_CONFIG.paths['angular2-jwt'] = `node_modules/angular2-jwt/angular2-jwt.js`;
    this.SYSTEM_BUILDER_CONFIG.paths['js-base64'] = `node_modules/js-base64/base64.js`;
    this.SYSTEM_BUILDER_CONFIG.paths['base64-js'] = `node_modules/base64-js/index.js`;
    this.SYSTEM_BUILDER_CONFIG.paths['buffer'] = `node_modules/buffer/index.js`;
    this.SYSTEM_BUILDER_CONFIG.paths['ieee754'] = `node_modules/ieee754/index.js`;

    /* Add to or override NPM module configurations: */
    // this.mergeObject(this.PLUGIN_CONFIGS['browser-sync'], { ghostMode: false });
  }

}
