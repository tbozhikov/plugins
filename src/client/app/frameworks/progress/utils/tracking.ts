interface ICategories {
  USERS: string;
}

interface IActions {
  LOGGED_IN: string;
  LOGGED_IN_FROM_PAGE: string;
  LOGGED_OUT: string;
  LOGGED_IN_USING_PROVIDER: string;
  LOGGED_IN_USING_PROVIDER_FROM_PAGE: string;
}

export class Tracking {
  public static Categories: ICategories = {
    USERS: 'Users'
  };

  public static Actions: IActions = {
    LOGGED_IN: 'Logged in',
    LOGGED_IN_FROM_PAGE: 'Logged in from page',
    LOGGED_OUT: 'Logged out',
    LOGGED_IN_USING_PROVIDER: 'Logged in with provider',
    LOGGED_IN_USING_PROVIDER_FROM_PAGE: 'Logged in with provider from page'
  };
}
