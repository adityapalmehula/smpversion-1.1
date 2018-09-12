import { SwitchConfig } from './switch-config.constants';

export class CommonConfig {
	//public static COUNTRY_URL= 'https://battuta.medunes.net/api/country/all/?key=103f1644b7d145f526b29c271a6d3061';
  // public static colors = ['#2196F3', '#F44336', '#424242', '#E65100', '#E91E63', '#388E3C', '#009688', '#3F51B5'];
  public static colors = ['#34717f' , '#ef8b80' , '#5CB761' , '#815555' , '#e5676d' , '#025f00','#009688', '#4f6f8f'];
  public static QUESTION_DIFFICULTY_LEVELS=['Basic','Intermediate','Expert'];

  // Roles variables being used
  public static USER_ADMIN = 'Admin';
  public static USER_INSTRUCTOR = 'Instructor';
  public static USER_SCHOOL = 'School';
  public static USER_TEACHER = 'Teacher';
  public static USER_STUDENT = 'Student';

  // RBAC permissions
  public static  ADMIN = ['Admin'];
  public static  ADMIN_INSTRUCTOR = ['Admin', 'Instructor'];
  public static  ADMIN_INSTRUCTOR_SCHOOL = ['Admin', 'Instructor', 'School'];
  public static  ADMIN_INSTRUCTOR_SCHOOL_TEACHER = ['Admin', 'Instructor', 'School', 'Teacher'];
  public static  ADMIN_INSTRUCTOR_SCHOOL_TEACHER_STUDENT = ['Admin', 'Instructor', 'School', 'Teacher', 'Student'];
  public static  SCHOOL_TEACHER = ['School', 'Teacher'];

   // SET CONTENTS NAMES
   public static CONTENTS = ['videos','notes','keypoints', 'references', 'media','assessments'];

   // COURSE TYPE
   public static COURSE_TYPE = ['Academic','Curricular','Hobby','Technical'];

   // ACTIVATION METHOD
   public static ACTIVATION_METHOD = ['Promotion','Paid','Auto'];

   // CURRENCY
   public static CURRENCY = ['INR','USD'];

// SET LEARNIG PROCESS STATUS
public static LEARNING_PROCESS_STATUS = ['Pending','In Progress','Completed'];
public static COURSE_ACTIVATION_TYPE = ['Promotion','Paid'];
public static CONTENT_STATUS = ['Active','Inactive','Deleted','Drafted','Submitted','Rejected'];
public static QUESTION_TYPE = ['Single Choice','Multiple Choice','True/False'];
public static STANDARDS=[6,7,8,9,10,11,12];

// set button type

public static BUTTON_TYPE=['Add','Update'];
  // Pages
  public static PAGES = {
  	CATEGORIES : 'CATEGORIES',
    SUBCATEGORIES : 'SUBCATEGORIES',
    COURSES : 'COURSES',
    TOPICS : 'TOPICS',
    SUBTOPICS : 'SUBTOPICS',
    PLAYLISTS : 'PLAYLISTS',
    NOTES : 'NOTES',
    KEYPOINTS : 'KEYPOINTS',
    VIDEOS : 'VIDEOS',
    REFERENCES : 'REFERENCES',
    MEDIAFILES : 'MEDIAFILES',
    QUESTIONS : 'QUESTIONS',
    ASSIGNMENTS : 'ASSIGNMENTS',
    ASSESSMENTS : 'ASSESSMENTS',
    STUDENTS : 'STUDENTS',
    SCHOOLS : 'SCHOOLS',
    TEACHERS : 'TEACHERS',
    PROJECTS : 'PROJECTS',
    EPICS : 'EPICS',
  }

  // Pages permissions
  public static PAGES_PERMISSIONS = {
  	CATEGORIES : CommonConfig.ADMIN_INSTRUCTOR,
    SUBCATEGORIES : CommonConfig.ADMIN_INSTRUCTOR,
    COURSES : CommonConfig.ADMIN_INSTRUCTOR,
    TOPICS : CommonConfig.ADMIN_INSTRUCTOR,
    SUBTOPICS : CommonConfig.ADMIN_INSTRUCTOR,
    PLAYLISTS : CommonConfig.ADMIN_INSTRUCTOR_SCHOOL_TEACHER,
    NOTES : CommonConfig.ADMIN_INSTRUCTOR_SCHOOL_TEACHER,
    KEYPOINTS : CommonConfig.ADMIN_INSTRUCTOR_SCHOOL_TEACHER,
    VIDEOS :CommonConfig.ADMIN_INSTRUCTOR_SCHOOL_TEACHER,
    REFERENCES : CommonConfig.ADMIN_INSTRUCTOR_SCHOOL_TEACHER,
    MEDIAFILES : CommonConfig.ADMIN_INSTRUCTOR_SCHOOL_TEACHER,
    QUESTIONS : CommonConfig.ADMIN_INSTRUCTOR_SCHOOL_TEACHER,
    ASSIGNMENTS : CommonConfig.ADMIN_INSTRUCTOR_SCHOOL_TEACHER,
    ASSESSMENTS : CommonConfig.ADMIN_INSTRUCTOR_SCHOOL_TEACHER,
    PROJECTS : CommonConfig.ADMIN_INSTRUCTOR,
    EPICS : CommonConfig.ADMIN_INSTRUCTOR,
  }


