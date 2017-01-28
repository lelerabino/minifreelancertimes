var SPA = window.SPA = {
    preventPushState: true,
    ENVIRONMENT: {
        jsEnvironment: 'browser',
        spaSettings: {
            touchpoints: {
                diagnosticUrl:'/api/logs'
            }
        },
        PROFILE: {user: 'lelerabino'},
        serverSettings: JSON.parse('{}')
    }
    , getSessionInfo: function (key) {
        var session = SPA.SESSION || SPA.DEFAULT_SESSION || {};
        return (key) ? session[key] : session;
    }
    , getProfile: function () {
        return SPA.ENVIRONMENT.PROFILE;
    },
    getCurrentWeek: function () {
        var now = moment().startOf('day');
        return this.getRelativeWeeks(now);
    },
    getRelativeWeeks: function (mdate) {
        return mdate.clone().diff(this.dtRef, 'weeks');
    },
    getDateFromRelWeek: function (weeks) {
        return this.dtRef.clone().add(weeks, 'weeks').startOf('isoweek');
    }
};
