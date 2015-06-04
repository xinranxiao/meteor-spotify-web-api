var Future = Npm.require("fibers/future");

SpotifyWebApi = function(config) {
  config = config || {};
  var SpotifyWebApi = Npm.require('spotify-web-api-node');
  var api = new SpotifyWebApi();

  // Set the access token + refresh token (either provided, or retrieved from account)
  setAccessTokens(api, config);

  // Create a refresh method that updates everything after the refresh.
  api.refreshAndUpdateAccessToken = function(callback) {
    var response = api.refreshAccessToken();

    if (response.error) {
      callback(response.error, null);
    } else {
      // Update the current API instance
      api.setAccessToken(response.data.body.access_token);

      console.log(response.data.body.access_token);

      // Update the current user (if available)
      if (Meteor.userId()) {
        Meteor.users.update({ _id: Meteor.userId() }, { $set: {
          'services.spotify.accessToken': response.data.body.access_token,
          'services.spotify.expiresAt': (+new Date) + (1000 * response.data.body.expires_in)
        }});
      }

      callback(null, response);
    }
  }

  // Whitelist functions to be wrapped. This is ugly -- any alternatives?
  SpotifyWebApi.whitelistedFunctionNames = ['refreshAndUpdateAccessToken','getTrack','getTracks','getAlbum',
    'getAlbums','getArtist','getArtists','searchAlbums',
    'searchArtists','searchTracks','searchPlaylists','getArtistAlbums','getAlbumTracks','getArtistTopTracks',
    'getArtistRelatedArtists','getUser','getMe','getUserPlaylists','getPlaylist','getPlaylistTracks','createPlaylist',
    'followPlaylist','unfollowPlaylist','changePlaylistDetails','addTracksToPlaylist','removeTracksFromPlaylist',
    'removeTracksFromPlaylistByPosition','replaceTracksInPlaylist','reorderTracksInPlaylist','clientCredentialsGrant',
    'authorizationCodeGrant','refreshAccessToken','createAuthorizeURL','getMySavedTracks','containsMySavedTracks',
    'removeFromMySavedTracks','addToMySavedTracks','followUsers','followArtists','unfollowUsers','unfollowArtists',
    'isFollowingUsers','areFollowingPlaylist','isFollowingArtists','getNewReleases','getFeaturedPlaylists',
    'getCategories','getCategory','getPlaylistsForCategory'];

  // Wrap all the functions to be able to be called synchronously on the server.
  _.each(SpotifyWebApi.whitelistedFunctionNames, function(functionName) {
    var fn = api[functionName];
    if (_.isFunction(fn)) {
      api[functionName] = wrapAsync(fn, api);
    }
  });

  return api;
};

/*
  This is exactly the same as Meteor.wrapAsync except it properly returns the error.
  credit goes to @faceyspacey -- https://github.com/meteor/meteor/issues/2774#issuecomment-70782092
 */
var wrapAsync = function(fn, context) {
  return function (/* arguments */) {
    var self = context || this;
    var newArgs = _.toArray(arguments);
    var callback;

    for (var i = newArgs.length - 1; i >= 0; --i) {
      var arg = newArgs[i];
      var type = typeof arg;
      if (type !== "undefined") {
        if (type === "function") {
          callback = arg;
        }
        break;
      }
    }

    if(!callback) {
      var fut = new Future();
      callback = function(error, data) {
        fut.return({error:  error, data: data});
      };

      ++i;
    }

    newArgs[i] = Meteor.bindEnvironment(callback);
    var result = fn.apply(self, newArgs);
    return fut ? fut.wait() : result;
  };
};

var setAccessTokens = function(api, config) {
  var serviceConfiguration = ServiceConfiguration.configurations.findOne({service: 'spotify'});
  if (!serviceConfiguration) {
    throw new Error("No clientId/secret found. Please configure the `service-configuration` package.");
  }
  api.setClientId(serviceConfiguration.clientId);
  api.setClientSecret(serviceConfiguration.secret);

  if (config.accessToken) {
    api.setAccessToken(config.accessToken);
    if (config.refreshToken) {
      api.setRefreshToken(config.refreshToken);
    }
  } else {
    var currUser = Meteor.user();
    if (currUser && currUser.services && currUser.services.spotify && currUser.services.spotify.accessToken) {
      api.setAccessToken(currUser.services.spotify.accessToken);
      if (currUser.services.spotify.refreshToken) {
        api.setRefreshToken(currUser.services.spotify.refreshToken);
      }
    } else {
      // No token specified
      throw new Error("No accessToken found. Please provide an accessToken or login with xinranxiao:accouns-spotify");
    }
  }
}