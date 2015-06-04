SpotifyWebApi = function(config) {
  config = config || {};
  var SpotifyWebApi = Npm.require('spotify-web-api-node');
  var api = new SpotifyWebApi();

  // Set the access token + refresh token (either provided, or retrieved from account)
  setAccessTokens(api, config);

  // Whitelist functions to be wrapped. This is ugly -- any alternatives?
  SpotifyWebApi.whitelistedFunctionNames = ['getCredentials','resetCredentials','setClientId','setClientSecret',
    'setAccessToken','setRefreshToken','setRedirectURI','getRedirectURI','getClientId','getClientSecret',
    'getAccessToken','getRefreshToken','resetClientId','resetClientSecret','resetAccessToken','resetRefreshToken',
    'resetRedirectURI','getTrack','getTracks','getAlbum','getAlbums','getArtist','getArtists','searchAlbums',
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
      console.log('wrap');
      api[functionName] = Meteor.wrapAsync(fn, api);
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
        api.setRefreshToken(currUser.services.spotify.refreshToken);
      }
    } else {
      // No token specified
      throw new Error("No accessToken found. Please provide an accessToken or login with xinranxiao:accouns-spotify");
    }
  }
}