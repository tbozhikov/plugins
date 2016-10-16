interface ITextErrors {
  LOGIN_FAILED: string;
  NETWORK_LONG_DELAY: string;
}

export class Text {
  public static ERRORS: ITextErrors = {
    LOGIN_FAILED: `You must enter a valid username and password.`,
    NETWORK_LONG_DELAY: `This request is taking longer than usual. You can either hang on a bit longer or retry.`
  };
}