  // SET STATUS
  public static STATUS = {
    ACTIVE : 'Active',
    INACTIVE: 'Inactive'
  } 

  // SET QUESTION STATUS
  public static QUESTION_STATUS = {
    PUBLIC : 'Public',
    PRIVATE: 'Private'
  }
  // SET VIDEO SEARCH SOURCE
  public static SOURCE = {
    YOUTUBE : 'Youtube',
    VIMEO: 'Vimeo'
  }

  // Set Video type 
  public static VIDEO_TYPE = {
    PUBLIC : 'Public',
    PRIVATE: 'Private'
  }

  // Set access token type 
  public static TOKEN_TYPE = {
    YUUID : 'YUUID', // For Youtube
    VUUID: 'VUUID' // For Vimeo
  }

  // DEFAULT IMAGE 
  public static DEFAULT_USER_IMAGE = {
    PATH:'default-avatar.jpg'
  }

  // Logo IMAGE 
  public static LOGO =['smartpathshala.png','codestrippers.png']

  // DEFAULT IMAGE 
  public static ASSESSMENT = {
    ASSESSMENT_DIFFICULTY_LEVELS: ['Basic','Intermediate','Expert','Mixed'],
    TYPES: ['Practice','Test','Exam'],
    QUESTION_TYPE: ['Single Choice','Multiple Choice','True/False'],
    QUESTION_LIST: ['Random','Ascending','Descending'],
    STATUS: ['Active','Inactive','Drafted'],
    PASS_PERCENTAGE: 50,
    MAX_ATTEMPTS: ['Infinite','1','2','3','4','5','6','7','8'],
    MARKS_FOR_BASIC_LEVEL: 2,
    MARKS_FOR_ITM_LEVEL: 4,
    MARKS_FOR_ADV_LEVEL: 6,
    TOTAL_QUESTION: 15,
    TOTAL_BASIC_QUESTION: 5,
    TOTAL_ITM_QUESTION: 5,
    TOTAL_ADV_QUESTION: 5,
    QUESTION_PER_PAGE: 10,
    QUESTION_DIFFICULTY_LEVELS: ['Basic','Intermediate','Expert'],
    QUESTION_CATEGORIES: ["Remembering","Creating", "Evaluating", "Analyzing", "Applying", "Understanding"],
    MAX_TIME: '00:10',
    SHOW_FEEDBACK_AT: [
    `At end of test`,
    `Self-evaluation (immediate feedback)`,
    `Exam (no feedback)`
    ],
    SHOW_SCORE_AT: [
    `Auto-evaluation mode: show score and expected answers`,
    `Exam mode: Do not show score nor answers`,
    `Practice mode: Show score only, by category if at least one is used`,
    `Show score on every attempt, show correct answers only on last attempt (only works with an attempts limit)`
    ],
    SHUFFLE_ANSWERS: [
    `Yes`,
    `No`
    ],
    INSTRUCTIONS_AT_START: `
    <ol>
    <li><p>Select an answer for every question. Unanswered questions will be scored as incorrect.</p></li>
    <li><p>There are three possible question types:</p>If you want to try to 
    <ul>
    <li><p><strong>Multiple Choice</strong>: click the radio button to indicate your choice. Currently, only one answer can be selected for a multiple choice question.</p>
    </li><li><p><strong>True/False</strong>: click the radio button to indicate your choice.</p></li>
    <li><p><strong>Matching Answers</strong>: select a match from the pop-up list below each item.</p></li>
    <li><p>If you use a wheel button mouse, take care not to accidently change your answers. Sometimes scrolling the wheel will rotate through the answers in a selection list, when you might have meant simply to scroll farther down in the quiz window.</p></li>
    </ul></li>
    <li><p>Click on the&nbsp;<strong>Submit</strong>&nbsp;button at the bottom of the page to have your answers graded.</p></li>
    <li><p>You will be shown your results, including your score and any feedback offered by the author of the quiz. You might wish to print this page for your own records. At this stage, you might be able to check your answers: see below.</p></li>
    <li><p>If you want to try to get a better score, click the&nbsp;<strong>Try Again</strong>&nbsp;button at the bottom of the results page. You can try the quiz as many times as you like.</p></li>
    </ol>
    `,
    INSTRUCTIONS_AT_THE_END: `
    <ol>
    <li>
    <p>Depending on how the quiz is configured, you might be allowed to check your answers.</p>
    </li>
    <li><p>Click on the&nbsp;<strong>Check Answers</strong>&nbsp;button at the bottom of the results page. A new browser window will open. (If you do not see the "Check Answers" button, it means that you are not allowed to check your answers for that quiz.)</p></li>
    <li><p>Each question is preceded by the word "correct" or "incorrect", and the answer you gave is shown.</p></li>
    <li><p>The author of the quiz may have helpful comments for each question. Be sure to check for this feedback.</p></li>
    <li><p>Close this browser window when you are done checking your answers.</p>
    </li>
    </ol>
    `,
    TAKE_ASSESSMENT_QUESTION_STATUS:['Not Attempted','Attempted','Skipped']
  }

