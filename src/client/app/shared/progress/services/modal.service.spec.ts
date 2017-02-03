import { TestBed, getTestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

// libs
import { StoreModule, Store } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// app
import { t } from '../../test/index';
import { LogService } from '../../core/index';
import { CoreModule } from '../../core/core.module';
import { AnalyticsModule } from '../../analytics/analytics.module';
import * as actions from '../actions/modal.action';
import { ModalEffects } from '../effects/index';
import { modalReducer } from '../reducers/index';
import { IModalState, IModalOptions } from '../states/index';
import { ModalService } from './modal.service';

// test module configuration for each test
const testModuleConfig = () => {
  TestBed.configureTestingModule({
    imports: [
      CoreModule,
      AnalyticsModule,
      NgbModule.forRoot(),
      StoreModule.provideStore({
        modal: modalReducer
      }),
      EffectsModule.run(ModalEffects),
      RouterTestingModule
    ],
    providers: [
      ModalService
    ]
  });
};

export function main() {
  t.describe('progress: ModalService', () => {
    let injector: Injector;
    let modalService: ModalService;
    let log: LogService;
    let store: Store<any>;

    t.be(() => {
      testModuleConfig();
      injector = getTestBed();
      modalService = injector.get(ModalService);
      log = injector.get(LogService);
      store = injector.get(Store);
    });

    t.it('open/close', t.fakeAsync(() => {

      let options: IModalOptions = {
        cmpType: 'TestComponent',  // can pass string for testing (in practice, must be valid component type)
        props: {
          title: 'Login with...'
        }
      };
      store.dispatch(new actions.OpenAction(options));

      t.tick();
      store.select('modal').take(1).subscribe((state: IModalState) => {
        t.e(state.open).toBe(true);
        t.e(state.cmpType).toBe('TestComponent');
        t.e(state.title).toBe('Login with...');
      });

      store.dispatch(new actions.CloseAction({ resetState: true}));

      t.tick();
      store.select('modal').take(1).subscribe((state: IModalState) => {
        t.e(state.open).toBe(false);
        t.e(state.cmpType).toBeNull();
        t.e(state.title).toBeNull();
      });
    }));

    t.it('modalForceAction', t.fakeAsync(() => {

      let options: IModalOptions = {
        cmpType: 'TestComponent',  // can pass string for testing (in practice, must be valid component type)
        modalForceAction: true
      };
      store.dispatch(new actions.OpenAction(options));

      t.tick();
      t.e(modalService.modalForceAction).toBe(true);
      store.select('modal').take(1).subscribe((state: IModalState) => {
        t.e(state.open).toBe(true);
      });

      store.dispatch(new actions.CloseAction({ resetState: true}));

      t.tick();
      t.e(modalService.modalForceAction).toBe(false);
      store.select('modal').take(1).subscribe((state: IModalState) => {
        t.e(state.open).toBe(false);
      });
    }));
  });
};
