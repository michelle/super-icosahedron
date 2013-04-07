/** ====== MUSIC UTILS ====== */
function startDancer(song, time) {
  if (song >= Globals.MUSIC.length) {
    song = 0;
  }

  var song_path = Globals.MUSIC_DIR + Globals.MUSIC[song];

  if (!!window.dancer) {
    dancer.pause();
    dancer = null;
    $audio = null;
  }

  window.dancer = new Dancer();
  window.$audio = $('<audio></audio>');
  $audio.attr('src', song_path);
  $audio.attr('data-song', song);

  // Seek to time in track.
  if (time) {
    $audio.bind('canplay', function() {
      this.currentTime = time;
    });
  }
  $audio[0].addEventListener('ended', function() {
    startDancer(song + 1);
  });

  dancer.load($audio[0]);
  dancer.play();

  var kick = dancer.createKick({
    threshold: 0.1,
    onKick: function() {
      game.activateCones();
    },
    offKick: function() {
      game.restCones();
    }
  });
  kick.on();
};
