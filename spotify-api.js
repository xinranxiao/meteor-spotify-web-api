SpotifyWebApi = function(config) {
  var SpotifyWebApi = Npm.require('spotify-web-api');
  var api = new SpotifyWebApi();

  // Set the access token + refresh token (either provided, or retrieved from account)
  setAccessTokens(api, config);

  // Wrap all the functions to be able to be called synchronously on the server.
  // NOTE: this assumes are the functions are on the first level e.g. 'list.x' vs 'list.x.y'
  _.each(api, function(value, key, list) {
    // If the value is a function, wrap it.
    if (_.isFunction(value)) {
      list[key] = Meteor.wrapAsync(value, list);
    }
  });

  return api;
};

var setAccessTokens = function(api, config) {
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
        api.setRefreshToken(services.spotify.refreshToken);
      }
    } else {
      // No token specified
      throw new Error("No accessToken found. Please provide an accessToken or login with xinranxiao:accouns-spotify");
    }
  }
}