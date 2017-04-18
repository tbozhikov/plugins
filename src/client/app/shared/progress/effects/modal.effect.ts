// angular
import { Injectable } from '@angular/core';

// libs
import { Store, Action } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

// module
import { LogService } from '../../core/services/logging/log.service';
import { ModalService } from '../services/modal.service';
import * as actions from '../actions/modal.action';

@Injectable()
export class ModalEffects {

  @Effect({dispatch: false}) open$ = this.actions$
    .ofType(actions.ActionTypes.OPEN)
    .do(action => this.modal.open(action.payload));

  @Effect({dispatch: false}) close$ = this.actions$
    .ofType(actions.ActionTypes.CLOSE)
    .do(action => this.modal.close(action.payload));

  constructor(private store: Store<any>, private actions$: Actions, private log: LogService, private modal: ModalService) { }
}
