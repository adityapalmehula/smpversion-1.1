const navMenus = {
  Admin: [
  {
    label: 'Categories',
    url: 'categories',
  },
  {
    label: 'Courses',
    url: 'courses',
    subMenus: [
    { label: 'Courses', url: 'courses' },
    ]
  },
  {
    label: 'Instructors',
    url: 'instructors'
  },
  {
    label: 'Schools',
    url: 'schools'
  }, 
  {
    label: 'Teachers',
    url: 'teachers'
  }, 
  {
    label: 'Students',
    url: 'students'
  },
  {
    label: 'Skills',
    url: 'skills'
  },
  {
    label: 'Projects',
    url: 'projects'
  },
  {
    label: 'Help',
    url: 'helps',
  },
  {
    label: 'Programs',
    url: 'programs',
  },
  ],
  Instructor: [{
    label: 'Categories',
    url: 'categories',
  },
  {
    label: 'Courses',
    url: 'courses',

  },
  {
    label: 'Projects',
    url: 'projects'
  },
  ],
  School: [
  {
    label: 'Courses',
    url: 'courses'
  }, 
  {
    label: 'Classes',
    url: 'classes'
  },
  {
    label: 'Teachers',
    url: 'teachers'
  }, 
  {
    label: 'Students',
    url: 'students'
  }, 
  {
    label: 'Questions',
    url: 'manage-question'
  }, 
  {
    label: 'Assessments',
    url: 'manage-assessment'
  },
  ],
  Teacher: [
  {
    label: 'Courses',
    url: 'courses'
  },
  {
    label: 'Students',
    url: 'students'
  },
  {
    label: 'Questions',
    url: 'manage-question'
  }, 
  {
    label: 'Assessments',
    url: 'manage-assessment'
  },
  ],
  Student: [{
    label: 'Courses',
    url: 'courses',
    subMenus: [
    { label: 'My Courses', url: 'mycourses' },
    { label: 'All Courses', url: 'allcourses' },
    ]
  },
  {
    label: 'Help',
    url: 'helps',
  },
  ],

}

module.exports = {
  navMenus: navMenus
}