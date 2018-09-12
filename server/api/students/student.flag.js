/*const course_details_q1 = `
courses.current.courseId 
courses.current.title
courses.current.longDescription 
courses.current.status
courses.current.progress 
courses.current.rating  
courses.current.createdBy.name

courses.current.topics.title
courses.current.topics.progress
courses.current.topics.status
courses.current.topics.topicId

courses.current.topics.subtopics.subtopicId
courses.current.topics.subtopics.title
courses.current.topics.subtopics.progress
courses.current.topics.subtopics.status

courses.current.topics.subtopics.learningPaths.status
courses.current.topics.subtopics.learningPaths.title
courses.current.topics.subtopics.learningPaths.progress`;*/

module.exports = {
	"dashboard" : {
		
		"queryFields" : `courses courses.courseId courses.current.courseId courses.current.assignedOn courses.current.progress courses.current.title
    courses.current.topics courses.current.topics.title courses.current.topics.topicId courses.current.status lastLoginOn isSubscribed subscriptionEndDate academicDetails.qualification`,

    "limit" : 3,
    "sort" : "desc"
  },
	/*"1" : {
		"queryFields" : "courses.progress courses.status ",
		"populateFields" : "title",
		"limit" : 3,
		"sort" : "desc"
	},
	"2" : {
		"queryFields" : "courses.category courses.progress courses.status",
		"populateFields" : "title rating userRatings shortDescription topics icon",
		// "limit" : 3, // Not required as here  all courses need to be send
		"sort" : "desc"
	},*/
	"3" : {
		"queryFields" : "",
		"populateFields" : "title",
		// "limit" : 3, // Not required as here  all courses need to be send
		"sort" : "desc"
	},
	"courseDetails" : {
		"queryFields" : "courses.progress courses.status courses.topics",
		"populateFields" : "title rating userRatings createdBy.name longDescription topics",
		"populateTopics" : "title subtopics",
		"populateSubtopics" : "title videos notes keypoints media references learningPaths",
		"populateLearningPaths" : "title mainContent otherContents",
	},
	"topicDetails" : {
		"queryFields" : "courses.progress courses.status courses.topics,courses._id",
		"populateFields" : "title topics",
		"populateTopics" : "title subtopics",
		"populateSubtopics" : "title learningPaths",
		"populateLearningPaths" : "title mainContent otherContents",
	},

	"assignCoursesInfo" : {
		'queryFields': "courses courses.courseId courses.current.courseId isSubscribed"
	},	

	"assignCoursesInfo_q2" : {
		'queryFields': `

		courses.current.courseId 
		courses.current.title
		courses.current.category._id
		courses.current.progress
		courses.current.status
		courses.current.rating
		courses.current.shortDescription 
		courses.current.topics.topicId 
		courses.current.icon 
		courses.current.assignedOn
		courses.current.subcategory
		`
	},

	"student_info_q1" : {
		'queryFields': "isSubscribed courses courses.current.title courses.current.courseId"
	},

	"student_info_q2" : {
		'queryFields': "name profilePic"
	},

	'course_details_q1': {
		'fields' : {
			'course': ['courseId','title','longDescription','status','progress','rating','createdBy.name','topics'],
			'topics': ['title','progress','status','topicId','subtopics'],
			'subtopics': ['title','progress','status','subtopicId','learningPaths'],
			'learningPaths': ['_id','title','progress','status']
		}
	},

	'course_details_q2' : {
		'fields' : {
			'course': ['courseId','title','longDescription','status','progress','createdBy.name','topics','version'],
			'topics': ['title','progress','status','topicId','subtopics','solutions'],
			'subtopics': ['title','progress','status','subtopicId','learningPaths'],
			'learningPaths': ['_id','title','progress','status','mainContent','otherContents'],
		}
	}
}



			/*'mainContent': ['contentId','title','type'],
			'otherContents': ['contentId','title','type']*/
