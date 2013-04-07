function Game() {
  // theta, phi.
  this.started = false;

  startDancer(Globals.MUSIC_DIR + Globals.MUSIC[0]);

  this.setupStreams();

  this.player_mesh = new THREE.Mesh(new THREE.CubeGeometry(10,10,10),
        new THREE.MeshBasicMaterial( {color: 0xffffff }));
  this.player_mesh.position.set(Globals.OUTER_RADIUS,0,0);
  this.opponent_group = new THREE.Object3D();

  this.opponent_geometry = new THREE.CubeGeometry(4,4,4);
  this.opponent_material = new THREE.MeshBasicMaterial( {color: 0x000000} );
  this.opponent_meshes = {};
  this.up_vec = new THREE.Vector3(0,1,0);
  this.left_vec = new THREE.Vector3(-1,0,0);

  $(document).keydown(handleKeys);
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

/**
 * Update a player's position
 */
Game.prototype.playerMoveUp = function(amount) {
  var rot_mat = new THREE.Matrix4();
  rot_mat.makeRotationAxis(this.left_vec,amount);
  this.player_mesh.position.applyMatrix4(rot_mat);
  this.up_vec.crossVectors(this.player_mesh.position, this.left_vec);
  this.up_vec.normalize();
}

Game.prototype.playerMoveDown = function(amount) {
  this.playerMoveUp(-amount);
}

Game.prototype.playerMoveRight = function(amount) {
  var rot_mat = new THREE.Matrix4();
  rot_mat.makeRotationAxis(this.up_vec,amount);
  this.player_mesh.position.applyMatrix4(rot_mat);
  this.left_vec.crossVectors(this.player_mesh.position, this.up_vec);
  this.left_vec.normalize();
}

Game.prototype.playerMoveLeft = function(amount) {
  this.playerMoveRight(-amount);
}

Game.prototype.getPlayerPosition = function() {
  return this.player_mesh.position;
}

/**
 * Update opponent's position
 */
Game.prototype.updateOpponent = function(data) {
  if (data.type === 'opponent') {
    var coord = data.coordinates;
    var id = data.id;
    if (!this.opponent_meshes[id]) {
      this.opponent_meshes[id] = new THREE.Mesh(this.opponent_geometry,
          this.opponent_material);
      scene.add(this.opponent_meshes[id]);
    }

    this.opponent_meshes[id].position.set(coord[0], coord[1], coord[2]);
  } else if (data.type === 'highscores') {
    this.updateHighscores(data);
  } else if (data.type === 'music') {
    this.updateMusic(data.song);
  }
};

/** Update high scores with new high scores. */
Game.prototype.updateHighscores = function(data) {
  console.log('updateHighscores');
  // TODO
};

/** Update music with new music. */
Game.prototype.updateMusic = function(song) {
  startDancer(song);
};

/**
 * Kick.
 */
Game.prototype.activateCones = function() {
  core.cones[Math.floor(Math.random() * (core.cones.length - 1))].material = new THREE.MeshLambertMaterial({ color: 0x000000 });
};

/**
 * Decay.
 */
Game.prototype.restCones = function() {
  // TODO
};
