export class ValidationConfig {
  public static  EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/ ;
  public static  NAME_PATTERN = /^[a-z A-Z]+$/ ;
  public static  MOB_NO_PATTERN= /(7|8|9)\d{9}$/ ;
  public static  NUMBER_PATTERN= /^[0-9]+$/ ;
  public static  LETTERS_PATTERN = /^[a-zA-Z ]+$/ ;
  public static  GIT_PATTERN = /(?:git|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|\#[-\d\w._]+?)$/;
}
 