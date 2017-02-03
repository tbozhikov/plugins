interface ICategories {
  HTTP: string;
  PLUGINS: string;
  USERS: string;
}

interface IActions {
  HTTP_ERROR: string;
  LOGGED_IN: string;
  LOGGED_IN_FROM_PAGE: string;
  LOGGED_OUT: string;
  LOGGED_IN_USING_PROVIDER: string;
  LOGGED_IN_USING_PROVIDER_FROM_PAGE: string;
  PLUGIN_FETCH_ALL: string;
  PLUGIN_LIST_LOADED: string;
  PLUGIN_VIEWED_DETAIL: string;
}

export class Tracking {
  public static Categories: ICategories = {
    HTTP: 'Http',
    PLUGINS: 'Plugins',
    USERS: 'Users'
  };

  public static Actions: IActions = {
    HTTP_ERROR: 'Http error',
    LOGGED_IN: 'Logged in',
    LOGGED_IN_FROM_PAGE: 'Logged in from page',
    LOGGED_OUT: 'Logged out',
    LOGGED_IN_USING_PROVIDER: 'Logged in with provider',
    LOGGED_IN_USING_PROVIDER_FROM_PAGE: 'Logged in with provider from page',
    PLUGIN_FETCH_ALL: 'Plugins fetch all',
    PLUGIN_LIST_LOADED: 'Plugins list loaded',
    PLUGIN_VIEWED_DETAIL: 'Viewed plugin detail'
  };
}
