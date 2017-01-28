// angular
import { NgModule } from '@angular/core';

// libs
import { InfiniteScrollModule } from 'angular2-infinite-scroll';
import { MomentModule } from 'angular2-moment';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

const LIBS: any[] = [
  InfiniteScrollModule,
  MomentModule,
  NgbModule
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
