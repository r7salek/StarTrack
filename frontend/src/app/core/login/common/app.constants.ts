/** Defining URLS for OAUth autorizations */
export class AppConstants {
  private static API_BASE_URL = 'http://localhost:8080/'; // Serve URL (Backend)
  //private static API_BASE_URL = 'https://brc.camide.cam.ac.uk:443/backend/'; // Serve URL (Backend) srvphstra DEV
  //private static API_BASE_URL ='https://srvphstrata.srv.med.uni-muenchen.de:443/backend/'; // production URL (Backend) test
  private static OAUTH2_URL =
    AppConstants.API_BASE_URL + 'oauth2/authorization/';
  private static REDIRECT_URL = '?redirect_uri=http://localhost:8080/login'; //Url alllows to use Oauth autorization and APIs call()
  //private static REDIRECT_URL ='?redirect_uri=https://brc.camide.cam.ac.uk:443/backend/login'; //Url brc.camide.cam.ac.uk
  //  private static REDIRECT_URL = '?redirect_uri=https://srvphstrata.srv.med.uni-muenchen.de:443/backend/login'; //production test
  public static API_URL = AppConstants.API_BASE_URL + 'api/';
  public static AUTH_API = AppConstants.API_URL + 'auth/';
  public static GOOGLE_AUTH_URL =
    AppConstants.OAUTH2_URL + 'google' + AppConstants.REDIRECT_URL;
  public static FACEBOOK_AUTH_URL =
    AppConstants.OAUTH2_URL + 'facebook' + AppConstants.REDIRECT_URL;
  public static GITHUB_AUTH_URL =
    AppConstants.OAUTH2_URL + 'github' + AppConstants.REDIRECT_URL;
  public static LINKEDIN_AUTH_URL =
    AppConstants.OAUTH2_URL + 'linkedin' + AppConstants.REDIRECT_URL;
}
