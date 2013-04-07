function Game() {
  // theta, phi.
  this.position = [Math.random() * Math.PI * 2, 0];
  this.started = false;

  this.setupStreams();
};

/**
 * Set up BinaryJS stream.
 */
Game.prototype.setupStreams = function() {
  var client = new BinaryClient('ws://localhost:9000');

  var self = this;
  client.on('open', function() {
    self.stream = client.createStream();
    self.stream.on('data', self.updateOpponent);
  });
};

/**
 * Updates opponent's location in map.
 */
Game.prototype.updateOpponent = function(data) {
  // TODO
  console.log(data);
};

/**
 * Shows error message and aborts.
 */
Game.prototype.error = function(msg) {
  // TODO
  console.log('ERROR', msg);
};

/**
 * Start a game.
 */
Game.prototype.start = function() {
  // TODO: CANNOT start until this.stream exists.
  console.log('Start game');
  this.started = true;
};
