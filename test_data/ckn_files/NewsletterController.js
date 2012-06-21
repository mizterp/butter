
function NewsletterController() { }
NewsletterController._path = '/dwr';

NewsletterController.signUpNewsletters = function(p0, callback) {
    DWREngine._execute(NewsletterController._path, 'NewsletterController', 'signUpNewsletters', p0, false, false, callback);
}

NewsletterController.signUpMobileAlerts = function(p0, callback) {
    DWREngine._execute(NewsletterController._path, 'NewsletterController', 'signUpMobileAlerts', p0, false, false, callback);
}
