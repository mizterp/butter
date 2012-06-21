
function RecipeRatingsManager() { }
RecipeRatingsManager._path = '/dwr';

RecipeRatingsManager.getRating = function(p0, callback) {
    DWREngine._execute(RecipeRatingsManager._path, 'RecipeRatingsManager', 'getRating', p0, false, false, callback);
}

RecipeRatingsManager.saveRating = function(p0, callback) {
    DWREngine._execute(RecipeRatingsManager._path, 'RecipeRatingsManager', 'saveRating', p0, false, false, callback);
}
