/*
 * What this resource or module will do?
 * Handles authentication Token operations related to "users"
 * Users is a collection for maintaining/persisting credentials part of each user registered in the system
 *
 * Verify the token and its expiry time.If expiry time is not expired,the refresh token is providing
 * 
 * so token sliding is happening here
 *
 */

module.exports = require('./authToken.router');
