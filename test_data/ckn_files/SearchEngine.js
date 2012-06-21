
function SearchEngine() { }
SearchEngine._path = '/dwr';

SearchEngine.doSearch = function(p0, p1, callback) {
    DWREngine._execute(SearchEngine._path, 'SearchEngine', 'doSearch', p0, p1, false, callback);
}
