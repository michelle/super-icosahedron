/** ====== MUSIC UTILS ====== */
function startDancer(song, time) {
  if (!!window.dancer) {
    dancer.pause();
    dancer = null;
    $audio = null;
  }

  window.dancer = new Dancer();
  window.$audio = $('<audio></audio>');
  $audio.attr('src', song);

  // Seek to time in track.
  if (time) {
    $audio.bind('canplay', function() {
      this.currentTime = time;
    });
  }

  dancer.load($audio[0]);
  dancer.play();

  var kick = dancer.createKick({
    threshold: 0.05,
    onKick: function() {
      game.activateCones();
    },
    offKick: function() {
      game.restCones();
    }
  });
  kick.on();
};
