// angular
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

// libs
import { StoreModule } from '@ngrx/store';

// app
import { PROGRESS_COMPONENTS } from './components/index';
import { PROGRESS_PROVIDERS } from './services/index';
import { MultilingualModule } from '../i18n/multilingual.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpModule,
    RouterModule,
    MultilingualModule,
    StoreModule
  ],
  declarations: [
    PROGRESS_COMPONENTS
  ],
  providers: [
    PROGRESS_PROVIDERS
  ],
  exports: [
    PROGRESS_COMPONENTS,
    MultilingualModule
  ]
})
export class ProgressModule {

  constructor(@Optional() @SkipSelf() parentModule: ProgressModule) {
    if (parentModule) {
      throw new Error('ProgressModule already loaded; Import in root module only.');
    }
  }
}
