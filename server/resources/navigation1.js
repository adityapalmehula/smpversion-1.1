const Admin = [
    {
      name: 'Admin Forum',
      subMenu: [
        {
          name: 'Forum Home',
          route: 'course-info',
          subRoute: 'forum-home'
        },
        {
          name: 'Forum Category',
          route: 'course-info',
          subRoute: 'forum-category'
        },
        {
          name: 'Forum Thread',
          route: 'course-info',
          subRoute: 'forum-thread'
        }
      ]
    },
    {
      name: 'Courses',
      mainRoute: '/students',
      subMenu: [
        {
          name: 'Courses Grid',
          route: 'course-info',
          subRoute: 'courses-grid'
        },
        {
          name: 'Courses List',
          route: 'course-info',
          subRoute: 'courses-list'
        },
        {
          name: 'Courses Details',
          route: 'course-info',
          subRoute: 'courses-details'
        }
      ]
    },
    {
      name: 'Student',
      mainRoute: '/students',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard',
          subRoute: 'dashboard'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Take Course',
          route: 'course-info',
          subRoute: 'take-course'
        },
        {
          name: 'Course Forums',
          route: 'course-info',
          subRoute: 'course-forums'
        },
        {
          name: 'Take Quiz',
          route: 'course-info',
          subRoute: 'take-quiz'
        },
        {
          name: 'Edit Profile',
          route: 'user-info',
          subRoute: 'edit-profile'
        },
        {
          name: 'Edit Billing',
          route: 'user-info',
          subRoute: 'edit-billing'
        },
        {
          name: 'Messages',
          route: 'course-info',
          subRoute: 'messages'
        },
        {
          name: 'View Quiz',
          route: 'quiz-info',
          subRoute: 'view-quiz'
        }
      ]
    },
    {
      name: 'Instructor',
      mainRoute: '/instructor',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard-info',
          subRoute: 'dashboard'
        },
        {
          name: 'Categories',
          route:'categories-info',
          subRoute: 'categories'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Add Course',
          route: 'course-info',
          subRoute: 'edit-course'
        },
        {
          name: 'Earnings',
          route: 'user-info',
          subRoute: 'earnings'
        },
        {
          name: 'Statement',
          route: 'user-info',
          subRoute: 'statement'
        },
        {
          name: 'Edit Profile',
          route: 'user-info',
          subRoute: 'edit-profile'
        },
        {
          name: 'Edit Billing',
          route: 'user-info',
          subRoute: 'edit-billing'
        },
        {
          name: 'Messages',
          route: 'user-info',
          subRoute: 'messages'
        },
        {
          name: 'Add Schools',
          route: 'school-info',
          subRoute: 'add-schools'
        },
        {
          name: 'View Schools',
          route: 'school-info',
          subRoute: 'view-schools'
        },
        {
          name: 'Add Teacher',
          route: 'teacher-info',
          subRoute: 'add-teacher'
        },
        {
          name: 'View Teacher',
          route: 'teacher-info',
          subRoute: 'view-teacher'
        },
        {
          name:'Upload file',
          route:'upload-info',
          subRoute:'uploads'
        },
        {
          name:'Blog',
          route:'blog-info',
          subRoute:'blog-data'
        }
      ]
    },

    {
      name: 'Teacher',
      mainRoute: '/teacher',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard-info',
          subRoute: 'dashboard'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Add Course',
          route: 'course-info',
          subRoute: 'edit-course'
        },
        ]
    },
     {
      name: 'School',
      mainRoute: '/school',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard-info',
          subRoute: 'dashboard'
        },
        {
          name: 'Add Teacher',
          route: 'teacher-info',
          subRoute: 'add-teacher'
        },
        {
          name: 'View Teacher',
          route: 'teacher-info',
          subRoute: 'view-teacher'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Add Course',
          route: 'course-info',
          subRoute: 'edit-course'
        },
        ]
    },
    {
      name: 'Admin',
      mainRoute: '/admin',
      subMenu: [
        {
          name: 'Add Instructor',
          route: 'instructor-info',
          subRoute: 'add-instructor'
        },
        {
          name: 'View Instructor',
          route: 'instructor-info',
          subRoute: 'view-instructor'
        },
        {
          name: 'Add Student',
          route: 'student-info',
          subRoute: 'add-student'
        },
        {
          name: 'View Student',
          route: 'student-info',
          subRoute: 'view-student'
        }
      ]
    },
  ];

