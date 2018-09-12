module.exports = {
	"1" : {
		"queryFields" : "category subcategory title shortDescription rating userRatings price tags type students createdBy.name createdBy.id topics icon status isPaid activationMethod",
	},
	"courseDetails" : {
		"queryFields" : "title shortDescription longDescription rating userRatings price tags type students createdBy.name isPaid activationMethod prerequisites",
		// "populateFields" : "title subtopics",
		"populateTopics" : "title subtopics",
		"populateSubtopics" : "title",
		// "populateLearningPaths" : "title mainContent otherContents",
		// "limit" : 3,
		// "sort" : "desc"
	},

	"2" : {
		"queryFields" : "category subcategory title shortDescription rating userRatings price tags type students createdBy.name createdBy.id icon status isPaid activationMethod",
	},

	"coursePreview" : {
		"queryFields" : "title shortDescription longDescription rating userRatings price tags type students createdBy.name isPaid activationMethod prerequisites",
		"populateTopics" : "title subtopics",
		"populateSubtopics" : "title videos notes keypoints media references learningPaths",
		"populateLearningPaths" : "title mainContent otherContents",
	}
	
}