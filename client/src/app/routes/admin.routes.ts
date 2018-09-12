import { NgxPermissionsGuard } from 'ngx-permissions';
import { AdminComponent } from '../admin/admin.component';
import { CategoriesComponent } from '../shared/components/categories/categories.component';
import { CategoryComponent } from '../shared/components/categories/category/category.component';
import { SubcategoryComponent } from '../shared/components/categories/category-details/subcategory/subcategory.component';
import { ManageStudentComponent } from '../shared/components/students/manage-student/manage-student.component';
import { CategoryDetailsComponent } from '../shared/components/categories/category-details/category-details.component'
import { CoursesComponent } from '../shared/components/courses/courses.component';
import { AddCourseComponent } from '../shared/components/courses/add-course/add-course.component';
import { AuthorizationService } from '../shared/services/common/authorization.service';
import { CourseDetailComponent } from '../shared/components/courses/course-detail/course-detail.component';
import { StudentsComponent } from '../shared/components/students/students.component';
import { ManageSchoolComponent } from '../shared/components/schools/manage-school/manage-school.component';
import { SchoolsComponent } from '../shared/components/schools/schools.component';
import { TopicDetailComponent } from '../shared/components/courses/course-detail/topic-detail/topic-detail.component';
import { TopicComponent } from '../shared/components/courses/course-detail/topic/topic.component';
import { SubtopicComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic/subtopic.component';
import { AssignCategoriesSchoolComponent } from '../schools/assign-categories-school/assign-categories-school.component';
import { AssignCoursesStudentsComponent } from '../students/assign-courses-students/assign-courses-students.component';
import { SearchVideoComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/videos/search-video/search-video.component';
import { NotesComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/notes/notes.component';
import { KeypointsComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/keypoints/keypoints.component';
import { PlayVideoListComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/videos/play-video-list/play-video-list.component';
import { ManageQuestionsComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/questions/manage-questions/manage-questions.component';
import { ManageAssessmentsComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/manage-assessments/manage-assessments.component';
import { AssessmentDetailComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/assessment-detail/assessment-detail.component';
import { PlayAssessmentComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/play-assessment/play-assessment.component';
import { ProfilesComponent } from '../shared/components/profiles/profiles.component';
import { SubtopicDetailComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/subtopic-detail.component';
import { AssessmentResultComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/assessment-result/assessment-result.component';
import { AssessmentResultDetailComponent } from '../shared/components/courses/course-detail/topic-detail/subtopic-detail/assessments/assessment-result-detail/assessment-result-detail.component';
import { SkillsComponent } from '../shared/components/skills/skills.component';
import { InstructorComponent } from '../shared/components/instructor/instructor.component';
import { AddInstructorComponent } from '../shared/components/instructor/add-instructor/add-instructor.component';
import { ProjectsComponent } from '../shared/components/projects/projects.component';
import { AuthorProjectComponent } from '../shared/components/projects/author-project/author-project.component';
import { AuthorProjectDetailsComponent } from '../shared/components/projects/author-project/author-project-details/author-project-details.component';
import { EpicsComponent } from '../shared/components/projects/author-project/author-project-details/epics/epics.component';
import { StoriesComponent } from '../shared/components/projects/author-project/author-project-details/stories/stories.component';
import { ListProjectComponent } from '../shared/components/projects/list-project/list-project.component';
import { ProjectPreviewComponent } from '../shared/components/projects/project-preview/project-preview.component';
import { MyProjectDetailComponent } from '../shared/components/projects/my-project-detail/my-project-detail.component';
import { AddStoryComponent } from '../shared/components/projects/author-project/author-project-details/stories/add-story/add-story.component';
import { StoryDetailsComponent } from '../shared/components/projects/author-project/author-project-details/stories/story-details/story-details.component';
import { TasksComponent } from '../shared/components/projects/author-project/author-project-details/stories/story-details/tasks/tasks.component';
import { AddTaskComponent } from '../shared/components/projects/author-project/author-project-details/stories/story-details/tasks/add-task/add-task.component';
import { StuCourseDetailComponent } from '../students/stu-course-detail/stu-course-detail.component';
import { RearrangeComponent } from '../shared/components/rearrange/rearrange.component';
import { HelpsComponent } from '../shared/components/helps/helps.component';
import { HelpComponent } from '../shared/components/helps/help/help.component';
import { HelpDetailsComponent } from '../shared/components/helps/help-details/help-details.component';
import { WebsiteComponent } from '../website/website.component';
import { ContactComponent } from '../website/contact/contact.component';
import { PlayCourseContentComponent } from '../shared/components/courses/play-course-content/play-course-content.component';
import { ProgramsComponent } from '../shared/components/programs/programs.component';
import { AuthorProgramComponent } from '../shared/components/programs/author-program/author-program.component';
import { ProgramPreviewComponent } from '../shared/components/programs/program-preview/program-preview.component';
import { TeachersComponent } from '../shared/components/teachers/teachers.component';
import { ManageTeacherComponent } from '../shared/components/teachers/manage-teacher/manage-teacher.component';
import { ClassesComponent } from '../shared/components/classes/classes.component';

export class AdminRoutes {

	public static routes = {
		path: 'admin',
		canActivate: [AuthorizationService],
		canActivateChild: [NgxPermissionsGuard],
		data: {
			permissions: {
				only: ['Admin'],
				redirectTo: '/'
			}
		},
		children: [
		{
			path: '',
			component:  AdminComponent
		},
		{
			path : 'profiles',
			component: ProfilesComponent
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
			path: 'website',
			component:WebsiteComponent
		},
		{
			path: 'contact',
			component:ContactComponent
		},
		{
			path : 'schools',
			children: [
			{
				path: '',
				component: SchoolsComponent,
			},
			{
				path: 'add',
				component: ManageSchoolComponent
			},
			{
				path: 'edit/:id',
				component: ManageSchoolComponent
			}
			]
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
      path: 'dashboard',
      component:  AdminComponent
    },
    {
      path: 'categories',
      children: [
      {
        path: '',
        component: CategoriesComponent,
      },
      {
        path: 'add',
        component: CategoryComponent,
      },
      {
        path: 'edit/:id',
        component: CategoryComponent,
      },
      {
        path: ':id',
        children: [
        {
          path: '',
          component: CategoryDetailsComponent,
        },
        {
          path: 'subcategories',
          children: [
          {
            path: 'add',
            component: SubcategoryComponent,
          },
          {
            path: 'edit/:subcatId',
            component: SubcategoryComponent,
          }
          ]
        }
        ]
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
        {
          path: 'rearrange',
          component: RearrangeComponent,
        },
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
            {
              path: 'rearrange',
              component: RearrangeComponent,
            },
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
              }
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
            path : 'details/:assessmentId',
            component : AssessmentDetailComponent
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
      }
      ]
    },
    {
      path: 'assign/categories',
      component: AssignCategoriesSchoolComponent
    },
    {
      path: 'assign/courses',
      component: AssignCoursesStudentsComponent
    },
    {
      path: 'skills',
      component: SkillsComponent
    },
    {
      path: 'instructors',
      children: [
      {
        path:'',
        component:InstructorComponent
      },
      {
        path:'add',
        component:AddInstructorComponent
      },
      {
        path:'edit/:id',
        component:AddInstructorComponent
      }
      ]
    },
    {
      path: 'projects',
      children: [{
        path: '',
        component: ProjectsComponent
      },
      {
        path: 'add',
        component:  AuthorProjectComponent
      },
      {
        path: 'edit/:id',
        component:  AuthorProjectComponent
      },
      {
        path: 'details/:id',
        component:  MyProjectDetailComponent
      },
      {
        path: 'list-projects',
        component:  ListProjectComponent
      },
      {
        path: 'projects-preview/:id',
        component:  ProjectPreviewComponent
      },
      {
        path: ':projectId',
        children: [
        {
          path: '',
          component: AuthorProjectDetailsComponent,
        },
        {
          path: 'validate-project',
          component: MyProjectDetailComponent,
        },
        {
          path: 'epics',
          children: [
          {
            path: 'add',
            component: EpicsComponent,
          },
          {
            path: 'edit/:epicId',
            component: EpicsComponent,
          },
          ]
        },
        {
          path: 'stories',
          children: [
          {
            path: 'add',
            component:AddStoryComponent
          },
          {
            path: 'edit/:storyId',
            component: AddStoryComponent,
          },
          {
            path: ':storyId',
            children: [
            {
              path: '',
              component: StoryDetailsComponent,
            },
            {
              path:'tasks',
              children:[
              {
                path: 'add',
                component: AddTaskComponent,
              },
              {
                path: 'edit/:taskId',
                component: AddTaskComponent,
              },

              ]
            }
            ]
          }
          ]
        }
        ]
      }
      ]
    },{
      path:'programs',
      children :[
      {
        path : '',
        component: ProgramsComponent
      },
      {
        path : 'add',
        component: AuthorProgramComponent
      },
      {
        path: 'edit/:id',
        component:  AuthorProgramComponent
      },
      {
      	path : 'program-preview/:id',
      	component : ProgramPreviewComponent
      }
      ]
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
    ]
  };

  constructor(argument) {
  }
}