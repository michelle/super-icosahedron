/** ====== USER ====== */
function User(email) {
  this.email = email;
};


/**
 * Takes email address and optional DOM element $d and attaches the gravatar
 * image associated with email to $d.
 */
User.prototype.setGravatarImage = function(email, $d) {
  var gravatar_url = 'http://www.gravatar.com/avatar/';
  var gravatar_params = '?r=pg&d=retro';

  // Trim whitespace and lowercase.
  email = email || this.email
  var clean_email = email.replace(/(^\s*)|(\s*$)/g, '').toLowerCase();
  var hash = md5(clean_email);

  this.url = gravatar_url + hash + gravatar_params;

  if ($d && $d.length) {
    var $img = $('<img>').attr('src', this.url);
    $d.html($img);
  }
};
