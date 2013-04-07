/** ====== USER ====== */
function User(game, user) {
  this.email = user.email;
  this.highscore = user.highscore || 0;

  this.game = game;
  this.game.user = this;

  if (this.email) {
    this.setGravatarImage();
  } else {
    this.promptEmail();
  }
};


/**
 * Takes email address and optional DOM element $d and attaches the gravatar
 * image associated with email to $d.
 */
User.prototype.setGravatarImage = function() {
  if (!this.url) {
    var gravatar_url = 'http://www.gravatar.com/avatar/';
    var gravatar_params = '?r=pg&d=retro';

    // Trim whitespace and lowercase.
    this.email = this.email.replace(/(^\s*)|(\s*$)/g, '').toLowerCase();
    var hash = md5(this.email);

    this.url = gravatar_url + hash + gravatar_params;
  }

  this.game.textureExistingMeshes();

  this.storeInLocalStorage();

  // We're ready to start.
  this.game.start();
};

User.getGravatarUrl = function(email) {
  var gravatar_url = 'http://www.gravatar.com/avatar/';
  var gravatar_params = '?r=pg&d=retro';

  // Trim whitespace and lowercase.
  email = email.replace(/(^\s*)|(\s*$)/g, '').toLowerCase();
  var hash = md5(email);

  return gravatar_url + hash + gravatar_params;
};

/**
 * Force start as anon.
 * Get unique anon id from server.
 */
User.prototype.startAnyways = function() {
  var self = this;
  $.get('/id', function(id) {
    if (id) {
      self.email = id;
      self.setGravatarImage();
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
  if (window.localStorage) {
    var info = JSON.stringify(this.toJSON());
    localStorage.setItem('user', info);
  }
};

/**
 * Prompt for email address.
 */
User.prototype.promptEmail = function() {
  var $email = $('<div></div>').attr('id', 'email');
  var $label = $('<label></label>').attr('for', 'emailaddress').text('Use your email to play:');
  var $input = $('<input></input>').attr('required', true).attr('id', 'emailaddress').attr('type', 'text').attr('placeholder', 'example@example.com');

  var self = this;
  var $button = $('<button></button>').text('Start');
  $button.on('click', function() {
    var email;
    if (email = $input.val()) {
      self.startWithEmail(email);
      $email.remove();
    }
  });
  var $override = $('<button></button>').text('Play Anonymously');
  $override.on('click', function() {
    self.startAnyways();
    $email.remove();
  });

  $email.append($label).append($input).append($button).append($override);
  $('#dynamic').append($email);
};

/**
 * Returns JSON with properties of User.
 */
User.prototype.toJSON = function() {
  return {
    email: this.email,
    highscore: this.highscore
  };
};
