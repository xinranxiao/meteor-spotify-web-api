Package.describe({
  name: 'xinranxiao:spotify-web-api',
  version: '0.0.1',
  summary: 'A wrapper for the Spotify Web API',
  git: 'https://github.com/xinranxiao/meteor-spotify-web-api.git',
  documentation: 'README.md'
});

Npm.depends({ 'spotify-web-api-node': '2.0.2'});

Package.onUse(function(api) {
  api.versionsFrom('1.0');

  api.use(['underscore'], ['client', 'server']);

  api.export('SpotifyWebApi');

  api.addFiles('spotify-api.js', 'server');
});
