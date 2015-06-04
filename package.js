Package.describe({
  name: 'xinranxiao:spotify-web-api',
  version: '1.0.0',
  summary: 'A wrapper for the Spotify Web API',
  git: 'https://github.com/xinranxiao/meteor-spotify-web-api.git',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');

  api.use('service-configuration', ['server']);
  api.use(['underscore'], ['client', 'server']);

  api.imply('service-configuration', ['server']);

  api.export('SpotifyWebApi');

  api.addFiles('spotify-api.js', 'server');
});

Npm.depends({ 'spotify-web-api-node': '2.0.2'});
