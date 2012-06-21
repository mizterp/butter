
function LoginManager() { }
LoginManager._path = '/dwr';

LoginManager.loginUser = function(p0, callback) {
    DWREngine._execute(LoginManager._path, 'LoginManager', 'loginUser', p0, false, false, callback);
}

LoginManager.checkLoginForRecipeDetails = function(p0, p1, callback) {
    DWREngine._execute(LoginManager._path, 'LoginManager', 'checkLoginForRecipeDetails', p0, p1, false, callback);
}