const Instructor = [
    {
      name: 'Instructor Forum',
      subMenu: [
        {
          name: 'Forum Home',
          route: 'course-info',
          subRoute: 'forum-home'
        },
        {
          name: 'Forum Category',
          route: 'course-info',
          subRoute: 'forum-category'
        },
        {
          name: 'Forum Thread',
          route: 'course-info',
          subRoute: 'forum-thread'
        }
      ]
    },
    {
      name: 'Courses',
      mainRoute: '/students',
      subMenu: [
        {
          name: 'Courses Grid',
          route: 'course-info',
          subRoute: 'courses-grid'
        },
        {
          name: 'Courses List',
          route: 'course-info',
          subRoute: 'courses-list'
        },
        {
          name: 'Courses Details',
          route: 'course-info',
          subRoute: 'courses-details'
        }
      ]
    },
    {
      name: 'Student',
      mainRoute: '/students',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard',
          subRoute: 'dashboard'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Take Course',
          route: 'course-info',
          subRoute: 'take-course'
        },
        {
          name: 'Course Forums',
          route: 'course-info',
          subRoute: 'course-forums'
        },
        {
          name: 'Take Quiz',
          route: 'course-info',
          subRoute: 'take-quiz'
        },
        {
          name: 'Edit Profile',
          route: 'user-info',
          subRoute: 'edit-profile'
        },
        {
          name: 'Edit Billing',
          route: 'user-info',
          subRoute: 'edit-billing'
        },
        {
          name: 'Messages',
          route: 'course-info',
          subRoute: 'messages'
        },
        {
          name: 'View Quiz',
          route: 'quiz-info',
          subRoute: 'view-quiz'
        }
      ]
    },
    {
      name: 'Instructor',
      mainRoute: '/instructor',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard-info',
          subRoute: 'dashboard'
        },
        {
          name: 'Categories',
          route:'categories-info',
          subRoute: 'categories'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Add Course',
          route: 'course-info',
          subRoute: 'edit-course'
        },
        {
          name: 'Earnings',
          route: 'user-info',
          subRoute: 'earnings'
        },
        {
          name: 'Statement',
          route: 'user-info',
          subRoute: 'statement'
        },
        {
          name: 'Edit Profile',
          route: 'user-info',
          subRoute: 'edit-profile'
        },
        {
          name: 'Edit Billing',
          route: 'user-info',
          subRoute: 'edit-billing'
        },
        {
          name: 'Messages',
          route: 'user-info',
          subRoute: 'messages'
        },
        {
          name: 'Add Schools',
          route: 'school-info',
          subRoute: 'add-schools'
        },
        {
          name: 'View Schools',
          route: 'school-info',
          subRoute: 'view-schools'
        },
        {
          name: 'Add Teacher',
          route: 'teacher-info',
          subRoute: 'add-teacher'
        },
        {
          name: 'View Teacher',
          route: 'teacher-info',
          subRoute: 'view-teacher'
        },
        {
          name:'Upload file',
          route:'upload-info',
          subRoute:'uploads'
        },
        {
          name:'Blog',
          route:'blog-info',
          subRoute:'blog-data'
        }
      ]
    },

    {
      name: 'Teacher',
      mainRoute: '/teacher',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard-info',
          subRoute: 'dashboard'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Add Course',
          route: 'course-info',
          subRoute: 'edit-course'
        },
        ]
    },
     {
      name: 'School',
      mainRoute: '/school',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard-info',
          subRoute: 'dashboard'
        },
        {
          name: 'Add Teacher',
          route: 'teacher-info',
          subRoute: 'add-teacher'
        },
        {
          name: 'View Teacher',
          route: 'teacher-info',
          subRoute: 'view-teacher'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Add Course',
          route: 'course-info',
          subRoute: 'edit-course'
        },
        ]
    },

    {
      name: 'Admin',
      mainRoute: '/admin',
      subMenu: [
        {
          name: 'Add Instructor',
          route: 'instructor-info',
          subRoute: 'add-instructor'
        },
        {
          name: 'View Instructor',
          route: 'instructor-info',
          subRoute: 'view-instructor'
        },
        {
          name: 'Add Student',
          route: 'student-info',
          subRoute: 'add-student'
        },
        {
          name: 'View Student',
          route: 'student-info',
          subRoute: 'view-student'
        },
        {
          name: 'Assign-Courses',
          route: 'assign-courses',
          subRoute: 'courses-school'
        },
      ]
    },

  ];
