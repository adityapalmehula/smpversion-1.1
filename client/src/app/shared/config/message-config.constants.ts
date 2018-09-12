export class MessageConfig {

  public static INTERNAL_ERROR_OCCURED ='Internal error occurred';
  public static  SOMETHING_WENT_WRONG ='Oops! Something went wrong';
  public static  TOKEN_ERROR ="Either token is missing or invalid token provided";
  public static  PROBLEM_IN_SERVER_CONNECTION ="Problem in connecting to server";
  
  public static LOGIN_CONFIG = {
    ACCOUNT_VERIFICATION_SUCCESS : "You have successfully verified your account",
    INVALID_VERIFICATION_LINK: 'Your verification link is invalid or has expired',
  }

  public static STUDENT_CONFIG = {
    COURSE_RATING_SUBMIT_SUCCESSFULLY: 'You rating submit successfully',
    STATUS_UPDATED_SUCCESSFULLY: 'Status updated successfully',
  }

  public static TOKEN_CONFIG = {
    TOKEN_EXPIRE : "Your access token is expired. Generate new token to get access to your private videos.",
    TOKEN_CONFIRM:"Your access token is required to search private video.",
    SESSION_TIMEOUT:"Your session timedout."
  }

  public static FILE_UPLOAD = {
    FILE_SIZE_ERROR: "File size should be less than ",
    FILE_TYPE_ERROR:"File type should be jpg, jpeg & png",
    SELECT_FILE:"Please select file"
  }

}