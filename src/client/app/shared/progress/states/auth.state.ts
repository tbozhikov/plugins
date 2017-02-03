import { IUser } from '../models/index';

export interface IAuthState {
  current?: IUser;
}

export const initialAuth: IAuthState = {
  current: null
};
