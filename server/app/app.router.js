const path = require('path');

const apiRoutes = require('../api');

// All routes used in application
const useRoutes = function(app) {
	app.use('/api/auth', apiRoutes.authenticationRoutes(app.io));
	app.use('/api/role', apiRoutes.authenticationTokenRoutes,apiRoutes.role);
	app.use('/api/menus', apiRoutes.authenticationTokenRoutes, apiRoutes.menu);
	app.use('/api/users', apiRoutes.userRoutes);
	app.use('/api/users/profile',apiRoutes.authenticationTokenRoutes, apiRoutes.userRoutes);
	app.use('/authenticateToken',apiRoutes.authenticationTokenRoutes);
	app.use('/api/courses/releaseCourses', apiRoutes.releaseCoursesRoutes);
	app.use('/api/courses', apiRoutes.courseRoutes);
	app.use('/api/topics', apiRoutes.authenticationTokenRoutes, apiRoutes.topicRoutes);
	app.use('/api/subtopics',apiRoutes.authenticationTokenRoutes, apiRoutes.subtopicRoutes);
	app.use('/blogs', apiRoutes.authenticationTokenRoutes, apiRoutes.blogRoutes);
	app.use('/api/notes', apiRoutes.authenticationTokenRoutes, apiRoutes.notesRoutes);
	app.use('/api/videos', apiRoutes.authenticationTokenRoutes, apiRoutes.videoRoutes);
	app.use('/api/search', apiRoutes.authenticationTokenRoutes, apiRoutes.searchRoutes);
	app.use('/api/references', apiRoutes.authenticationTokenRoutes, apiRoutes.referencesRoutes);
	app.use('/api/keypoints', apiRoutes.authenticationTokenRoutes, apiRoutes.keypointRoutes);
	app.use('/api/media', apiRoutes.authenticationTokenRoutes, apiRoutes.mediaRoutes);
	app.use('/api/upload', apiRoutes.uploadRoutes);
	app.use('/api/categories',apiRoutes.authenticationTokenRoutes,apiRoutes.categoryRoutes);
	app.use('/api/questions', apiRoutes.authenticationTokenRoutes,apiRoutes.questionRoutes);
	app.use('/api/assessments',apiRoutes.authenticationTokenRoutes, apiRoutes.assessmentRoutes);
	app.use('/api/schools', apiRoutes.authenticationTokenRoutes,apiRoutes.schoolRoutes);
	app.use('/api/teachers', apiRoutes.authenticationTokenRoutes,apiRoutes.teacherRoutes);
	app.use('/api/contact',apiRoutes.contactRoutes);
	app.use('/api/instructors', apiRoutes.authenticationTokenRoutes,apiRoutes.instructorRoutes);
	app.use('/api/students',apiRoutes.studentRoutes);
	app.use('/api/playlists',apiRoutes.authenticationTokenRoutes, apiRoutes.playlistRoutes);
	app.use('/api/assessmentresults',apiRoutes.authenticationTokenRoutes,apiRoutes.quizResultRoutes);
	app.use('/api/subcategories',apiRoutes.authenticationTokenRoutes, apiRoutes.subcategoryRoutes);
	app.use('/api/profiles',apiRoutes.authenticationTokenRoutes, apiRoutes.ProfileRoute);
	app.use('/api/assign/courses',apiRoutes.authenticationTokenRoutes, apiRoutes.assignCourseRoutes);
	app.use('/api/skills',apiRoutes.authenticationTokenRoutes, apiRoutes.skillRoutes);
	app.use('/api/projects',apiRoutes.authenticationTokenRoutes, apiRoutes.projectRoutes);
	app.use('/api/programs',apiRoutes.authenticationTokenRoutes,apiRoutes.programRoutes);
	app.use('/api/helps',apiRoutes.authenticationTokenRoutes, apiRoutes.helpRoutes);
	app.use('/api/admins', apiRoutes.authenticationTokenRoutes, apiRoutes.adminRoutes);
	app.use('/api/orders', apiRoutes.orderRoutes);
	app.use('/api/carts', apiRoutes.authenticationTokenRoutes, apiRoutes.cartRoutes);
	app.use('/api/country', apiRoutes.authenticationTokenRoutes, apiRoutes.countryRoutes);
	// app.use('/api/admins', apiRoutes.authenticationTokenRoutes, apiRoutes.adminRoutes);
	app.use('/sitemap.xml',apiRoutes.sitemap);
	app.use('/robots.txt',apiRoutes.robots);
	app.use('/google276614a24a981680.html',apiRoutes.google);
	app.use('/vimeo',apiRoutes.vimeo);
	app.use('/subscribe',apiRoutes.subscribe);
  app.use('/api/country', apiRoutes.authenticationTokenRoutes, apiRoutes.countryRoutes);
  app.use('/api/classes', apiRoutes.authenticationTokenRoutes, apiRoutes.classRoutes);
	// app.use('/policy.html',apiRoutes.policy);
};

module.exports = {
	useRoutes : useRoutes
};
