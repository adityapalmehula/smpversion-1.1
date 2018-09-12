// test cases
const router = require('./auth.router');
const supertest = require('supertest')(router);
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;

chai.use(chaiAsPromised);

describe('Authentication', function() {
    it('Authenticated user', function(done) {
        supertest
            .post('/')
            .set('Accept', 'application/x-www-form-urlencoded')
            .send({
                username: '',
                password: ''
            })
            .expect(201)
            .end(function(err, res) {
                if(err) done(err);
                expect(Promise.resolve(res.body)).to.eventually.have.property('authToken');
                done();
            });
    });
});

describe('email', function() {
    it('register email', function(done) {
        supertest
            .post('/register-email')
            .set('Accept', 'application/x-www-form-urlencoded')
            .send({

            })
            .expect(201)
            .end(function(err, res) {
                if(err) done(err);
                expect(Promise.resolve(res.body)).to.eventually.have.property('message');
                done();
            });
    });

    it('verify email', function(done) {
        supertest
            .post('/verify-email')
            .set('Accept', 'application/x-www-form-urlencoded')
            .send({

            })
            .expect(201)
            .end(function(err, res) {
                if(err) done(err);
                expect(Promise.resolve(res.body)).to.eventually.have.property('msg');
                done();
            });
    });

    it('verify reset email', function(done) {
        supertest
            .post('/verify-reset-email')
            .set('Accept', 'application/x-www-form-urlencoded')
            .send({

            })
            .expect(201)
            .end(function(err, res) {
                if(err) done(err);
                expect(Promise.resolve(res.body.message)).to.eventually.equal('sent successfully');
                done();
            });
    });

    it('reset email', function(done) {
        supertest
            .post('/reset-password')
            .set('Accept', 'application/x-www-form-urlencoded')
            .send({

            })
            .expect(201)
            .end(function(err, res) {
                if(err) done(err);
                expect(Promise.resolve(res.body.message)).to.eventually.equal('sent successfully');
                done();
            });
    });
});

describe('Password', function() {
    it('Password reset', function(done) {
        supertest
            .post('/reset-password')
            .set('Accept', 'application/x-www-form-urlencoded')
            .send({

            })
            .expect(201)
            .end(function(err, res) {
                if(err) done(err);
                expect(Promise.resolve(res.body.msg)).to.eventually.equal('Successfully Updated');
                done();
            });
    });
});
