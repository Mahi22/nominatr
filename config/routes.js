var async = require('async');

module.exports = function(app, passport, auth) {
    //User Routes
    var users = require('../app/controllers/users');
    app.get('/signin', users.signin);
    app.get('/signup', users.signup);
    app.get('/signout', users.signout);

    //Setting up the users api
    app.post('/users', users.create);
    
    app.post('/users/session', passport.authenticate('local', {
        failureRedirect: '/signin',
        failureFlash: 'Invalid email or password.'
    }), users.session);

    app.get('/users/me', users.me);
    app.get('/users/:userId', users.show);

    //Setting the facebook oauth routes
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['email'], //,'user_about_me'
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the github oauth routes
    app.get('/auth/github', passport.authenticate('github', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/github/callback', passport.authenticate('github', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the twitter oauth routes
    app.get('/auth/twitter', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the google oauth routes
    app.get('/auth/google', passport.authenticate('google', {
        failureRedirect: '/signin',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }), users.signin);

    app.get('/auth/google/callback', passport.authenticate('google', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Finish with setting up the userId param
    app.param('userId', users.user);

    //Poll Routes
    var polls = require('../app/controllers/polls');
    app.get('/polls', polls.all);
    app.post('/polls', auth.requiresLogin, polls.create);
    app.get('/polls/:pollId', polls.show);
    app.put('/polls/:pollId', auth.requiresLogin, auth.poll.hasAuthorization, polls.update);
    app.del('/polls/:pollId', auth.requiresLogin, auth.poll.hasAuthorization, polls.destroy);

    //Finish with setting up the pollId param
    app.param('pollId', polls.poll);

    //Vote Routes
    var votes = require('../app/controllers/votes');
    app.get('/votes/:pollId', votes.show);
    app.post('/votes/:pollId', votes.create);
    app.put('/votes/:pollId', auth.requiresLogin, votes.update);
    app.del('/votes/:pollId', auth.requiresLogin, votes.destroy);

    //Finish with setting up the pollId param
    app.param('pollId', votes.vote);

    //Home route
    var index = require('../app/controllers/index');
    app.get('/', index.render);

};