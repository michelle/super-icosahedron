function Game() {
  // theta, phi.
  this.started = false;
  this.boundKeyLoop = this.keyLoop.bind(this);
  this.boundStreamPosition = this.streamPosition.bind(this);

  startDancer(0);

  this.setupStreams();

  var player_geo = new THREE.CubeGeometry(10,10,10);
  var occ_player_geo = new THREE.CubeGeometry(10,10,10);
  var glow_player_geo = new THREE.CubeGeometry(10,10,10);

  var texture;
  if (this.user && this.user.email) {
    texture = THREE.ImageUtils.loadTexture(User.getGravatarUrl(this.user.email));
  }
  this.player_mesh = new THREE.Mesh(player_geo,
        new THREE.MeshLambertMaterial( {color: 0xffffff, 
          map: texture ? texture : null, side: THREE.BackSide }));
  this.glow_player_mesh = new THREE.Mesh(glow_player_geo,
      new THREE.MeshBasicMaterial( {color: 0xffffff, 
        map: texture ? texture : null, side: THREE.BackSide }));
  this.occ_player_mesh = new THREE.Mesh(occ_player_geo,
      new THREE.MeshBasicMaterial( {color: 0x000000 }));
  this.player_mesh.position.set(0,0,Globals.PLAYER_RADIUS);
  this.glow_player_mesh.position.set(0,0,Globals.PLAYER_RADIUS);
  this.occ_player_mesh.position.set(0,0,Globals.PLAYER_RADIUS);
  this.opponent_group = new THREE.Object3D();

  this.opponent_material = new THREE.MeshLambertMaterial( {color: 0x3BB9FF} );
  this.opponent_meshes = {};
  this.occ_opponent_meshes = {};
  this.up_vec = new THREE.Vector3(0,1,0);
  this.left_vec = new THREE.Vector3(-1,0,0);
  this.closest_cone_grp = core.getClosestConeGroup(this.player_mesh.position);

  // Hard-coded for now to white.
  this.color_theme = [255, 255, 255];
};

/**
 * Texture existing meshes.
 */
Game.prototype.textureExistingMeshes = function() {
  var texture = THREE.ImageUtils.loadTexture(User.getGravatarUrl(this.user.email));
  this.player_mesh.material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    map: texture
  });
  this.occ_player_mesh.material = new THREE.MeshLambertMaterial({
    color: 0x000000,
    map: texture
  });
  this.glow_player_mesh.material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    map: texture
  });
};

/**
 * Attach key handlers.
 */
Game.prototype.attachKeyListeners = function() {
  var self = this;
  window.addEventListener('keydown', function(e) {
    self.keyState[e.keyCode || e.which] = true;
  });
  window.addEventListener('keyup', function(e) {
    self.keyState[e.keyCode || e.which] = false;
  });
};

/**
 * Handle WASD, arrow keys.
 */
Game.prototype.keyLoop = function() {
  var move_amount = 0.03;
  if (this.keyState[65] || this.keyState[37]) {
    this.playerMoveLeft(move_amount);
  } else if (this.keyState[87] || this.keyState[38]) {
    this.playerMoveUp(move_amount);
  } else if (this.keyState[68] || this.keyState[39]) {
    this.playerMoveRight(move_amount);
  } else if (this.keyState[83] || this.keyState[40]) {
    this.playerMoveDown(move_amount);
  }
  if (this.closest_cone_grp) {
    if (this.closest_cone_grp.up) {
      this.end();
    }
  }
  if (this.started) {
    this.t0 = setTimeout(this.boundKeyLoop, 10);
  }
};

/**
 * Stream current position.
 */
Game.prototype.streamPosition = function() {
  var pos = this.player_mesh.position;
  this.stream.write({
    id: this.user.email,
    coordinates: [pos.x, pos.y, pos.z],
    song: parseInt($audio.attr('data-song')),
    playback: $audio[0].currentTime
  });
  if (this.t1) {
    this.t1 = setTimeout(this.boundStreamPosition, 500);
  }
};

/**
 * Set up BinaryJS stream.
 */
Game.prototype.setupStreams = function() {
  var client = new BinaryClient('ws://10.22.34.234:9000');

  var self = this;
  client.on('open', function() {
    self.stream = client.createStream();
    self.stream.on('data', self.updateOpponent.bind(self));
    if (self.started) {
      self.streamPosition();
    }
  });
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
  this.score = 0;

  this.keyState = {};
  this.attachKeyListeners();
  this.keyLoop();
  if (this.stream) {
    this.streamPosition();
  }
  this.i0 = setInterval(this.updateScore.bind(this), 1000);
};

Game.prototype.updateScore = function() {
  this.score += 1;
  $('#myscore').text(this.score);
};

Game.prototype.end = function() {
  // 2 second immunity;
  if (this.started && this.score > 2) {
    this.user.die(this.score);
    vlight.material = new THREE.MeshBasicMaterial({
      color:0xAA0114 });
    clearInterval(this.i0);
    clearTimeout(this.t0);
    clearTimeout(this.t1);
    this.started = false;
  }
};


/**
 * Update a player's position
 */
