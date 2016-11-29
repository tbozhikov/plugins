export interface IModalState {
  open: boolean;
  cmpType?: any;
  title?: string;
}

export const initialModal: IModalState = {
  open: false
};
