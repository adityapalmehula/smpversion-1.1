import { NgxPermissionsGuard } from 'ngx-permissions';
import { CoursesComponent } from '../shared/components/courses/courses.component';
import { AddCourseComponent } from '../shared/components/courses/add-course/add-course.component';
import { AuthorizationService } from '../shared/services/common/authorization.service';
import { CourseDetailComponent } from '../shared/components/courses/course-detail/course-detail.component';
import { TopicDetailComponent } from '../shared/components/courses/course-detail/topic-detail/topic-detail.component';
import { SearchVideoComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/videos/search-video/search-video.component';
import { NotesComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/notes/notes.component';
import { KeypointsComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/keypoints/keypoints.component';
import { PlayVideoListComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/videos/play-video-list/play-video-list.component';
import { ManageQuestionsComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/questions/manage-questions/manage-questions.component';
import { ManageAssessmentsComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/manage-assessments/manage-assessments.component';
import { AssessmentDetailComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/assessment-detail/assessment-detail.component';
import { PlayAssessmentComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/play-assessment/play-assessment.component';
import { SubtopicDetailComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/subtopic-detail.component';
import { SchoolsDashboardComponent } from '../schools/schools-dashboard.component';
import { TeachersComponent } from '../shared/components/teachers/teachers.component';
import { ManageTeacherComponent } from '../shared/components/teachers/manage-teacher/manage-teacher.component';
import { ProfilesComponent } from '../shared/components/profiles/profiles.component';
import { TopicComponent } from '../shared/components/courses/course-detail/topic/topic.component';
import { SubtopicComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic/subtopic.component';
import { AssessmentResultComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/assessment-result/assessment-result.component';
import { AssessmentResultDetailComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/assessment-result-detail/assessment-result-detail.component';
import { StuCourseDetailComponent } from '../students/stu-course-detail/stu-course-detail.component';
import { PlayCourseContentComponent } from '../shared/components/courses/play-course-content/play-course-content.component';
import { QuestionManagementComponent } from '../shared/components/courses/question-management/question-management.component';
import { AssessmentManagementComponent } from '../shared/components/courses/assessment-management/assessment-management.component';
import { ManageStudentComponent } from '../shared/components/students/manage-student/manage-student.component';
import { StudentsComponent } from '../shared/components/students/students.component';
import { ClassesComponent } from '../shared/components/classes/classes.component';

export class SchoolRoutes {

	public static routes = { 
		path: 'school',
		canActivate: [AuthorizationService],
		canActivateChild: [NgxPermissionsGuard],
		data: {
      permissions: {
        only: ['School'],
        redirectTo: '/'
      }
    },
    children: [
    {
      path: '',
      component:  SchoolsDashboardComponent
    },
    {
      path : 'classes',
      component: ClassesComponent
    },
    {
      path : 'profiles',
      component: ProfilesComponent
    },
    {
      path : 'manage-question',
      component: QuestionManagementComponent
    }, 
    {
      path : 'manage-assessment',
      component: AssessmentManagementComponent
    },
    {
      path : 'teachers',
      children: [
      {
        path: '',
        component: TeachersComponent,
      },
      {
        path: 'add',
        component: ManageTeacherComponent
      },
      {
        path: 'edit/:id',
        component: ManageTeacherComponent
      }
      ]
    },
    {
      path: 'students',
      children: [
      {
        path: '',
        component: StudentsComponent,
      },
      {
        path: 'add',
        component: ManageStudentComponent
      },
      {
        path: 'edit/:id',
        component: ManageStudentComponent
      }
      ]
    },
    {
      path: 'courses',
      children: [
      {
        path: '',
        component: CoursesComponent,
      },
      {
        path: 'add',
        component:  AddCourseComponent
      },
      {
        path: 'edit/:id',
        component:  AddCourseComponent
      },
      {
        path: ':courseId',
        children: [
        {
          path: '',
          component: CourseDetailComponent,
        },
      /*  {
          path: 'rearrange',
          component: RearrangeComponent,
        },*/
        {
          path: 'course-preview',
          component: StuCourseDetailComponent,
        },
        {
          path: 'validate-course',
          component: StuCourseDetailComponent,
        },
        {
          path: 'play-contents',
          component: PlayCourseContentComponent,
        },
        {
          path: 'topics',
          children: [
          {
            path: 'add',
            component: TopicComponent,
          },
          {
            path: 'edit/:topicId',
            component: TopicComponent,
          },
          {
            path: ':topicId',
            children: [
            {
              path: '',
              component: TopicDetailComponent,
            },
          /*  {
              path: 'rearrange',
              component: RearrangeComponent,
            },*/
            {
              path: 'subtopics',
              children: [
              {
                path: 'add',
                component: SubtopicComponent,
              },
              {
                path: 'edit/:subtopicId',
                component: SubtopicComponent,
              },
              {
                path: ':subtopicId',
                children: [
                {
                  path: '',
                  component: SubtopicDetailComponent,
                },
                {
                  path : 'videos',
                  children : [
                  {
                    path : 'search-video',
                    component : SearchVideoComponent
                  },
                  {
                    path : ':play-video',
                    component : PlayVideoListComponent
                  },
                  ]
                },
                {
                  path :'questions',
                  children : [
                  {
                    path : 'add',
                    component : ManageQuestionsComponent
                  },
                  {
                    path : 'edit/:qusId',
                    component : ManageQuestionsComponent
                  }
                  ]
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
            }
            ]
          }
          ]
        },
        {
          path :'assessments',
          children : [
          {
            path : 'add',
            component : ManageAssessmentsComponent
          },
          {
            path : 'edit/:assessmentId',
            component : ManageAssessmentsComponent
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
          ]
        }
        ]
      },
      ]
    },
    ],
  }; 	

  constructor(argument) {
  }
}