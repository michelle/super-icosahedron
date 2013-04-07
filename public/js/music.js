/** ====== MUSIC UTILS ====== */
function startDancer(song) {
  if (!!window.dancer) {
    dancer.pause();
    dancer = null;
  }

  window.dancer = new Dancer();
  dancer.load({ src: song });
  dancer.play();

  var kick = dancer.createKick({
    onKick: function() {
    }
  });
};