const School = [
    {
      name: 'School Forum',
      subMenu: [
        {
          name: 'Forum Home',
          route: 'course-info',
          subRoute: 'forum-home'
        },
        {
          name: 'Forum Category',
          route: 'course-info',
          subRoute: 'forum-category'
        },
        {
          name: 'Forum Thread',
          route: 'course-info',
          subRoute: 'forum-thread'
        }
      ]
    },
    {
      name: 'Courses',
      mainRoute: '/students',
      subMenu: [
        {
          name: 'Courses Grid',
          route: 'course-info',
          subRoute: 'courses-grid'
        },
        {
          name: 'Courses List',
          route: 'course-info',
          subRoute: 'courses-list'
        },
        {
          name: 'Courses Details',
          route: 'course-info',
          subRoute: 'courses-details'
        }
      ]
    },
    {
      name: 'Student',
      mainRoute: '/students',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard',
          subRoute: 'dashboard'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Take Course',
          route: 'course-info',
          subRoute: 'take-course'
        },
        {
          name: 'Course Forums',
          route: 'course-info',
          subRoute: 'course-forums'
        },
        {
          name: 'Take Quiz',
          route: 'course-info',
          subRoute: 'take-quiz'
        },
        {
          name: 'Edit Profile',
          route: 'user-info',
          subRoute: 'edit-profile'
        },
        {
          name: 'Edit Billing',
          route: 'user-info',
          subRoute: 'edit-billing'
        },
        {
          name: 'Messages',
          route: 'course-info',
          subRoute: 'messages'
        },
        {
          name: 'View Quiz',
          route: 'quiz-info',
          subRoute: 'view-quiz'
        }
      ]
    },
    {
      name: 'Instructor',
      mainRoute: '/instructor',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard-info',
          subRoute: 'dashboard'
        },
        {
          name: 'Categories',
          route:'categories-info',
          subRoute: 'categories'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Add Course',
          route: 'course-info',
          subRoute: 'edit-course'
        },
        {
          name: 'Earnings',
          route: 'user-info',
          subRoute: 'earnings'
        },
        {
          name: 'Statement',
          route: 'user-info',
          subRoute: 'statement'
        },
        {
          name: 'Edit Profile',
          route: 'user-info',
          subRoute: 'edit-profile'
        },
        {
          name: 'Edit Billing',
          route: 'user-info',
          subRoute: 'edit-billing'
        },
        {
          name: 'Messages',
          route: 'user-info',
          subRoute: 'messages'
        },
        {
          name: 'Add Schools',
          route: 'school-info',
          subRoute: 'add-schools'
        },
        {
          name: 'View Schools',
          route: 'school-info',
          subRoute: 'view-schools'
        },
        {
          name: 'Add Teacher',
          route: 'teacher-info',
          subRoute: 'add-teacher'
        },
        {
          name: 'View Teacher',
          route: 'teacher-info',
          subRoute: 'view-teacher'
        },
        {
          name:'Upload file',
          route:'upload-info',
          subRoute:'uploads'
        },
        {
          name:'Blog',
          route:'blog-info',
          subRoute:'blog-data'
        }
      ]
    },

    {
      name: 'Teacher',
      mainRoute: '/teacher',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard-info',
          subRoute: 'dashboard'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Add Course',
          route: 'course-info',
          subRoute: 'edit-course'
        },
        ]
    },
     {
      name: 'School',
      mainRoute: '/school',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard-info',
          subRoute: 'dashboard'
        },
        {
          name: 'Add Teacher',
          route: 'teacher-info',
          subRoute: 'add-teacher'
        },
        {
          name: 'View Teacher',
          route: 'teacher-info',
          subRoute: 'view-teacher'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Add Course',
          route: 'course-info',
          subRoute: 'edit-course'
        },
        ]
    }
  ];

