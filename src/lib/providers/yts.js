(function (App) {
    'use strict';

    var Q = require('q');
    var request = require('request');
    var inherits = require('util').inherits;

    function YTS() {
        if (!(this instanceof YTS)) {
            return new YTS();
        }

        App.Providers.Generic.call(this);
    }

    inherits(YTS, App.Providers.Generic);

    var format = function (data) {
        var results = _.chain(data.movies)
            /*
                     .filter(function (movie) {
                     // Filter any 3D only movies
                     return _.any(movie.torrents, function (torrent) {
                     return torrent.quality !== '3D';
                     });
                     })*/
            .map(function (movie) {
                return {
                    type: 'movie',
                    id: movie.id,
                    imdb_id: movie.imdb_code,
                    url: movie.url,
                    title: movie.title,
                    slug: movie.slug,
                    year: movie.year,
                    genre: movie.genres,
                    directors: movie.directors,
                    cast: movie.cast,
                    rating: movie.rating,
                    runtime: movie.runtime,
                    image: movie.small_cover_image,
                    cover: movie.large_cover_image, //movie.medium_cover_image,
                    backdrop: movie.background_image,
                    synopsis: movie.synopsis,
                    //trailer: 'https://www.youtube.com/watch?v=' + movie.yt_trailer_code || false,
                    trailer: movie.trailer || false,
                    google_video: movie.google_video || false,
                    certification: movie.mpa_rating,
                    torrents: _.reduce(movie.torrents, function (torrents, torrent) {
                        if (torrent.quality !== '3D') {
                            torrents[torrent.quality] = {
                                url: torrent.url,
                                magnet: require('parse-torrent').toMagnetURI({
                                    infoHash: torrent.hash,
                                    'tr': [
                                        'udp://p4p.arenabg.com:1337',
                                        'udp://9.rarbg.me:2710/announce',
                                        'udp://9.rarbg.me:2710/announce',
                                        'udp://glotorrents.pw:6969/announce',
                                        'udp://torrent.gresille.org:80/announce',
                                        'udp://tracker.internetwarriors.net:1337',
                                        'udp://tracker.opentrackr.org:1337/announce',
                                        'udp://tracker.leechers-paradise.org:696931622A',
                                        'udp://open.demonii.com:1337',
                                        'udp://tracker.coppersurfer.tk:6969',
                                        'udp://tracker.leechers-paradise.org:6969',
                                        'udp://exodus.desync.com:696931622A',
                                    ]
                                }),
                                quality_type: torrent.quality_type,
                                size: torrent.size_bytes,
                                filesize: torrent.size,
                                seed: torrent.seeds,
                                peer: torrent.peers
                            };
                        }
                        return torrents;
                    }, {})
                };
            }).value();

        /*if (Settings.translateSynopsis && App.Trakt.authenticated) {

            results.forEach(function (m) {
                App.Trakt.movies.translations(m.imdb_id, Settings.language).then(function (trakt_data) {
                    if (trakt_data[0] && trakt_data[0].overview && trakt_data[0].overview !== '') {
                        m.synopsis = trakt_data[0].overview;
                        m.title = trakt_data[0].title;
                    }
                }).catch(function (error) {
                    win.error('Error getting synopsis from TraktTv', error);
                });
            });
        }*/

        return {
            results: Common.sanitize(results),
            hasMore: true //data.movie_count > data.page_number * data.limit
        };
    };

    YTS.prototype.extractIds = function (items) {
        return _.pluck(items.results, 'imdb_id');
    };

    YTS.prototype.random = function () {
        var defer = Q.defer();
        var options = {
            uri: Settings.ytsAPI.url + 'api/v2/get_random_movie.json',
            json: true,
            timeout: 10000
        };

        var req = jQuery.extend(true, {}, Settings.ytsAPI.url, options);
        win.info('Request to YTSApi for random movie', req.uri);
        request(req, function (err, res, data) {
            if (err || res.statusCode >= 400 || (data && !data.data)) {
                win.warn('YTS API endpoint \'%s\' failed.', Settings.ytsAPI.url);
                return defer.reject(err || 'Status Code is above 400');
            } else if (!data || data.status === 'error') {
                err = data ? data.status_message : 'No data returned';
                return defer.reject(err);
            } else {
             var options = {
                    uri: Settings.ytsAPI.url + 'api/v2/movie_details.json?movie_id=' + data.data.id, //'api/v2/movie_details.json' + '?movie_id=' + require('mathjs').randomInt(1, parseInt(data.data.movie_count)),
                    json: true,
                    timeout: 10000
                };
                win.info('Request to YTSApi for real random movie', options.uri);
                request(jQuery.extend(true, {}, Settings.ytsAPI.url, options), function (err, res, data) {
                    if (err || res.statusCode >= 400 || (data && !data.data)) {
                        win.warn('YTS API endpoint \'%s\' failed.', Settings.ytsAPI.url);
                        return defer.reject(err || 'Status Code is above 400');
                    } else if (!data || data.status === 'error') {
                        err = data ? data.status_message : 'No data returned';
                        return defer.reject(err);
                    } else {
                        if (data.data.movie.id === 0) {
                            win.warn('Invalid movie data returned', data);
                            return defer.reject('Invalid movie data returned');
                        }
                        return defer.resolve(Common.sanitize(data.data));
                    }
                });
            }
        });
        return defer.promise;
    };

    YTS.prototype.fetch = function (filters) {

        var ytsAPI = Settings.ytsAPI;

        var params = {
            sort_by: 'seeds',
            limit: 50,
            with_rt_ratings: true
        };

        if (filters.page) {
            params.page = filters.page;
        }

        if (filters.keywords) {
            params.query_term = filters.keywords;
        }

        if (filters.genre && filters.genre !== 'All') {
            params.genre = filters.genre;
        }

        if (filters.order === 1) {
            params.order_by = 'asc';
        }

        if (filters.sorter && filters.sorter !== 'popularity') {
            switch (filters.sorter) {
                case 'last added':
                    params.sort_by = 'date_added';
                    break;
                case 'IMDB rating':
                    params.sort_by = 'rating_imdb';
                    break;
                case 'IMDB votes':
                    params.sort_by = 'votes_imdb';
                    break;
                case 'Kinopoisk rating':
                    params.sort_by = 'rating_kp';
                    break;
                case 'Kinopoisk votes':
                    params.sort_by = 'votes_kp';
                    break;
                case 'downloads':
                    params.sort_by = 'download_count';
                    break;
                default:
                    params.sort_by = filters.sorter;
            }
        }

        if (Settings.movies_quality !== 'all') {
            params.quality = Settings.movies_quality;
        }

        var defer = Q.defer();

        var options = {
            uri: ytsAPI.url + 'api/v2/list_movies.json',
            qs: params,
            json: true,
            timeout: 10000
        };
        var req = jQuery.extend(true, {}, ytsAPI, options);
        win.info('Request to YTSApi for movies', req.uri);
        request(req, function (err, res, data) {
            if (err || res.statusCode >= 400 || (data && !data.data)) {
                win.warn('YTS API endpoint \'%s\' failed.', req.uri);
                return defer.reject(err || 'Status Code is above 400');
            } else if (!data || data.status === 'error') {
                err = data ? data.status_message : 'No data returned';
                return defer.reject(err);
            } else {
                return defer.resolve(format(data.data));
            }
        });

        return defer.promise;
    };

    YTS.prototype.detail = function (torrent_id, old_data) {
        return Q(old_data);
    };

    App.Providers.Yts = YTS;

})(window.App);
