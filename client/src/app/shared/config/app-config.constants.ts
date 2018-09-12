export class AppConfig {

  /* App constants  config starts here*/

  //public static  API_HOST = '';
  //public static  API_HOST = 'http://192.168.1.18:8080';
  
  public static  API_HOST = 'http://localhost:8080';

  /*constants need to change ends here*/

  // public static  YOUTUBE_API_URL = AppConfig.API_HOST;

  //Youtube public video configuration
  public static YOUTUBE_API_PUBLIC_KEY='AIzaSyDRnxlLAnN-ndhCbwS9S922rZUPx_il4IM';
  public static YOUTUBE_PUBLIC_SEARCH_API_URL='https://www.googleapis.com/youtube/v3/search?key='+AppConfig.YOUTUBE_API_PUBLIC_KEY+'&part=snippet&maxResults=50&type=video&q=' ;
  public static YOUTUBE_PUBLIC_VIDEO_API_URL='https://www.googleapis.com/youtube/v3/videos?key='+AppConfig.YOUTUBE_API_PUBLIC_KEY+'&part=snippet,contentDetails,statistics,status';
  public static YOUTUBE_SUBSCRIPTION_API_URL='https://www.googleapis.com/youtube/v3/subscriptions?part=snippet';
  public static YOUTUBE_OAUTH_START_URL=AppConfig.API_HOST+'/api/auth/youtube';
  
  //Youtube private video configuration
  public static YOUTUBE_API_PRIVATE_KEY='1R12juZnCWThdcuJ5udHwljk';
  public static YOUTUBE_PRIVATE_SEARCH_API_URL='https://www.googleapis.com/youtube/v3/search?key='+AppConfig.YOUTUBE_API_PRIVATE_KEY+'&part=snippet&maxResults=50&type=video&forMine=true&q=' ;
  public static YOUTUBE_PRIVATE_VIDEO_API_URL='https://www.googleapis.com/youtube/v3/videos?key='+AppConfig.YOUTUBE_API_PRIVATE_KEY+'&part=snippet,contentDetails,statistics,status';
  public static YOUTUBE_OAUTH2ENDPOINT='https://accounts.google.com/o/oauth2/v2/auth';
  public static YOUTUBE_CLIENT_ID='663257308688-0aodf24vrfbbh3nvu7r9otiuioqbg50c.apps.googleusercontent.com';
  public static YOUTUBE_REDIRECT_URI=AppConfig.API_HOST;
  public static YOUTUBE_SCOPE='https://www.googleapis.com/auth/youtube.force-ssl';
  
  // Vimeo constants
  public static VIMEO_CLIENT_ID='3eb9d8aebc1f89c29b4f62244e541915b108ac42';
  public static VIMEO_CLIENT_SECRET='i6n4tCC65u9oZzh7zYkLeDGCo+X31Py1SOHmwQTTVJLMwjhEHp/9I5f2MVOnaehRwO2WgNFHGk+k0UeBLicLKWeAPA+j5n7i1Db5+2g/ReoUtgLF3vOxoRwMec7ttjKI';
  public static VIMEO_UNAUTHTOKEN_AUTHORIZATION_HEADER= btoa(AppConfig.VIMEO_CLIENT_ID + ":" + AppConfig.VIMEO_CLIENT_SECRET);
  public static VIMEO_UNAUTHTOKEN_API_URL='https://api.vimeo.com/oauth/authorize/client';
  
  // Vimeo api url for public video search
  public static VIMEO_PUBLIC_API_URL='https://api.vimeo.com/videos?query=';
  public static VIMEO_OAUTH_START_URL=AppConfig.API_HOST+'/api/auth/vimeo';
  // Vimeo api url for private video search
  public static VIMEO_PRIVATE_API_URL='https://api.vimeo.com/me/videos?weak_search=true&query=';

  // Smartpathshala Facebook constants
  public static FACEBOOK_APP_ID = '734916346713919';
  public static FACEBOOK_APP_VERSION = 'v2.11';
  public static FACEBOOK_HREF = 'http://smartpathshala.com';
  public static FACEBOOK_METHOD = 'share';

  // Codestrippers Facebook constants
  // public static FACEBOOK_APP_ID = '905731119599063';
  // public static FACEBOOK_APP_VERSION = 'v3.0';
  // public static FACEBOOK_HREF = 'http://myevangelist.com/';
  // public static FACEBOOK_METHOD = 'share';

  public static STUDENT_TYPE =['B2C','B2B'];

  public static PROFILE_IMAGE_SIZE =[128000,128]; //[bytes,kb]
  public static COURSE_IMAGE_SIZE =[256000,256]; //[bytes,kb]
  public static QUESTION_IMAGE_SIZE =[256000,256]; //[bytes,kb]

}