const Teacher = [
    {
      name: 'Teacher Forum',
      subMenu: [
        {
          name: 'Forum Home',
          route: 'course-info',
          subRoute: 'forum-home'
        },
        {
          name: 'Forum Category',
          route: 'course-info',
          subRoute: 'forum-category'
        },
        {
          name: 'Forum Thread',
          route: 'course-info',
          subRoute: 'forum-thread'
        }
      ]
    },
    {
      name: 'Courses',
      mainRoute: '/students',
      subMenu: [
        {
          name: 'Courses Grid',
          route: 'course-info',
          subRoute: 'courses-grid'
        },
        {
          name: 'Courses List',
          route: 'course-info',
          subRoute: 'courses-list'
        },
        {
          name: 'Courses Details',
          route: 'course-info',
          subRoute: 'courses-details'
        }
      ]
    },
    {
      name: 'Student',
      mainRoute: '/students',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard',
          subRoute: 'dashboard'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Take Course',
          route: 'course-info',
          subRoute: 'take-course'
        },
        {
          name: 'Course Forums',
          route: 'course-info',
          subRoute: 'course-forums'
        },
        {
          name: 'Take Quiz',
          route: 'course-info',
          subRoute: 'take-quiz'
        },
        {
          name: 'Edit Profile',
          route: 'user-info',
          subRoute: 'edit-profile'
        },
        {
          name: 'Edit Billing',
          route: 'user-info',
          subRoute: 'edit-billing'
        },
        {
          name: 'Messages',
          route: 'course-info',
          subRoute: 'messages'
        },
        {
          name: 'View Quiz',
          route: 'quiz-info',
          subRoute: 'view-quiz'
        }
      ]
    },
    {
      name: 'Instructor',
      mainRoute: '/instructor',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard-info',
          subRoute: 'dashboard'
        },
        {
          name: 'Categories',
          route:'categories-info',
          subRoute: 'categories'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Add Course',
          route: 'course-info',
          subRoute: 'edit-course'
        },
        {
          name: 'Earnings',
          route: 'user-info',
          subRoute: 'earnings'
        },
        {
          name: 'Statement',
          route: 'user-info',
          subRoute: 'statement'
        },
        {
          name: 'Edit Profile',
          route: 'user-info',
          subRoute: 'edit-profile'
        },
        {
          name: 'Edit Billing',
          route: 'user-info',
          subRoute: 'edit-billing'
        },
        {
          name: 'Messages',
          route: 'user-info',
          subRoute: 'messages'
        },
        {
          name: 'Add Schools',
          route: 'school-info',
          subRoute: 'add-schools'
        },
        {
          name: 'View Schools',
          route: 'school-info',
          subRoute: 'view-schools'
        },
        {
          name: 'Add Teacher',
          route: 'teacher-info',
          subRoute: 'add-teacher'
        },
        {
          name: 'View Teacher',
          route: 'teacher-info',
          subRoute: 'view-teacher'
        },
        {
          name:'Upload file',
          route:'upload-info',
          subRoute:'uploads'
        },
        {
          name:'Blog',
          route:'blog-info',
          subRoute:'blog-data'
        }
      ]
    },

    {
      name: 'Teacher',
      mainRoute: '/teacher',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard-info',
          subRoute: 'dashboard'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Add Course',
          route: 'course-info',
          subRoute: 'edit-course'
        },
        ]
    },
     {
      name: 'School',
      mainRoute: '/school',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard-info',
          subRoute: 'dashboard'
        },
        {
          name: 'Add Teacher',
          route: 'teacher-info',
          subRoute: 'add-teacher'
        },
        {
          name: 'View Teacher',
          route: 'teacher-info',
          subRoute: 'view-teacher'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Add Course',
          route: 'course-info',
          subRoute: 'edit-course'
        },
        ]
    }
  ];