  // Flags to be passed as query params(q)for getting Courses
  public static COURSESFLAG = {
    ONE:1, // For getting courses list on student dashboard page
    TWO:2,  // For getting courses list on my courses page
    THREE:3  // For getting courses list on my courses page
  }

  // Project constants
  public static LEVELS=['Beginner', 'Intermediate', 'Proficient', 'Expert'];
  public static TENURES=['1', '2', '3', '4', '6', '8', '12', '24', '48'];
  
  // Programs constants
   public static DURATIONS=['1', '2', '3', '4', '6', '8', '12', '24', '48'];
   public static EFFORTS =['1', '2', '3', '4', '6', '8', '12', '24', '48'];


  // digital ocean image static path
  public static IMAGE_PATH='https://'+SwitchConfig.APP+'.sgp1.digitaloceanspaces.com/localhost/';

  // File upload on media content 
  public static MEDIA_UPLOAD_ERRORS = {
    TYPE_ERROR: "Only .pdf, .jpg, .jpeg and .png file supported."
  }


  // File upload errors
  public static FILE_UPLOAD_ERRORS = {
    SIZE_ERROR: "Attachment size should be less than ",
    TYPE_ERROR: "Only .pdf, .jpg, .jpeg, .png, .docx and .doc file supported."
  }

  // Help categorie
  public static HELPS = {
    CATEGORIES: ['Report a bug','Share your feedback','Suggest a feature'],
    DATES: ['Newer','Older'],
    STATUS:['New', 'Replied']
  }
// Class of studets 
public static ACADEMIC = {
  CLASSES: ['Class-6', 'Class-7','Class-8','Class-9','Class-10','Class-11','Class-12'],
  DEGREE: ['Bachelor of Technology (B.Tech)', 'Bachelor of Computer Applications (BCA)','Bachelor of Computer Application','BSc In Information Technology','Other'],
  STARTSDATE: ['1995', '1996','1997','1998','1999','2000','2001'],
  ENDSDATE: ['2002', '2003','2004','2005','2006','2007','2008']
}

public static PLATFORMS = {
  NAMES: ['Facebook', 'Twitter','Instagram','GitHub','LinkedIn']

}
public  BASE_URL;
public STATIC_IMAGE_URL;
public IMAGE_URL='public/images/';
public static ROOT_FOLDER = '/'+SwitchConfig.APP+'/';
public static LOCAL_BASE_URL= 'https://smartpathshala.sgp1.digitaloceanspaces.com';
public static PROD_BASE_URL= 'https://klsuploads.sgp1.digitaloceanspaces.com';
public static FOLDERS= ['courses/','media/','profiles/','textbooksolutions/', 'helps/', 'projects/', 'questions/'];
  // Application platform to track request coming from
  public static APP_PLATFORM = {
    MOB: "Mobile",
    WEB: "Web"
  };
  constructor() {
    if (SwitchConfig.APP=== SwitchConfig.APPS[0]) {
      this.BASE_URL = CommonConfig.PROD_BASE_URL+CommonConfig.ROOT_FOLDER;
    } else if (SwitchConfig.APP === SwitchConfig.APPS[1]) {
      this.BASE_URL = CommonConfig.PROD_BASE_URL+CommonConfig.ROOT_FOLDER;
    }else if (SwitchConfig.APP === SwitchConfig.APPS[2]) {
      this.BASE_URL = CommonConfig.LOCAL_BASE_URL+CommonConfig.ROOT_FOLDER;
    }
    this.STATIC_IMAGE_URL= this.BASE_URL+this.IMAGE_URL;
  } 

  public static STATES=["Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttarakhand", "Uttar Pradesh", "West Bengal"]
  public static COUNTRIES=["India"]

}