const sitemap = require('./sitemap.router');
const robots = require('./robots.router');
const google = require('./google.router');
const menu = require('./menu.router');
const role = require('./role.router');
const policy = require('./policy.router');
const vimeo = require('./vimeo.router');
const subscribe = require('./subscribe.router');

module.exports = {
	sitemap : sitemap,
	robots : robots,
	google : google,
	menu : menu,
	role : role,
	policy : policy,
	vimeo : vimeo,
	subscribe : subscribe
}