/** ====== USER ====== */
function User(game, user) {
  this.email = user.email;
  this.highscore = user.highscore || 0;

  this.game = game;
  this.game.user = this;

  if (this.email) {
    this.setGravatarImage();
  }
};


/**
 * Takes email address and optional DOM element $d and attaches the gravatar
 * image associated with email to $d.
 */
User.prototype.setGravatarImage = function($d) {
  if (!this.url) {
    var gravatar_url = 'http://www.gravatar.com/avatar/';
    var gravatar_params = '?r=pg&d=retro';

    // Trim whitespace and lowercase.
    this.email = this.email.replace(/(^\s*)|(\s*$)/g, '').toLowerCase();
    var hash = md5(this.email);

    this.url = gravatar_url + hash + gravatar_params;
  }

  if ($d && $d.length) {
    var $img = $('<img>').attr('src', this.url);
    $d.html($img);
  }

  // We're ready to start.
  this.game.start();
};

/**
 * Force start as anon.
 * Get unique anon id from server.
 */
User.prototype.startAnyways = function() {
  var self = this;
  $.get('/id', function(id) {
    if (id) {
      self.game.start();
    } else {
      self.game.error('Server unavailable, try refreshing.');
    }
  });
};

/**
 * Email entered, get info from server and start.
 */
User.prototype.startWithEmail = function(email) {
  this.email = email;
  this.setGravatarImage();

  var self = this;
  $.get('/existing/' + encodeURIComponent(this.email), function(info) {
    if (info) {
      self.highscore = info.highscore;
    }
    self.game.start()
  })
};

/**
 * Call when a user dies so if there is a new highscore it is posted to the
 * server.
 */
User.prototype.die = function(score) {
  if (score > this.highscore) {
    this.highscore = score;
    $.post('/score', this.toJSON());
  };

  this.storeInLocalStorage();
};

/**
 * Store user info in localStorage for easy next play.
 * TODO: also allow overriding of this.
 */
User.prototype.storeInLocalStorage = function() {
  // TODO
  console.log('storeInLocalStorage', this.toJSON());
};

/**
 * Returns JSON with properties of User.
 */
User.prototype.toJSON = function() {
  return {
    email: this.email,
    highscore: this.highscore,
  };
};
