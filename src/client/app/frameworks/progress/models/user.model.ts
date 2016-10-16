export interface IUserIdentity {
  connection?: string;
  isSocial?: boolean;
  provider?: string;
  user_id?: string;
}

export interface IUser {
  authIdToken?: string;
  clientID?: string;
  created_at?: string;
  email?: string;
  email_verified?: boolean;
  family_name?: string;
  gender?: string;
  given_name?: string;
  global_client_id?: string;
  identities?: Array<IUserIdentity>;
  locale?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  updated_at?: string;
  user_id?: string;
}

export class UserModel implements IUser {
  public authIdToken: string;
  public clientID: string;
  public created_at: string;
  public email: string;
  public email_verified: boolean;
  public family_name: string;
  public gender: string;
  public given_name: string;
  public global_client_id: string;
  public identities: Array<IUserIdentity>;
  public locale: string;
  public name: string;
  public nickname: string;
  public picture: string;
  public updated_at: string;
  public user_id: string;

  constructor(model?: any) {
    if (model) {
      for (let key in model) {
        this[key] = model[key];
      }
    }
  }
}
