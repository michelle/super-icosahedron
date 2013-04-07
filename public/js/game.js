function Game() {
  // theta, phi.
  this.position = [0, 0];
  this.started = false;

  this.setupStreams();

  this.player_mesh = new THREE.Mesh(new THREE.CubeGeometry(10,10,10),
        new THREE.MeshBasicMaterial( {color: 0xffffff }));
  this.updatePlayerPosition([Math.random() * Math.PI * 2, 0]);
  this.opponent_group = new THREE.Object3D();

  this.opponent_geometry = new THREE.CubeGeometry(4,4,4);
  this.opponent_material = new THREE.MeshBasicMaterial( {color: 0x000000} );
  this.opponent_meshes = {};
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
Game.prototype.updatePlayerPosition = function(pos) {
  this.position = pos;
  var theta = this.position[0];
  var phi = this.position[1];
  var cart_coord = new THREE.Vector3(
      Globals.OUTER_RADIUS * Math.sin(theta) * Math.cos(phi),
      Globals.OUTER_RADIUS * Math.sin(theta) * Math.sin(phi),
      Globals.OUTER_RADIUS * Math.cos(theta));
  console.log(cart_coord);
  this.player_mesh.position.set(cart_coord.x, cart_coord.y, cart_coord.z);
};

/**
 * Update opponent's position
 */
Game.prototype.updateOpponent = function(data) {
  if (data.type === 'opponent') {
    var coord = data.coordinates;
    var id = data.id;
    var theta = coord[0];
    var phi = coord[1];
    if (!this.opponent_meshes[id]) {
      this.opponent_meshes[id] = new THREE.Mesh(this.opponent_geometry,
          this.opponent_material);
      scene.add(this.opponent_meshes[id]);
    }

    var cart_coord = new THREE.Vector3(
        Globals.OUTER_RADIUS * Math.sin(theta) * Math.cos(phi),
        Globals.OUTER_RADIUS * Math.sin(theta) * Math.sin(phi),
        Globals.OUTER_RADIUS * Math.cos(theta));

    this.opponent_meshes[id].position.set(cart_coord.x, cart_coord.y, 
        cart_coord.z);
  }

};
