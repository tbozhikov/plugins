import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

export interface IModalState {
  open: boolean;
  cmpType?: any;
  title?: string;
}

// options
export interface IModalOptions {
  cmpType: any;
  props?: any;
  modalOptions?: NgbModalOptions;
  modalForceAction?: boolean;
}

export const initialModal: IModalState = {
  open: false
};


