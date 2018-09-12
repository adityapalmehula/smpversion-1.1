import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { HttpModule } from '@angular/http';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { LoadingModule, ANIMATION_TYPES } from 'ngx-loading';
import { MomentModule } from 'angular2-moment';
import { IonRangeSliderModule } from "ng2-ion-range-slider";
import { SliderModule } from 'primeng/components/slider/slider'
import { FacebookModule } from 'ngx-facebook';
import { StarRatingModule } from 'angular-star-rating';
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Ng2DragDropModule } from 'ng2-drag-drop';
import { Daterangepicker } from 'ng2-daterangepicker';
import { RlTagInputModule} from 'angular2-tag-input';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { AppComponent } from './app.component';
import { SortablejsModule } from 'angular-sortablejs'
import { AppRoutingModule }     from './app-routing.module';
import { TruncateModule } from 'ng2-truncate';
import { LoginComponent } from './shared/components/login/login.component';
import { ForgotPasswordComponent } from './shared/components/forgot-password/forgot-password.component';
import { InstructorsComponent } from './instructors/instructors.component';
import { CategoriesComponent } from './shared/components/categories/categories.component';
import { ResetPasswordComponent } from './shared/components/reset-password/reset-password.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { InsDashboardComponent } from './instructors/ins-dashboard/ins-dashboard.component';
import { ManageStudentComponent } from './shared/components/students/manage-student/manage-student.component';
import { AuthorizationService } from './shared/services/common/authorization.service'
import { AuthenticationService } from './shared/services/common/authentication.service';
import { MenuService } from './shared/services/common/menu.service';
import { CategoryDetailsComponent } from './shared/components/categories/category-details/category-details.component';
import { CoursesComponent } from './shared/components/courses/courses.component';
import { AddCourseComponent } from './shared/components/courses/add-course/add-course.component';
import { CourseDetailComponent } from './shared/components/courses/course-detail/course-detail.component';
import { StudentsComponent } from './shared/components/students/students.component';
import { MessageService } from './shared/services/common/message.service';
import { ErrorService } from './shared/services/common/error.service';
import { ValidationService } from './shared/services/common/validation.service';
import { ManageSchoolComponent } from './shared/components/schools/manage-school/manage-school.component';
import { SchoolsComponent } from './shared/components/schools/schools.component';
import { TopicDetailComponent } from './shared/components/courses/course-detail/topic-detail/topic-detail.component';
import { AssignCategoriesSchoolComponent } from './schools/assign-categories-school/assign-categories-school.component';
import { AssignCoursesStudentsComponent } from './students/assign-courses-students/assign-courses-students.component';
import { KeypointsComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/keypoints/keypoints.component';
// import { PlaylistsComponent } from './shared/components/courses/course-detail/topic-detail/playlists/playlists.component';
// import { PlaylistDetailsComponent } from './shared/components/courses/course-detail/topic-detail/playlists/playlist-details/playlist-details.component';
import { CKEditorModule } from 'ng2-ckeditor';
import { NotesComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/notes/notes.component';
import { VideosComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/videos/videos.component';
import { SearchVideoComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/videos/search-video/search-video.component';
import { StudentDashboardComponent } from './students/student-dashboard.component'
import { TopicPlaylistComponent } from './students/topic-playlist/topic-playlist.component';
import { TopicPlaylistDetailsComponent } from './students/topic-playlist-details/topic-playlist-details.component';
import { PlayVideoComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/videos/play-video/play-video.component';
import { PlayerService } from './shared/services/subtopics/videos/player.service';
import { SubTopicService } from './shared/services/subtopics/subtopic.service'
import { MediaFilesComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/media-files/media-files.component';
import { PlayVideoListComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/videos/play-video-list/play-video-list.component';
import { ReferencesComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/references/references.component';
import { QuestionsComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/questions/questions.component';
import { ManageQuestionsComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/questions/manage-questions/manage-questions.component';
import { AssessmentsComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/assessments.component';
import { ManageAssessmentsComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/manage-assessments/manage-assessments.component';
import { FormatNumberPipe } from './shared/pipes/format-number.pipe';
import { TitleCasePipe } from './shared/pipes/title-case.pipe';
import { SearchItemPipe } from './shared/pipes/searching.pipe';
import { SafePipe } from './shared/pipes/safe.pipe';

import { AssessmentDetailComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/assessment-detail/assessment-detail.component';
import { PlayAssessmentComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/play-assessment/play-assessment.component';
import { AssessmentResultComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/assessment-result/assessment-result.component';
import { AssessmentResultDetailComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/assessment-result-detail/assessment-result-detail.component';
import { SchoolsDashboardComponent } from './schools/schools-dashboard.component';
import { PagenotfoundComponent } from './shared/components/pagenotfound/pagenotfound.component';
import { ErrorComponent } from './shared/components/error/error.component';
import { ProfilesComponent } from './shared/components/profiles/profiles.component';
import { B2bCoursesComponent } from './shared/components/courses/b2b-courses/b2b-courses.component';
import { B2cCoursesComponent } from './shared/components/courses/b2c-courses/b2c-courses.component';
import { AuthorCoursesComponent } from './shared/components/courses/author-courses/author-courses.component';
import { PersonalComponent } from './shared/components/profiles/personal/personal.component';
import { ChangePasswordComponent } from './shared/components/profiles/change-password/change-password.component';
import { VimeoPlayerComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/videos/vimeo-player/vimeo-player.component';
import { RedirectComponent } from './shared/components/redirect/redirect.component';
import { SubtopicDetailComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/subtopic-detail.component';
import { StuCourseDetailComponent } from './students/stu-course-detail/stu-course-detail.component';
import { ContentsComponent } from './students/stu-course-detail/contents/contents.component';
import { SingleChoiceQuestionComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/questions/manage-questions/single-choice-question/single-choice-question.component';
import { MultipleChoiceQuestionComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/questions/manage-questions/multiple-choice-question/multiple-choice-question.component';
import { B2cCoursesDetailComponent } from './shared/components/courses/b2c-courses/b2c-courses-detail/b2c-courses-detail.component';
import { TrueFalseQuestionComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/questions/manage-questions/true-false-question/true-false-question.component';
import { FillInTheBlanksQuestionComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/questions/manage-questions/fill-in-the-blanks-question/fill-in-the-blanks-question.component';
import { LearningPlanComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/learning-plan/learning-plan.component';
import { PlayContentsComponent } from './students/stu-course-detail/play-contents/play-contents.component';
import { PlayCourseContentComponent } from './shared/components/courses/play-course-content/play-course-content.component';
import { PlayContentVideoComponent } from './students/stu-course-detail/play-contents/play-content-video/play-content-video.component';
import { AssessmentsListComponent } from './students/assessments-list/assessments-list.component';
import { AssessmentAttemptsDetailComponent } from './students/assessments-list/assessment-attempts-detail/assessment-attempts-detail.component';
import { AssessmentAttemptResultComponent } from './students/assessments-list/assessment-attempts-detail/assessment-attempt-result/assessment-attempt-result.component';
import { PerformancesComponent } from './students/performances/performances.component';
import { MessagesComponent } from './shared/components/messages/messages.component';
import { ForumsComponent } from './shared/components/courses/forums/forums.component';
import { NotificationsComponent } from './shared/components/notifications/notifications.component';
import { UnderconstructionComponent } from './shared/components/underconstruction/underconstruction.component';
import { MyCoursesComponent } from './shared/components/courses/my-courses/my-courses.component';
import { AllCoursesComponent } from './shared/components/courses/all-courses/all-courses.component';
import { CoursePreviewComponent } from './shared/components/courses/course-preview/course-preview.component';
import { CategoryComponent } from './shared/components/categories/category/category.component';
import { SubcategoryComponent } from './shared/components/categories/category-details/subcategory/subcategory.component';
import { TopicComponent } from './shared/components/courses/course-detail/topic/topic.component';
import { SubtopicComponent } from './shared/components/courses/course-detail/topic-detail/subtopic/subtopic.component';
import { AdminComponent } from './admin/admin.component';
import { SkillsComponent } from './shared/components/skills/skills.component';
import { InstructorComponent } from './shared/components/instructor/instructor.component';
import { AddInstructorComponent } from './shared/components/instructor/add-instructor/add-instructor.component';
import { ProjectsComponent } from './shared/components/projects/projects.component';
import { AuthorProjectComponent } from './shared/components/projects/author-project/author-project.component';
import { AuthorProjectDetailsComponent } from './shared/components/projects/author-project/author-project-details/author-project-details.component';
import { EpicsComponent } from './shared/components/projects/author-project/author-project-details/epics/epics.component';
import { StoriesComponent } from './shared/components/projects/author-project/author-project-details/stories/stories.component';
import { ListProjectComponent } from './shared/components/projects/list-project/list-project.component';
import { ProjectPreviewComponent } from './shared/components/projects/project-preview/project-preview.component';
import { MyProjectDetailComponent } from './shared/components/projects/my-project-detail/my-project-detail.component';
import { StoryDetailComponent } from './shared/components/projects/my-project-detail/story-detail/story-detail.component';
import { AddStoryComponent } from './shared/components/projects/author-project/author-project-details/stories/add-story/add-story.component';
import { StoryDetailsComponent } from './shared/components/projects/author-project/author-project-details/stories/story-details/story-details.component';
import { TasksComponent } from './shared/components/projects/author-project/author-project-details/stories/story-details/tasks/tasks.component';
import { AddTaskComponent } from './shared/components/projects/author-project/author-project-details/stories/story-details/tasks/add-task/add-task.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { RearrangeComponent } from './shared/components/rearrange/rearrange.component';
import { PrivacyComponent } from './shared/components/privacy/privacy.component';
import { TermsComponent } from './shared/components/terms/terms.component';
import { HelpComponent } from './shared/components/helps/help/help.component';

import { TextBookSolutionsComponent } from './shared/components/courses/course-detail/topic-detail/text-book-solutions/text-book-solutions.component';
import { LandingComponent } from './shared/components/landing/landing.component';
import { ProfileService } from './shared/services/profiles/profiles.service';
import { HelpsComponent } from './shared/components/helps/helps.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { HelpDetailsComponent } from './shared/components/helps/help-details/help-details.component';
import { LinkExpiredComponent } from './shared/components/link-expired/link-expired.component';
import { CartComponent } from './shared/components/cart/cart.component';
import { AddressComponent } from './shared/components/profiles/address/address.component';
import { AcademicDetailsComponent } from './shared/components/profiles/academic-details/academic-details.component';
import { SocialProfileComponent } from './shared/components/profiles/social-profile/social-profile.component';
import { WebsiteComponent } from './website/website.component';
import { ContactComponent } from './website/contact/contact.component';
import { AllProjectsComponent } from './shared/components/projects/all-projects/all-projects.component';
import { ProgramsComponent } from './shared/components/programs/programs.component';
import { ProgramOverviewComponent } from './shared/components/programs/program-overview/program-overview.component';
import { AuthorProgramComponent } from './shared/components/programs/author-program/author-program.component';
import { PlayPracticeSetComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/play-practice-set/play-practice-set.component';
import { ProgramPreviewComponent } from './shared/components/programs/program-preview/program-preview.component';
import { BarChartComponent } from './shared/components/charts/bar-chart/bar-chart.component';
import { DoughnutChartComponent } from './shared/components/charts/doughnut-chart/doughnut-chart.component';
import { PieChartComponent } from './shared/components/charts/pie-chart/pie-chart.component';
import { AssessmentResultChartsComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/assessment-result-charts/assessment-result-charts.component';
import { AssessmentPerformanceComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/assessment-performance/assessment-performance.component';
import { TeachersComponent } from './shared/components/teachers/teachers.component';
import { ManageTeacherComponent } from './shared/components/teachers/manage-teacher/manage-teacher.component';
import { QuestionFormComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/questions/manage-questions/question-form/question-form.component';
import { TeacherDashboardComponent } from './teachers/teacher-dashboard.component';
import { QuestionManagementComponent } from './shared/components/courses/question-management/question-management.component';
import { AssessmentManagementComponent } from './shared/components/courses/assessment-management/assessment-management.component';
import { AssessmentDetailResultComponent } from './shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/assessment-detail-result/assessment-detail-result.component';
import { ClassesComponent } from './shared/components/classes/classes.component';

@NgModule({
  declarations: [
  AppComponent,
  LoginComponent,
  ForgotPasswordComponent,
  InstructorsComponent,
  CategoriesComponent,
  ResetPasswordComponent,
  HeaderComponent,
  FooterComponent,
  InsDashboardComponent,
  ManageStudentComponent,
  CategoryDetailsComponent,
  CoursesComponent,
  AddCourseComponent,
  CourseDetailComponent,
  StudentDashboardComponent,
  ManageSchoolComponent,
  SchoolsComponent,
  TopicDetailComponent,
  AssignCategoriesSchoolComponent,
  AssignCoursesStudentsComponent,
  KeypointsComponent,
  // PlaylistsComponent,
  // PlaylistDetailsComponent,
  NotesComponent,
  VideosComponent,
  SearchVideoComponent,
  StudentsComponent,
  TopicPlaylistComponent,
  TopicPlaylistDetailsComponent,
  PlayVideoComponent,
  MediaFilesComponent,
  PlayVideoListComponent,
  ReferencesComponent,
  QuestionsComponent,
  ManageQuestionsComponent,
  AssessmentsComponent,
  ManageAssessmentsComponent,
  FormatNumberPipe,
  TitleCasePipe,
  SearchItemPipe,
  SafePipe,
  AssessmentDetailComponent,
  PlayAssessmentComponent,
  AssessmentResultComponent,
  AssessmentResultDetailComponent,
  SchoolsDashboardComponent,
  PagenotfoundComponent,
  ErrorComponent,
  ProfilesComponent,
  B2bCoursesComponent,
  B2cCoursesComponent,
  AuthorCoursesComponent,
  PersonalComponent,
  ChangePasswordComponent,
  VimeoPlayerComponent,
  RedirectComponent,
  SubtopicDetailComponent,
  StuCourseDetailComponent,
  ContentsComponent,
  SingleChoiceQuestionComponent,
  MultipleChoiceQuestionComponent,
  B2cCoursesDetailComponent,
  TrueFalseQuestionComponent,
  FillInTheBlanksQuestionComponent,
  LearningPlanComponent,
  PlayContentsComponent,
  PlayContentVideoComponent,
  AssessmentsListComponent,
  AssessmentAttemptsDetailComponent,
  AssessmentAttemptResultComponent,
  PerformancesComponent,
  MessagesComponent,
  ForumsComponent,
  NotificationsComponent,
  UnderconstructionComponent,
  MyCoursesComponent,
  AllCoursesComponent,
  CoursePreviewComponent,
  CategoryComponent,
  SubcategoryComponent,
  TopicComponent,
  SubtopicComponent,
  AdminComponent,
  SkillsComponent,
  InstructorComponent,
  AddInstructorComponent,
  ProjectsComponent,
  AuthorProjectComponent,
  AuthorProjectDetailsComponent,
  EpicsComponent,
  StoriesComponent,
  TasksComponent,
  ListProjectComponent,
  ProjectPreviewComponent,
  MyProjectDetailComponent,
  StoryDetailComponent,
  AddStoryComponent,
  StoryDetailsComponent,
  AddTaskComponent,
  SidebarComponent,
  RearrangeComponent,
  PrivacyComponent,
  TermsComponent,
  HelpComponent,
  TextBookSolutionsComponent,
  LandingComponent,
  HelpsComponent,
  HelpDetailsComponent,
  LinkExpiredComponent,
  CartComponent,
  AddressComponent,
  AcademicDetailsComponent,
  SocialProfileComponent,
  WebsiteComponent,
  ContactComponent,
  PlayCourseContentComponent,
  AllProjectsComponent,
  ProgramsComponent,
  ProgramOverviewComponent,
  AuthorProgramComponent,
  PlayPracticeSetComponent,
  ProgramPreviewComponent,
  BarChartComponent,
  DoughnutChartComponent,
  PieChartComponent,
  AssessmentResultChartsComponent,
  AssessmentPerformanceComponent,
  TeachersComponent,
  ManageTeacherComponent,
  QuestionFormComponent,
  TeacherDashboardComponent,
  QuestionManagementComponent,
  AssessmentManagementComponent,
  AssessmentDetailResultComponent,
  ClassesComponent,
  ],
  imports: [
  FormsModule,
  ReactiveFormsModule,
  HttpModule,
  BrowserModule,
  AngularMultiSelectModule,
  CKEditorModule,
  AppRoutingModule,
  PaginationModule.forRoot(),
  Ng2DragDropModule.forRoot(),
  TruncateModule,
  ImageCropperModule,
  LoadingModule.forRoot({
    animationType: ANIMATION_TYPES.circleSwish,
    backdropBackgroundColour: 'rgba(0,0,0,0.2)',
    backdropBorderRadius: '4px',
    primaryColour: '#3b2ba5',
  }),
  MomentModule,
  IonRangeSliderModule,
  SliderModule,
  FacebookModule.forRoot(),
  StarRatingModule.forRoot(),
  BrowserAnimationsModule,
  ToastModule.forRoot(),
  Daterangepicker,
  RlTagInputModule,
  PdfViewerModule,
  SortablejsModule.forRoot({
    animation: 200,
  }),
  MyDateRangePickerModule,
  ],
  providers: [AuthorizationService, AuthenticationService, MessageService, ValidationService, PlayerService, SubTopicService,MenuService, ErrorService, ProfileService],
  bootstrap: [AppComponent]
})
export class AppModule { }
