const courseRoutes = require('./courses');
const topicRoutes = require('./topics');
const subtopicRoutes = require('./subtopics');
const blogRoutes=require('./blogs');
const userRoutes = require('./users');
const authenticationRoutes = require('./authentication');
const notesRoutes = require('./contents/notes');
const videoRoutes = require('./contents/videos');
const searchRoutes = require('./contents/search');
const referencesRoutes = require('./contents/references');
const keypointRoutes = require('./contents/keypoints');
const mediaRoutes = require('./contents/media');
const uploadRoutes = require('./uploads');
const categoryRoutes=require('./categories');
const questionRoutes = require('./questions');
const assessmentRoutes = require('./assessments');
const authenticationTokenRoutes = require('./authenticateToken/index');
const schoolRoutes = require('./schools');
const teacherRoutes = require('./teachers');
const contactRoutes = require('./contacts');
const instructorRoutes = require('./instructors');
const studentRoutes = require('./students');
const playlistRoutes = require('./playlists');
const quizResultRoutes = require('./assessmentResults');
const subcategoryRoutes = require('./subcategories');
const ProfileRoute = require('./profiles');
const common = require('./common');
const assignCourseRoutes = require('./assignCourses');
const skillRoutes = require('./skills');
const adminRoutes = require('./admins');
const projectRoutes = require('./projects');
const programRoutes = require('./programs');
const helpRoutes = require('./helps');
const orderRoutes = require('./orders');
const cartRoutes = require('./carts');
const releaseCoursesRoutes = require('./releaseCourses');
const countryRoutes = require('./country');
const classRoutes= require('./classes');

module.exports = {
	userRoutes : userRoutes,
	courseRoutes : courseRoutes,
	topicRoutes : topicRoutes,
	subtopicRoutes : subtopicRoutes,
	categoryRoutes:categoryRoutes,
	blogRoutes : blogRoutes,
	authenticationRoutes : authenticationRoutes,
	notesRoutes: notesRoutes,
	videoRoutes: videoRoutes,
	searchRoutes:searchRoutes,
	referencesRoutes : referencesRoutes,
	keypointRoutes: keypointRoutes,
	mediaRoutes : mediaRoutes,
	uploadRoutes : uploadRoutes,
	questionRoutes: questionRoutes,
	assessmentRoutes: assessmentRoutes,
	authenticationTokenRoutes : authenticationTokenRoutes,
	schoolRoutes : schoolRoutes,
	teacherRoutes: teacherRoutes,
	contactRoutes: contactRoutes,
	instructorRoutes: instructorRoutes,
	studentRoutes: studentRoutes,
	playlistRoutes: playlistRoutes,
	quizResultRoutes: quizResultRoutes,
	subcategoryRoutes: subcategoryRoutes,
	ProfileRoute: ProfileRoute,
	sitemap : common.sitemap,
	robots : common.robots,
	google : common.google,
	menu : common.menu,
	role : common.role,
	policy : common.policy,
	vimeo : common.vimeo,
	subscribe : common.subscribe,
	assignCourseRoutes: assignCourseRoutes,
	skillRoutes : skillRoutes,
	adminRoutes : adminRoutes,
	projectRoutes : projectRoutes,
	helpRoutes : helpRoutes,
	orderRoutes : orderRoutes,
	cartRoutes : cartRoutes,
	releaseCoursesRoutes : releaseCoursesRoutes,
	programRoutes:programRoutes,
  countryRoutes : countryRoutes,
  classRoutes : classRoutes,
}
