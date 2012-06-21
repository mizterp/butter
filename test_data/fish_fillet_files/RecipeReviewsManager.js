
function RecipeReviewsManager() { }
RecipeReviewsManager._path = '/dwr';

RecipeReviewsManager.setupReviewForm = function(p0, callback) {
    DWREngine._execute(RecipeReviewsManager._path, 'RecipeReviewsManager', 'setupReviewForm', p0, false, false, callback);
}

RecipeReviewsManager.getCachedReview = function(p0, callback) {
    DWREngine._execute(RecipeReviewsManager._path, 'RecipeReviewsManager', 'getCachedReview', p0, false, false, false, callback);
}

RecipeReviewsManager.cacheReview = function(p0, callback) {
    DWREngine._execute(RecipeReviewsManager._path, 'RecipeReviewsManager', 'cacheReview', p0, false, false, false, callback);
}

RecipeReviewsManager.clearCachedReview = function(p0, callback) {
    DWREngine._execute(RecipeReviewsManager._path, 'RecipeReviewsManager', 'clearCachedReview', p0, false, callback);
}

RecipeReviewsManager.saveReview = function(p0, callback) {
    DWREngine._execute(RecipeReviewsManager._path, 'RecipeReviewsManager', 'saveReview', p0, false, false, callback);
}
