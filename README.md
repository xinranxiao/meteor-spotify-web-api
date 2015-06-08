# meteor-spotify-web-api
A meteor wrapper for Spotify's web API via the wonderful [spotify-web-api-node](https://github.com/thelinmichael/spotify-web-api-node).

Check out an example (examples/1 folder) here: [http://spotify-web-api-example.meteor.com](http://spotify-web-api-example.meteor.com)

## Installation
* `meteor add xinranxiao:spotify-web-api`

## Usage

1) Setup your clientId + clientSecret, either via the `service-configuration` package or directly through the api.

```javascript
// This example is via `service-configuration`
ServiceConfiguration.configurations.update(
  { "service": "spotify" },
  {
    $set: {
      "clientId": "<your clientId>",
      "secret": "<your secret>"
    }
  },
  { upsert: true }
);
```

2) Get an oauth `access_token`, either through [`xinranxiao:spotify`](https://github.com/xinranxiao/meteor-spotify), [`xinranxiao:accounts-spotify`](https://github.com/xinranxiao/meteor-accounts-spotify), or directly through this API (refer [here](https://github.com/thelinmichael/spotify-web-api-node).
) for how).

```javascript
// This example is via `xinranxiao:spotify`
var options = {
  showDialog: true, // Force the user to approve the app again if they’ve already done so.
  requestPermissions: ['user-read-email'] // Spotify access scopes.
};

Spotify.requestCredential(options, function(accessToken) {
  console.log(accessToken);
});
```

2) Make a new instance of the API and use it! Currently only available on the server.

```javascript
var spotifyApi = new SpotifyWebApi();

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId : 'fcecfc72172e4cd267473117a17cbd4d',
  clientSecret : 'a6338157c9bb5ac9c71924cb2940e1a7',
  redirectUri : 'http://www.example.com/callback'
});

```

```javascript
// Get Elvis' albums `synchronously` on the server.
var response = spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE');
console.log(response);

// Or use a classic callback approach. 
// Note that the OPTIONS parameter is always required for this format!
spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE', {}, function(err, result) {
  console.log(result);
});
```

3) Your `access_token` will expire at some point.
```javascript
// Just refresh the token and manually deal with the response.
// response contains the new access_token and the new expire_in
var response = spotifyApi.refreshAccessToken();

// Refresh the access token, update the current instance with the token, 
// and update the user's credentials as well.
spotifyApi.refreshAndUpdateAccessToken(); // All done here.
```

Currently, this package automatically sets the `clientId` and `clientSecret` if you have `service-configuration` configured. It also sets `accessToken` and `refreshToken` if you have a user connected with Spotify via `xinranxiao:accounts-spotify` (this won't work if you have your code inside a publication).

## Contribution

If you have any problems with or suggestions for this package, please create a new issue.
