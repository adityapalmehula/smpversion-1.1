const appConfig = require('../../constants').app;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const logger = require('../../services/app.logger');


/*
 * This is a users schema, for persisting credentials of each user registered in the system
 */

 const usersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        virtual: true
    },
    name: {
        type: String,
        virtual: true
    },
    platform: {
      type: String,
    },
    role: {
        type: String,
        enum: appConfig.USER_ROLES
    },
    status: {
        type: String,
        enum: appConfig.USER_DETAILS.USER_STATUS
    },
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: String,
        required: true,
        default: 'B2B',
    },
    isVerified: { 
        type: Boolean,
        default: false
    },
    unqId: { 
        type: String,
    },
    isPasswordReset: {
       type: Boolean,
   },
   lastLoginOn: {
    type: Date,
    default: Date.now
},
createdOn: {
    type: Date,
    default: Date.now
},
updatedOn: {
    type: Date,
    default: Date.now
},
}, {
    collection: 'users'
});

//  mongoose middleware for password encryption, encrypt the pasword before storing
usersSchema.pre('save', function (next) {
    var user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();
    logger.debug('mongoose middleware called for password encryption');
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
        logger.debug('user already exists');
        return next();
    }
    // generate a salt
    bcrypt.genSalt(appConfig.SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);
        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            logger.debug('Password encryption started');

            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

//  mongoose middleware for password encryption, encrypt the pasword before storing
usersSchema.pre('findOneAndUpdate', function (next) {
    var user = this;
    var updates = this._update;
    // generate a salt
    if (updates.password) {
        bcrypt.genSalt(appConfig.SALT_WORK_FACTOR, function (err, salt) {
            if (err) return next(err);
            // hash the password using our new salt
            bcrypt.hash(updates.password, salt, function (err, hash) {
                logger.debug('Password encryption started');

                if (err) return next(err);
                // override the cleartext password with the hashed one
                updates.password = hash;
                next();
            });
        });
    }
});


// method to compare the password (the incoming password will be encrypted and compared )
usersSchema.methods.comparePassword = function (userPassword, callback) {
    logger.debug('compare Password method called');
    bcrypt.compare(userPassword, this.password, function (err, isMatch) {
        if (err) return callback({'err':'password is incorrect' + err}, null);
        callback(null, isMatch);
    });
};


module.exports = mongoose.model('users', usersSchema);