Game.prototype.playerMoved = function() {
  camera.position = (this.player_mesh.position.clone().normalize()
      .multiplyScalar(Globals.CAMERA_DIST));
  camera.up = this.up_vec;
  camera.lookAt(new THREE.Vector3(0,0,0));
  camera.updateProjectionMatrix();

  this.glow_player_mesh.position = this.player_mesh.position;
  this.occ_player_mesh.position = this.player_mesh.position;

  light.position = this.player_mesh.position.clone().normalize()
    .multiplyScalar(Globals.LIGHT_DIST);

  this.closest_cone_grp = core.getClosestConeGroup(this.player_mesh.position);
}
Game.prototype.playerMoveUp = function(amount) {
  var rot_mat = new THREE.Matrix4();
  rot_mat.makeRotationAxis(this.left_vec,amount);
  this.player_mesh.position.applyMatrix4(rot_mat);
  var n_up_vec = new THREE.Vector3();
  n_up_vec.crossVectors(this.player_mesh.position, this.left_vec);
  n_up_vec.normalize();
  if (n_up_vec.dot(this.up_vec) < 0) {
    n_up_vec = n_up_vec.multiplyScalar(-1);
  }
  this.up_vec = n_up_vec;

  this.playerMoved();

}

Game.prototype.playerMoveDown = function(amount) {
  this.playerMoveUp(-amount);
}

Game.prototype.playerMoveRight = function(amount) {
  var rot_mat = new THREE.Matrix4();
  rot_mat.makeRotationAxis(this.up_vec,amount);
  this.player_mesh.position.applyMatrix4(rot_mat);
  var n_left_vec = new THREE.Vector3();
  n_left_vec.crossVectors(this.player_mesh.position, this.up_vec);
  n_left_vec.normalize();
  if (n_left_vec.dot(this.left_vec) < 0) {
    n_left_vec = n_left_vec.multiplyScalar(-1);
  }
  this.left_vec = n_left_vec;

  this.playerMoved();
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
      var opponent_geometry = new THREE.CubeGeometry(4,4,4);
      var occ_opponent_geometry = new THREE.CubeGeometry(4,4,4);
      this.opponent_meshes[id] = new THREE.Mesh(opponent_geometry,
          this.opponent_material);
      this.occ_opponent_meshes[id] = new THREE.Mesh(occ_opponent_geometry,
          new THREE.MeshBasicMaterial({color: 0x000000}));
      scene.add(this.opponent_meshes[id]);
      oclscene.add(this.occ_opponent_meshes[id]);
    }

    this.opponent_meshes[id].position.set(coord[0], coord[1], coord[2]);
    this.occ_opponent_meshes[id].position.set(coord[0], coord[1], coord[2]);
    if (!this.song_synced && data.playback > 3) {
      this.updateMusic(data.song, Math.floor(data.playback));
      this.song_synced = true;
    }
  } else if (data.type === 'highscores') {
    this.updateHighscores(data);
  }
};

/** Update high scores with new high scores. */
Game.prototype.updateHighscores = function(data) {
  console.log('updateHighscores');
  $('#highscores').empty();
  var hs = data.highscores;
  for (var i = 0, ii = hs.length; i < ii; i += 1) {
    var $s = $('<div></div>').addClass('hs');
    $s.text(hs[i].email);
    $s.append(hs[i].highscore);
    $('#highscores').append($s);
  }
};

/** Update music with new music. */
Game.prototype.updateMusic = function(song, playback) {
  startDancer(song, playback);
};

/**
 * Kick.
 */
Game.prototype.activateCones = function() {
  for (var i = 0; i < 5; i += 1) {
    var cone = core.cones[Math.floor(Math.random() * (core.cones.length - 1))];
    cone.startTween();

    var info = highscores.pop();
    var email = "";
    if (info) {
      var email = info.email;
    }
    var texture = THREE.ImageUtils.loadTexture(User.getGravatarUrl(email));
    highscores.unshift(info);

    cone.mesh.material = new THREE.MeshLambertMaterial({
        color: parseInt('0x' + Globals.COLORS[Math.floor(Math.random() * Globals.COLORS.length)], 16)
      , map: texture
    });
  }

  this.brightenBackground();
};

/**
 * Decay.
 */
Game.prototype.restCones = function() {
  // TODO
  this.dimBackground();
};

/**
 * Brighten background color.
 */
Game.prototype.brightenBackground = function() {
  $('#container').stop().animate({
    'backgroundColor':  this.randomColor([0,0,0])
  }, 500);
};

/**
 * Darken background color.
 */
Game.prototype.dimBackground = function() {
};

/**
 * Generates random hex color.
 */
Game.prototype.randomColor = function(rgb) {
  function getRandomValue() {
    return Math.floor(Math.random() * (256 + 1));
  }
  var r = getRandomValue();
  var g = getRandomValue();
  var b = getRandomValue();
  var color_theme = rgb || this.color_theme;

  r = (r + color_theme[0]) / 2;
  g = (g + color_theme[1]) / 2;
  b = (b + color_theme[2]) / 2;

  r = Math.floor(r);
  g = Math.floor(g);
  b = Math.floor(b);

  var hexstring = r.toString(16) + g.toString(16) + b.toString(16);
  hexstring = rgb ? '#' + hexstring : '0x' + hexstring;
  return rgb ? hexstring : parseInt(hexstring, 16);
};
