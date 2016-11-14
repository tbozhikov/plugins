// angular
import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { Http } from '@angular/http';

// libs
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { TranslateLoader } from 'ng2-translate';
import { AUTH_PROVIDERS } from 'angular2-jwt';

// app
import { AppComponent } from './app/components/app.component';
import { HomeComponent } from './app/components/home/home.component';
import { AboutComponent } from './app/components/about/about.component';
import { routes } from './app/components/app.routes';

// feature modules
import { CoreModule } from './app/frameworks/core/core.module';
import { AnalyticsModule } from './app/frameworks/analytics/analytics.module';
import { multilingualReducer, MultilingualEffects } from './app/frameworks/i18n/index';
import { MultilingualModule, translateFactory } from './app/frameworks/i18n/multilingual.module';
import { LibsModule } from './libs.module';
import { modalReducer, ModalEffects } from './app/frameworks/progress/index';
import { ProgressModule } from './app/frameworks/progress/progress.module';

// config
import { Config, WindowService, ConsoleService } from './app/frameworks/core/index';
Config.PLATFORM_TARGET = Config.PLATFORMS.WEB;
if (String('<%= BUILD_TYPE %>') === 'dev') {
  // only output console logging in dev mode
  Config.DEBUG.LEVEL_4 = true;
}

// sample config (extra)
import { AppConfig, authReducer, AuthEffects } from './app/frameworks/progress/index';
import { MultilingualService } from './app/frameworks/i18n/services/multilingual.service';
// custom i18n language support
MultilingualService.SUPPORTED_LANGUAGES = AppConfig.SUPPORTED_LANGUAGES;

let routerModule = RouterModule.forRoot(routes);

if (String('<%= TARGET_DESKTOP %>') === 'true') {
  Config.PLATFORM_TARGET = Config.PLATFORMS.DESKTOP;
  // desktop (electron) must use hash
  routerModule = RouterModule.forRoot(routes, {useHash: true});
}

// dev tools (only used during development - not included in production)
let DEV_TOOLS: any[] = [];
let DEV_TOOLS_EXPORT: any[] = [];
if (String('<%= BUILD_TYPE %>') !== 'prod') {

  let devTools = require('@ngrx/store-devtools').StoreDevtoolsModule;
  DEV_TOOLS_EXPORT.push(devTools);
// import { StoreLogMonitorModule, useLogMonitor } from '@ngrx/store-log-monitor';
  DEV_TOOLS = [
    devTools.instrumentOnlyWithExtension()
    // StoreDevtoolsModule.instrumentStore({
    //   monitor: useLogMonitor({
    //     visible: false,
    //     position: 'right'
    //   })
    // }),
    // StoreLogMonitorModule
  ];
}

declare var window, console;

// For AoT compilation to work:
export function win() {
  return window;
}
export function cons() {
  return console;
}

@NgModule({
  imports: [
    BrowserModule,
    CoreModule.forRoot([
      { provide: WindowService, useFactory: (win) },
      { provide: ConsoleService, useFactory: (cons) }
    ]),
    routerModule,
    AnalyticsModule,
    MultilingualModule.forRoot([{
      provide: TranslateLoader,
      deps: [Http],
      useFactory: (translateFactory)
    }]),
    ProgressModule,
    StoreModule.provideStore({
      auth: authReducer,
      i18n: multilingualReducer,
      modal: modalReducer
    }),
    EffectsModule.run(AuthEffects),
    EffectsModule.run(ModalEffects),
    EffectsModule.run(MultilingualEffects),
    // 3rd party lib module
    LibsModule,
    // dev tools (empty in production)
    DEV_TOOLS
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent
  ],
  providers: [
    {
      provide: APP_BASE_HREF,
      useValue: '<%= APP_BASE %>'
    },
    AUTH_PROVIDERS
  ],
  bootstrap: [AppComponent]
})

export class WebModule { }
