// angular
import { NgModule } from '@angular/core';

// libs
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

let LIBS: any[] = [
  NgbModule
];

// 3rd party libs
@NgModule({
  imports: [
    LIBS,
    NgbModule.forRoot()
  ],
  providers: [
    // OAuthService,
  ],
  exports: [
    LIBS
  ]
})
export class LibsModule {

}
