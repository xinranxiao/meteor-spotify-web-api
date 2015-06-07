Template.spotify.onRendered(function() {
  // Initialize the typeahead DOM element.
  Meteor.typeahead.inject();

  // We don't have playlists initially.
  Session.set('selectedTracks', []);

  // Get the counts.
  Meteor.call('getFollowerCount', function(err, count) {
    Session.set('followerCount', count);
  });
  Meteor.call('getSavedTracksCount', function(err, count) {
    Session.set('trackCount', count);
  });
  Meteor.call('getSavedPlaylists', function(err, response) {
    console.log(response);
    Session.set('playlistCount', response.total);
    Session.set('currentPlaylists', response.items);
  });
});

Template.spotify.helpers({
  notEmpty: function() {
    return Session.get('selectedTracks') && Session.get('selectedTracks').length > 0;
  },
  displayName: function() {
    if (Meteor.user()) return Meteor.user().profile.display_name;
  },
  getTracks: function (query, sync, callback) {
    // Show loading.
    $('#spotifyTrackSearch').api('set loading');

    Meteor.call('typeaheadTracks', query, {}, function(err, tracks) {
      // Not loading anymore.
      $('#spotifyTrackSearch').api('remove loading');

      // Check for error.
      if (err) {
        $('#spotifyTrackSearch').api('set error');
        alert("Something absolutely terrible happened. Here's some of the nonsense: " + err.toString());
        return;
      }

      // Update the typeahead input field.
      callback(tracks);
    });
  },
  onTrackSelected: function(e, suggestion, dataset) {
    var selectedTracks = Session.get('selectedTracks');
    selectedTracks.push(suggestion);
    Session.set('selectedTracks', selectedTracks);  // Session is only reactive on *set* being called.
  }
});

Template.spotify.events({
  'click #createPlaylistButton': function(e, template) {
    var playlistName = $('#playlistName').val();
    if (playlistName.length <= 0) {
      // Check existence of the playlist name.
      return alert("Set playlist name first!");
    } else {
      // Call method to create the playlist.
      Meteor.call('createPlaylist', Session.get('selectedTracks'), playlistName, function(err, playlist) {
        if (err) {
          alert("Unable to create playlist: " + err);
        } else {
          alert("Playlist created!");

          // Update current playlists.
          var currPlaylists = Session.get('currentPlaylists');
          currPlaylists.push(playlist);
          Session.set('currentPlaylists', currPlaylists);

          // Update playlist count.
          var playlistCount = Session.get('playlistCount');
          Session.set('playlistCount', ++playlistCount);
        }
      });
    }
  },
  'click #resetPlaylistButton': function(e, template) {
    Session.set('selectedTracks', []);
  }
});