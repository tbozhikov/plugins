import { Component } from '@angular/core';

// app
import { ModalService } from '../../services/modal.service';

// libs
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  moduleId: module.id,
  selector: 'modal-component',
  templateUrl: 'modal.component.html'
})
export class ModalComponent {
  public modalState$: Observable<any>;

  constructor(private store: Store<any>, public activeModal: NgbActiveModal, public modalService: ModalService) {
    this.modalState$ = store.select('modal');
  }

  public save() {
    // TODO: implement header or footer save button
    // action should be dispatched
    return;
  }
}