const Student = [
    {
      name: 'Student Forum',
      subMenu: [
        {
          name: 'Forum Home',
          route: 'course-info',
          subRoute: 'forum-home'
        },
        {
          name: 'Forum Category',
          route: 'course-info',
          subRoute: 'forum-category'
        },
        {
          name: 'Forum Thread',
          route: 'course-info',
          subRoute: 'forum-thread'
        }
      ]
    },
    {
      name: 'Courses',
      mainRoute: '/students',
      subMenu: [
        {
          name: 'Courses Grid',
          route: 'course-info',
          subRoute: 'courses-grid'
        },
        {
          name: 'Courses List',
          route: 'course-info',
          subRoute: 'courses-list'
        },
        {
          name: 'Courses Details',
          route: 'course-info',
          subRoute: 'courses-details'
        }
      ]
    },
    {
      name: 'Student',
      mainRoute: '/students',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard',
          subRoute: 'dashboard'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Take Course',
          route: 'course-info',
          subRoute: 'take-course'
        },
        {
          name: 'Course Forums',
          route: 'course-info',
          subRoute: 'course-forums'
        },
        {
          name: 'Take Quiz',
          route: 'course-info',
          subRoute: 'take-quiz'
        },
        {
          name: 'Edit Profile',
          route: 'user-info',
          subRoute: 'edit-profile'
        },
        {
          name: 'Edit Billing',
          route: 'user-info',
          subRoute: 'edit-billing'
        },
        {
          name: 'Messages',
          route: 'course-info',
          subRoute: 'messages'
        },
        {
          name: 'View Quiz',
          route: 'quiz-info',
          subRoute: 'view-quiz'
        }
      ]
    },
    {
      name: 'Instructor',
      mainRoute: '/instructor',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard-info',
          subRoute: 'dashboard'
        },
        {
          name: 'Categories',
          route:'categories-info',
          subRoute: 'categories'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Add Course',
          route: 'course-info',
          subRoute: 'edit-course'
        },
        {
          name: 'Earnings',
          route: 'user-info',
          subRoute: 'earnings'
        },
        {
          name: 'Statement',
          route: 'user-info',
          subRoute: 'statement'
        },
        {
          name: 'Edit Profile',
          route: 'user-info',
          subRoute: 'edit-profile'
        },
        {
          name: 'Edit Billing',
          route: 'user-info',
          subRoute: 'edit-billing'
        },
        {
          name: 'Messages',
          route: 'user-info',
          subRoute: 'messages'
        },
        {
          name: 'Add Schools',
          route: 'school-info',
          subRoute: 'add-schools'
        },
        {
          name: 'View Schools',
          route: 'school-info',
          subRoute: 'view-schools'
        },
        {
          name: 'Add Teacher',
          route: 'teacher-info',
          subRoute: 'add-teacher'
        },
        {
          name: 'View Teacher',
          route: 'teacher-info',
          subRoute: 'view-teacher'
        },
        {
          name:'Upload file',
          route:'upload-info',
          subRoute:'uploads'
        },
        {
          name:'Blog',
          route:'blog-info',
          subRoute:'blog-data'
        }
      ]
    },

    {
      name: 'Teacher',
      mainRoute: '/teacher',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard-info',
          subRoute: 'dashboard'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Add Course',
          route: 'course-info',
          subRoute: 'edit-course'
        },
        ]
    },
     {
      name: 'School',
      mainRoute: '/school',
      subMenu: [
        {
          name: 'Dashboard',
          route: 'dashboard-info',
          subRoute: 'dashboard'
        },
        {
          name: 'Add Teacher',
          route: 'teacher-info',
          subRoute: 'add-teacher'
        },
        {
          name: 'View Teacher',
          route: 'teacher-info',
          subRoute: 'view-teacher'
        },
        {
          name: 'My Courses',
          route: 'course-info',
          subRoute: 'my-courses'
        },
        {
          name: 'Add Course',
          route: 'course-info',
          subRoute: 'edit-course'
        },
        ]
    }
  ];

module.exports = {
  Admin : Admin,
  Instructor : Instructor,
  School : School,
  Teacher : Teacher,
  Student : Student
}