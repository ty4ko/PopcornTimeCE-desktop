(function (App) {
    'use strict';
    var querystring = require('querystring');
    var request = require('request');
    var Q = require('q');
    var inherits = require('util').inherits;

    var TVDB_Client = require('node-tvdb');
    var tvdb_token = '7B95D15E1BE1D75A';

    var URL = false;
    var TVApi = function () {
        try {
            var tvdb = new TVDB_Client(tvdb_token);
            tvdb.getLanguages()
                .then(function (langlist) {
                    AdvSettings.set('tvdbLangs', langlist);
                });
        } catch (e) {
            AdvSettings.set('tvdbLangs', false);
            win.warn('Something went wrong with TVDB, overviews can\'t be translated.');
        }
        TVApi.super_.call(this);
    };

    inherits(TVApi, App.Providers.Generic);

    var queryTorrents = function (filters) {

        var deferred = Q.defer();

        var params = {};
        params.sort = 'seeds';
        params.limit = '50';

        if (filters.keywords) {
            params.keywords = filters.keywords.replace(/\s/g, '% ');
        }

        if (filters.genre) {
            params.genre = filters.genre;
        }

        if (filters.order) {
            params.order = filters.order;
        }

        if (filters.sorter && filters.sorter !== 'popularity') {
            params.sort = filters.sorter;
        }

        var options = {
            url: Settings.tvAPI.url + 'shows/' + filters.page + '?' + querystring.stringify(params).replace(/%25%20/g, '%20'),
            json: true
        };

        var req = jQuery.extend(true, {}, Settings.tvAPI, options);
        win.info('Request to TVApi', req.url);
        request(req, function (err, res, data) {
            if (err || res.statusCode >= 400) {
                win.warn('TVAPI endpoint \'%s\' failed.', req.uri);
                return deferred.reject(err || 'Status Code is above 400');
            } else if (!data || (data.error && data.error !== 'No movies found')) {
                err = data ? data.status_message : 'No data returned';
                win.error('TVApi error:', err);
                return deferred.reject(err);
            } else {
                data.forEach(function (entry) {
                    entry.type = 'show';
                });
                deferred.resolve({
                    results: Common.sanitize(data),
                    hasMore: true
                });
            }
        });

        return deferred.promise;
    };

    // Single element query
    var queryTorrent = function (torrent_id, old_data, debug) {
        debug === undefined ? debug = true : '';
        return Q.Promise(function (resolve, reject) {
            var options = {
                url: Settings.tvAPI.url + 'show/' + torrent_id,
                json: true
            };
            var req = jQuery.extend(true, {}, Settings.tvAPI, options);
            win.info('Request to TVApi', req.url);
            request(req, function (error, response, data) {
                if (error || response.statusCode >= 400) {
                    win.warn('TVAPI endpoint \'%s\' failed.', req.uri);
                    return reject(error || 'Status Code is above 400');
                } else if (!data || (data.error && data.error !== 'No data returned') || data.episodes.length === 0) {
                    var err = (data && data.episodes.length !== 0) ? data.error : 'No data returned';
                    debug ? win.error('API error:', err) : '';
                    reject(err);
                } else {
                    data = Common.sanitize(data);
                    // we cache our new element or translate synopsis
                    if (Settings.translateSynopsis && Settings.language !== 'en') {
                        var langAvailable;
                        for (var x = 0; x < Settings.tvdbLangs.length; x++) {
                            if (Settings.tvdbLangs[x].abbreviation.indexOf(Settings.language) > -1) {
                                langAvailable = true;
                                break;
                            }
                        }
                        if (!langAvailable) {
                            resolve(data);
                        } else {

                            var reqTimeout = setTimeout(function () {
                                resolve(data);
                            }, 2000);

                            var tvdb = new TVDB_Client(tvdb_token, Settings.language);
                            win.info('Request to TVDB API: \'%s\' - %s', old_data.title, App.Localization.langcodes[Settings.language].name);
                            tvdb.getSeriesAllById(old_data.tvdb_id)
                                .then(function (localization) {
                                    clearTimeout(reqTimeout);
                                    _.extend(data, {
                                        synopsis: localization.Overview
                                    });
                                    for (var i = 0; i < localization.Episodes.length; i++) {
                                        for (var j = 0; j < data.episodes.length; j++) {
                                            if (localization.Episodes[i].id.toString() === data.episodes[j].tvdb_id.toString()) {
                                                data.episodes[j].overview = localization.Episodes[i].Overview;
                                                break;
                                            }
                                        }
                                    }
                                    resolve(Common.sanitize(data));
                                })
                                .catch(function (error) {
                                    resolve(data);
                                });
                        }
                    } else {
                        resolve(data);
                    }
                }
            });
        });
    };

    TVApi.prototype.extractIds = function (items) {
        return _.pluck(items.results, 'imdb_id');
    };

    TVApi.prototype.fetch = function (filters) {
        return queryTorrents(filters);
    };

    TVApi.prototype.detail = function (torrent_id, old_data, debug) {
        return queryTorrent(torrent_id, old_data, debug);
    };

    App.Providers.TVApi = TVApi;

})(window.App);
