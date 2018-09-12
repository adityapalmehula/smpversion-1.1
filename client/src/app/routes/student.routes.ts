import { NgxPermissionsGuard } from 'ngx-permissions';
import { CoursesComponent } from '../shared/components/courses/courses.component';
import { AuthorizationService } from '../shared/services/common/authorization.service';
import { CourseDetailComponent } from '../shared/components/courses/course-detail/course-detail.component';
import { TopicDetailComponent } from '../shared/components/courses/course-detail/topic-detail/topic-detail.component';
import { NotesComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/notes/notes.component';
import { KeypointsComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/keypoints/keypoints.component';
import { PlayVideoListComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/videos/play-video-list/play-video-list.component';
import { PlayAssessmentComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/play-assessment/play-assessment.component';
import { ProfilesComponent } from '../shared/components/profiles/profiles.component';
import { ChangePasswordComponent } from '../shared/components/profiles/change-password/change-password.component';
import { StudentDashboardComponent } from '../students/student-dashboard.component'
import { StuCourseDetailComponent } from '../students/stu-course-detail/stu-course-detail.component';
import { PlayContentsComponent } from '../students/stu-course-detail/play-contents/play-contents.component';
import { TopicPlaylistComponent } from '../students/topic-playlist/topic-playlist.component';
import { TopicPlaylistDetailsComponent } from '../students/topic-playlist-details/topic-playlist-details.component';
import { AssessmentResultComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/assessment-result/assessment-result.component';
import { AssessmentResultDetailComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/assessment-result-detail/assessment-result-detail.component';
import { AssessmentsListComponent } from '../students/assessments-list/assessments-list.component';
import { PerformancesComponent } from '../students/performances/performances.component';
import { MessagesComponent } from '../shared/components/messages/messages.component';
import { ForumsComponent } from '../shared/components/courses/forums/forums.component';
import { NotificationsComponent } from '../shared/components/notifications/notifications.component';
import { B2cCoursesComponent } from '../shared/components/courses/b2c-courses/b2c-courses.component';
import { MyCoursesComponent } from '../shared/components/courses/my-courses/my-courses.component';
import { AllCoursesComponent } from '../shared/components/courses/all-courses/all-courses.component';
import { CoursePreviewComponent } from '../shared/components/courses/course-preview/course-preview.component';
import { ProjectPreviewComponent } from '../shared/components/projects/project-preview/project-preview.component';
import { AssessmentsComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/assessments.component';
import { LandingComponent } from '../shared/components/landing/landing.component';
import { HelpsComponent } from '../shared/components/helps/helps.component';
import { HelpComponent } from '../shared/components/helps/help/help.component';
import { HelpDetailsComponent } from '../shared/components/helps/help-details/help-details.component';
import { CartComponent } from '../shared/components/cart/cart.component';
import { AllProjectsComponent } from '../shared/components/projects/all-projects/all-projects.component';
import { ProgramsComponent } from '../shared/components/programs/programs.component';
import { ProgramOverviewComponent } from '../shared/components/programs/program-overview/program-overview.component';
import { ProgramPreviewComponent } from '../shared/components/programs/program-preview/program-preview.component';
import { AssessmentPerformanceComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/assessment-performance/assessment-performance.component';

export class StudentRoutes {

	public static routes = {
		path: 'student',
		canActivate: [AuthorizationService],
		canActivateChild: [NgxPermissionsGuard],
		data: {
			permissions: {
				only: ['Student'],
				redirectTo: '/'
			}
		},
		children: [
		{
			path: '',
			component:  StudentDashboardComponent
		},
		{
			path:'course-details/:id',
			children: [
			{
				path:'',
				component:StuCourseDetailComponent
			},
			{
				path:'play-contents',
				component:PlayContentsComponent
			},
			/*{
				path : 'play-assessment/:assessmentId',
				component : PlayAssessmentComponent
			},*/

      {
        path :'assessments',
        children : [
        {
          path: '',
          component: AssessmentsComponent
        },
        {
          path: ':type',
          component: AssessmentsComponent
        },
        {
          path: ':assessmentId',
          children: [
          {
            path: 'play-assessment',
            component : PlayAssessmentComponent
          },
          {
            path : 'result',
            component : AssessmentResultComponent
          },
          {
            path : 'result/detail/:id',
            component : AssessmentResultDetailComponent
          }
          ]
        },
        {
          path : 'play-assessment/:assessmentId',
          component : PlayAssessmentComponent
        },
        {
          path : 'result/:assessmentId',
          component : AssessmentResultComponent
        },
        {
          path : 'result/detail/:id',
          component : AssessmentResultDetailComponent
        },
        ]
      }

      ]
    },
			/*{
			  path: 'reset-password/:userName',
			  component: ResetPasswordComponent
			},*/
			{
				path : 'profiles',
				component: ProfilesComponent
			},
			{
				path : 'profiles/change-password',
				component: ChangePasswordComponent
			},
			{
				path: 'topic-playlist/:id',
				component: TopicPlaylistComponent
			},
			{
				path: 'topic-playlist-details/:id',
				component: TopicPlaylistDetailsComponent
			},
			{
				path: 'mycourses',
				children: [
				{
					path: '',
					component: MyCoursesComponent,
				},
				{
					path: ':id',
					component:  CourseDetailComponent
				},
				{
					path: 'course-preview/:id',
					component:  CoursePreviewComponent
				},
				{
					path: 'topics',
					children : [
					{
						path :':id',
						component:  TopicDetailComponent
					},
					{
						path :'playlists',
						children : [
			      // {
			      //   path :':id',
			      //   component:  PlaylistDetailsComponent
			      // },
			      {
			      	path : 'videos',
			      	children : [
			      	{
			      		path : 'play-video',
			      		component : PlayVideoListComponent
			      	}
			      	]
			      },
			      {
			      	path :'notes',
			      	component:  NotesComponent
			      },
			      {
			      	path :'key-points',
			      	component:  KeypointsComponent
			      },
			      ]
			    },
			    ]
			  },
			  ]
			},
			{
				path :'allcourses',
				children : [
				{
					path: '',
					component:  AllCoursesComponent
				},
				{
					path: 'course-preview/:id',
					component:  CoursePreviewComponent
				},
				]
			},
		/*	{
				path :'assessments',
				component : AssessmentsListComponent
			},*/
			{
				path :'performances',
				children: [
        {
          path: '',
          component : PerformancesComponent
        },
        {
          path: 'assessments',
          component: AssessmentPerformanceComponent
        }
        ]
			},
			{
				path :'forums',
				component : ForumsComponent
			},
			{
				path :'messages',
				component : MessagesComponent
			},
			{
				path :'notifications',
				component : NotificationsComponent
			},
			{
				path :'landing',
				component : LandingComponent
			},
			{
				path:'helps',
				children :[
					{
						path : '',
						component: HelpsComponent
					},
					{
						path : 'add',
						component: HelpComponent
					},
					{
						path : ':helpId',
						component: HelpDetailsComponent
					},
				]
			},
      {
        path:'projects',
        children :[
          {
            path : ':all-projects',
            component: AllProjectsComponent
          },
          {
        path: 'projects-preview/:id',
        component:  ProjectPreviewComponent
      },
        ]
      },
      {
        path:'programs',
        children :[
          {
            path : '',
            component: ProgramOverviewComponent
          },
          {
      	path : 'program-preview/:id',
      	component : ProgramPreviewComponent
        },
        {
      	path : 'cart',
      	component : CartComponent
        },
         
        ]
      },
			{
				path:'cart',
				component: CartComponent
			}
			]
		};

    constructor(argument) {
    }
  }
