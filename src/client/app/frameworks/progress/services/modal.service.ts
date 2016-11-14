// angular
import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
// import { Router, NavigationStart, NavigationCancel, NavigationError, NavigationEnd } from '@angular/router';

// libs
import { Store, ActionReducer, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { NgbModal, NgbModalRef, NgbModalOptions, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { isString } from 'lodash';

// app
import { LogService } from '../../core/index';

const CATEGORY: string = 'Modal';

// ngrx setup
export interface IModalState {
  open: boolean;
  cmpType?: any;
  title?: string;
}

const initialState: IModalState = {
  open: false
};

interface IMODAL_ACTIONS {
  OPEN: string;
  OPENED: string;
  CLOSE: string;
  CLOSED: string;
}

export const MODAL_ACTIONS: IMODAL_ACTIONS = {
  OPEN: `${CATEGORY}_OPEN`,
  OPENED: `${CATEGORY}_OPENED`,
  CLOSE: `${CATEGORY}_CLOSE`,
  CLOSED: `${CATEGORY}_CLOSED`
};

export function modalReducerFn(state: IModalState = initialState, action: Action) {
  let changeState = () => {
    return Object.assign({}, state, action.payload);
  };
  switch (action.type) {
    case MODAL_ACTIONS.OPENED:
      action.payload = { open: true, cmpType: action.payload.cmpType, title: action.payload.title };
      return changeState();
    case MODAL_ACTIONS.CLOSED:
      action.payload = { open: false, cmpType: null, title: null };
      return changeState();
    default:
      return state;
  }
};

export const modalReducer: ActionReducer<IModalState> = modalReducerFn;
// ngrx end

export interface IModalOptions {
  cmpType: any;
  props?: any;
  modalOptions?: NgbModalOptions;
  modalForceAction?: boolean;
}

@Injectable()
export class ModalService {

  public modalForceAction: boolean;

  private _modalRef: NgbModalRef;

  constructor(private store: Store<any>, private modal: NgbModal, private router: Router, private log: LogService) {

    router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        this.store.dispatch({ type: MODAL_ACTIONS.CLOSE });
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

    this.store.dispatch({ type: MODAL_ACTIONS.OPENED, payload });
  }

  public close(result?: any) {
    if (this._modalRef) {
      this._modalRef.close(result);
      this.store.dispatch({ type: MODAL_ACTIONS.CLOSED });
    }
  }

  public get modalRef(): NgbModalRef {
    return this._modalRef;
  }

  private reset() {
    this.modalForceAction = false;
    this._modalRef = undefined;
    this.store.dispatch({ type: MODAL_ACTIONS.CLOSED });
  }
}

@Injectable()
export class ModalEffects {

  @Effect({dispatch: false}) open$ = this.actions$
    .ofType(MODAL_ACTIONS.OPEN)
    .do(action => this.modal.open(action.payload));

  @Effect({dispatch: false}) close$ = this.actions$
    .ofType(MODAL_ACTIONS.CLOSE)
    .do(action => this.modal.close(action.payload));

  constructor(private store: Store<any>, private actions$: Actions, private log: LogService, private modal: ModalService) { }
}
