const express = require('express');
const mongoose = require('mongoose');
var Course = require('../api/courses/course.entity');
var Topics = require('../api/topics/topic.entity');
var Subtopics = require('../api/subtopics/subtopic.entity');
var Assessments = require('../api/assessments/assessment.entity');
var Questions = require('../api/questions/question.entity');
var Videos = require('../api/contents/videos/video.entity');
var Notes = require('../api/contents/notes/note.entity');
var Keypoints = require('../api/contents/keypoints/keypoint.entity');
var Media = require('../api/contents/media/media.entity');
var References = require('../api/contents/references/reference.entity');
const config = require('../config');
const constants = require('../constants');

const resMessages = constants.resMessages;
const loggerConfig = constants.logger;
const appConstants = constants.app;
const env = config.env;
const db = config.db;


mongoose.connect(db.MONGO.URL);

mongoose.connection.on('connected', function() {});

mongoose.connection.on('error', function(err) {});

mongoose.connection.on('disconnected', function() {});

process.on('SIGINT', function() {
    mongoose.connection.close(function() {
        process.exit(0);
    });
});

let instructors = ['5adae5e11f44401aa4d3e2be',
    '5adae6671f44401aa4d3e2c0',
    '5adae6b51f44401aa4d3e2c2',
    '5adae6fa1f44401aa4d3e2c4',
    '5adae73e1f44401aa4d3e2c6',
    '5adae85a1f44401aa4d3e2cc',
    '5adaecbd6f5ecb1be53ec781',
    '5adaed096f5ecb1be53ec783'
]
Course.find({ 'createdBy.id': { $in: instructors } }, function(err, courses) {
    if (err) {
        console.log(err);
    } else {
        console.log('courses.length  ' + courses.length);
        courses.forEach(function(course) {
            // console.log(course.createdBy.id);
            Topics.find({ _id: { $in: course.topics } }, function(err, topics) {
                if (err) {
                    console.log(err);
                } else {
                    // console.log('topics.length ' + topics.length);
                    topics.forEach(function(topic) {
                        Subtopics.find({ _id: { $in: topic.subtopics } }, function(err, subtopics) {
                            if (err) {
                                console.log(err);
                            } else {

                                // console.log('subtopics.length ' + subtopics.length);
                                subtopics.forEach(function(subtopic) {
                                    // Subtopics.updateOne({ _id: subtopic._id }, {
                                    //     $set: {
                                    //         "createdBy": {
                                    //             "id": new mongoose.mongo.ObjectId(course.createdBy.id),
                                    //             "role": "Instructor",
                                    //             "name": "Codestrippers",
                                    //             "date": Date.now()
                                    //         }
                                    //     }
                                    // }, function(err, data) {
                                    //     if (err) {
                                    //         console.log(err);
                                    //     } else {
                                    //         console.log(data);
                                    //     }
                                    // })
                                    Videos.find({ _id: { $in: subtopic.videos } }, function(err, videos) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            // console.log('videos.length ' + videos.length);
                                            // videos.forEach(function(video) {
                                            //     Videos.updateOne({ _id: video._id }, {
                                            //         $set: {
                                            //             "createdBy": {
                                            //                 "id": new mongoose.mongo.ObjectId(course.createdBy.id),
                                            //                 "role": "Instructor",
                                            //                 "name": "Codestrippers",
                                            //                 "date": Date.now()
                                            //             }
                                            //         }
                                            //     }, function(err, data) {
                                            //         if (err) {
                                            //             console.log(err);
                                            //         } else {
                                            //             console.log(data);
                                            //         }
                                            //     })
                                            // })
                                        }
                                    })

                                    Notes.find({ _id: { $in: subtopic.notes } }, function(err, notes) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            // console.log('notes.length ' + notes.length);
                                            // notes.forEach(function(note) {
                                            // 	Notes.updateOne({ _id: note._id }, {
                                            //         $set: {
                                            //             "createdBy": {
                                            //                 "id": new mongoose.mongo.ObjectId(course.createdBy.id),
                                            //                 "role": "Instructor",
                                            //                 "name": "Codestrippers",
                                            //                 "date": Date.now()
                                            //             }
                                            //         }
                                            //     }, function(err, data) {
                                            //         if (err) {
                                            //             console.log(err);
                                            //         } else {
                                            //             console.log(data);
                                            //         }
                                            //     })
                                            // })
                                        }
                                    })

                                    Keypoints.find({ _id: { $in: subtopic.keypoints } }, function(err, keypoints) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            // console.log('keypoints.length ' + keypoints.length);
                                            // keypoints.forEach(function(keypoint) {
                                            // 	Keypoints.updateOne({ _id: keypoint._id }, {
                                            //         $set: {
                                            //             "createdBy": {
                                            //                 "id": new mongoose.mongo.ObjectId(course.createdBy.id),
                                            //                 "role": "Instructor",
                                            //                 "name": "Codestrippers",
                                            //                 "date": Date.now()
                                            //             }
                                            //         }
                                            //     }, function(err, data) {
                                            //         if (err) {
                                            //             console.log(err);
                                            //         } else {
                                            //             console.log(data);
                                            //         }
                                            //     })
                                            // })
                                        }
                                    })

                                    Media.find({ _id: { $in: subtopic.media } }, function(err, media) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            // console.log('media.length ' + media.length);
                                            // media.forEach(function(mediaObj) {
                                            // 	Media.updateOne({ _id: mediaObj._id }, {
                                            //         $set: {
                                            //             "createdBy": {
                                            //                 "id": new mongoose.mongo.ObjectId(course.createdBy.id),
                                            //                 "role": "Instructor",
                                            //                 "name": "Codestrippers",
                                            //                 "date": Date.now()
                                            //             }
                                            //         }
                                            //     }, function(err, data) {
                                            //         if (err) {
                                            //             console.log(err);
                                            //         } else {
                                            //             console.log(data);
                                            //         }
                                            //     })
                                            // })

                                        }
                                    })

                                    References.find({ _id: { $in: subtopic.references } }, function(err, references) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            // console.log('references.length ' + references.length);
                                            // references.forEach(function(reference) {
                                            // 	References.updateOne({ _id: reference._id }, {
                                            //         $set: {
                                            //             "createdBy": {
                                            //                 "id": new mongoose.mongo.ObjectId(course.createdBy.id),
                                            //                 "role": "Instructor",
                                            //                 "name": "Codestrippers",
                                            //                 "date": Date.now()
                                            //             }
                                            //         }
                                            //     }, function(err, data) {
                                            //         if (err) {
                                            //             console.log(err);
                                            //         } else {
                                            //             console.log(data);
                                            //         }
                                            //     })
                                            // })
                                        }
                                    })

                                    Questions.find({ _id: { $in: subtopic.questions } }, function(err, questions) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            // console.log('questions.length ' + questions.length);
                                            questions.forEach(function(question) {
                                            	Questions.updateOne({ _id: question._id }, {
                                                    $set: {
                                                        "createdBy": {
                                                            "id": new mongoose.mongo.ObjectId(course.createdBy.id),
                                                            "role": "Instructor",
                                                            "name": "Codestrippers",
                                                            "date": Date.now()
                                                        }
                                                    }
                                                }, function(err, data) {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        console.log(data);
                                                    }
                                                })
                                            })
                                        }
                                    })
                                });
                            }
                        })
                    });
                }
            })
        });
    }
});