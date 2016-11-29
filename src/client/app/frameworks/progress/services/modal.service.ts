// angular
import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
// import { Router, NavigationStart, NavigationCancel, NavigationError, NavigationEnd } from '@angular/router';

// libs
import { Store, ActionReducer, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { NgbModal, NgbModalRef, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { isString } from 'lodash';

// app
import { LogService } from '../../core/index';
import * as actions from '../actions/modal.action';
import { IModalOptions } from '../states/index';

@Injectable()
export class ModalService {

  public modalForceAction: boolean;

  private _modalRef: NgbModalRef;

  constructor(private store: Store<any>, private modal: NgbModal, private router: Router, private log: LogService) {

    router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        this.store.dispatch(new actions.CloseAction());
      }
    });
  }

  public open(options: IModalOptions): void {
    let payload: any = { cmpType: options.cmpType };
    this._modalRef = !isString(options.cmpType) ? this.modal.open(options.cmpType, options.modalOptions) : null;
    if (options.props) {
      for (let key in options.props) {
        if (key === 'title') {
          payload.title = options.props[key];
        } else if (this._modalRef) {
          this._modalRef.componentInstance[key] = options.props[key];
        }
      }
    }
    if (this._modalRef) {
      this._modalRef.result.then((result: any) => {
        this.log.debug(`Modal closed with: ${result}`);
        this.reset();
      }, (reason: any) => {
        if (reason === ModalDismissReasons.BACKDROP_CLICK) {
          // could prompt user if unsaved changes
        }
        this.reset();
      });
    }
    this.modalForceAction = options.modalForceAction;

    this.store.dispatch(new actions.OpenedAction(payload));
  }

  public close(result?: any) {
    if (this._modalRef) {
      this._modalRef.close(result);
      this.store.dispatch(new actions.ClosedAction());
    }
  }

  public get modalRef(): NgbModalRef {
    return this._modalRef;
  }

  private reset() {
    this.modalForceAction = false;
    this._modalRef = undefined;
    this.store.dispatch(new actions.ClosedAction());
  }
}
