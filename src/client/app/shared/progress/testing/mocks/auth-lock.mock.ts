export class AuthLockMock {
  constructor(clientId?: string, host?: string, options?: any) {
    console.log(clientId, host, options);
  }
  public on(name, fn) {
    console.log(name);
  }
  public getProfile(id: string, fn: Function) {
    console.log(id);
  }
}
