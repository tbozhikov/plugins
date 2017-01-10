// angular
import { NgModule } from '@angular/core';

// libs
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InfiniteScrollModule } from 'angular2-infinite-scroll';

const LIBS: any[] = [
  NgbModule,
  InfiniteScrollModule
];

// 3rd party libs
@NgModule({
  imports: [
    ...LIBS,
    NgbModule.forRoot()
  ],
  providers: [
    // OAuthService,
  ],
  exports: [
    ...LIBS
  ]
})
export class LibsModule {

}
