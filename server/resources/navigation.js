const Instructor = [
    // {
    //   name: 'Instructor Forum',
    //   subMenu: [
    //     {
    //       name: 'Forum Home',
    //       route: 'course-info',
    //       subRoute: 'forum-home'
    //     },
    //     {
    //       name: 'Forum Category',
    //       route: 'course-info',
    //       subRoute: 'forum-category'
    //     },
    //     {
    //       name: 'Forum Thread',
    //       route: 'course-info',
    //       subRoute: 'forum-thread'
    //     }
    //   ]
    // },
    {
      name: 'Dashboard',
      mainRoute: '/instructor',
      subMenu: [
      {
        name: 'Dashboard',
        route: 'dashboard-info',
        subRoute: 'dashboard'
      }


      ]
    },
    {
      name: 'Courses',
      mainRoute: '/instructor',
      subMenu: [
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
        name: 'View Quiz',
        route: 'quiz-info',
        subRoute: 'view-quiz'
      }
      ]
    },
    {
      name: 'Students',
      mainRoute: '/instructor',
      subMenu: [
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
        name:'Upload file',
        route:'upload-info',
        subRoute:'uploads'
      },
      {
        name: 'Assign-Courses',
        route: 'assign-courses',
        subRoute: 'courses-students'
      },
      ]
    },
    

    {
      name: 'Teachers',
      mainRoute: '/instructor',
      subMenu: [
      {
        name: 'Add Teacher',
        route: 'teacher-info',
        subRoute: 'add-teacher'
      },
      {
        name: 'View Teacher',
        route: 'teacher-info',
        subRoute: 'view-teacher'
      }
      ]
    },
    {
      name: 'Schools',
      mainRoute: '/instructor',
      subMenu: [
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
        name: 'Assign Categories',
        route: 'assign-categories',
        subRoute: 'categories-schools'
      },
      ]
    },

    {
      name: 'Blogs',
      mainRoute: '/instructor',
      subMenu: [
      {
        name:'Blog',
        route:'blog-info',
        subRoute:'blog-data'
      }

      ]
    },
    {
      name: 'Playlist',
      mainRoute: '/instructor',
      subMenu: [
      {
        name:'Playlist',
        route:'playlist',
        subRoute:'add-palylist'
      },
      {
        name:'Search Playlist',
        route:'playlist',
        subRoute:'search-playlist',
      }
      ]
    },

    ];
    
    const Student = [
    {
      name: 'Dashboard',
      mainRoute: '/students',
      subMenu: [
      {
        name: 'Dashboard',
        route: 'dashboard',
        subRoute: 'dashboard'
      }
      ]
    },
    {
      name: 'Courses',
      mainRoute: '/students',
      subMenu: [
      {
        name: 'My Courses',
        route: 'course-info',
        subRoute: 'my-courses'
      },
      {
        name: 'Course Forums',
        route: 'course-info',
        subRoute: 'course-forums'
      }
      ]
    },
    {
      name: 'Students',
      mainRoute: '/students',
      subMenu: [
      {
        name: 'Edit Profile',
        route: 'user-info',
        subRoute: 'edit-profile'
      }
      ]
    },
    {
      name: 'Quizzes',
      mainRoute: '/students',
      subMenu: [
      {
        name: 'View Quiz',
        route: 'quiz-info',
        subRoute: 'view-quiz'
      }
      
      ]
    },
    {
      name: 'Teachers',
      mainRoute: '/students',
      subMenu: [
      {
        name: 'View Teacher',
        route: 'teacher-info',
        subRoute: 'view-teacher'
      },
      ]
    },
    {
      name: 'Student Forum',
      subMenu: [
      {
        name: 'Forum Home',
        route: 'course-info',
        subRoute: 'forum-home'
      }
      ]
    }
    ];

    const Admin = [
    {
      name: 'Instructors',
      mainRoute: '/admin',
      subMenu: [
      {
        name: 'Add Instructor',
        route: 'instructor-info',
        subRoute: 'add-instructor'
      },
      {
        name: 'View Instructor',
        route: 'instructor',
      },
      {
        name: 'View Skills',
        route: 'skills',
      },
      {
        name: 'Students',
        route: 'students',
        // subRoute: 'view-instructor'
      },
      ]
    }
    ]
    const School = [
    {
      name: 'Dashboard',
      mainRoute: '/school',
      subMenu: [
      {
        name: 'Dashboard',
        route: 'dashboard-info',
        subRoute: 'dashboard'
      }
      ]
    },
    {
      name: 'Courses',
      mainRoute: '/school',
      subMenu: [
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
        name: 'View Quiz',
        route: 'quiz-info',
        subRoute: 'view-quiz'
      }
      ]
    },
    {
      name: 'Students',
      mainRoute: '/school',
      subMenu: [
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
        name:'Upload file',
        route:'upload-info',
        subRoute:'uploads'
      },
      {
        name: 'Assign-Courses',
        route: 'assign-courses',
        subRoute: 'courses-students'
      },
      ]
    },
    

    {
      name: 'Teachers',
      mainRoute: '/school',
      subMenu: [
      {
        name: 'Add Teacher',
        route: 'teacher-info',
        subRoute: 'add-teacher'
      },
      {
        name: 'View Teacher',
        route: 'teacher-info',
        subRoute: 'view-teacher'
      }
      ]
    },
    {
      name: 'Blogs',
      mainRoute: '/school',
      subMenu: [
      {
        name:'Blog',
        route:'blog-info',
        subRoute:'blog-data'
      }

      ]
    },
    {
      name: 'Playlist',
      mainRoute: '/school',
      subMenu: [
      {
        name:'Playlist',
        route:'playlist',
        subRoute:'add-palylist'
      },
      {
        name:'Search Playlist',
        route:'playlist',
        subRoute:'search-playlist',
      }
      ]
    }

    ];

    const Teacher = [
    {
      name: 'Dashboard',
      mainRoute: '/teacher',
      subMenu: [
      {
        name: 'Dashboard',
        route: 'dashboard-info',
        subRoute: 'dashboard'
      }
      ]
    },
    {
      name: 'Courses',
      mainRoute: '/teacher',
      subMenu: [
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
        name: 'View Quiz',
        route: 'quiz-info',
        subRoute: 'view-quiz'
      }
      ]
    },
    {
      name: 'Students',
      mainRoute: '/teacher',
      subMenu: [
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
        name:'Upload file',
        route:'upload-info',
        subRoute:'uploads'
      },
      ]
    },
    {
      name: 'Blogs',
      mainRoute: '/teacher',
      subMenu: [
      {
        name:'Blog',
        route:'blog-info',
        subRoute:'blog-data'
      }

      ]
    },
    {
      name: 'Playlist',
      mainRoute: '/teacher',
      subMenu: [
      {
        name:'Playlist',
        route:'playlist',
        subRoute:'add-palylist'
      },
      {
        name:'Search Playlist',
        route:'playlist',
        subRoute:'search-playlist',
      }
      ]
    }

    ];

    module.exports = {
      Instructor : Instructor,
      Student : Student,
      Admin : Admin,
      School : School,
      Teacher : Teacher
    }