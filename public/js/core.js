function Core(radius, subdivs, sq_dim) {
  this.group = new THREE.Object3D();
  this.ocl_group = new THREE.Object3D();
  this.iso_points = (new THREE.IcosahedronGeometry(1,subdivs)).vertices;
  this.radius = radius;
  this.sq_dim = sq_dim;
  this.cones = [];

  for (var i = 0; i < this.iso_points.length; i++) {
    var sq_cone = new SquareCone(this.radius, this.sq_dim, this.iso_points[i]);
    this.group.add(sq_cone.group);
    this.ocl_group.add(sq_cone.ocl_group);
    this.cones.push(sq_cone);
  }
}

Core.prototype.stepRotation = function(theta) {
  var mat = new THREE.Matrix4();
  mat.makeRotationY(theta);
  console.log(mat);
  this.group.applyMatrix(mat);
  this.ocl_group.applyMatrix(mat);
  game.playerMoved();
}

Core.prototype.setRotation = function(theta) { 
  var mat = new THREE.Matrix4();
  mat.makeRotationY(theta);
  console.log(mat);
  this.group.matrix = new THREE.Matrix4();
  this.group.applyMatrix(mat);
  this.ocl_group.matrix = new THREE.Matrix4();
  this.ocl_group.applyMatrix(mat);
  game.playerMoved();
}

Core.prototype.squareCenters = function() {
  var square_center_group = new THREE.Object3D();
  var test_material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
  for (var i = 0; i < this.iso_points.length; i++) {
    var cur_point = this.iso_points[i].clone().normalize()
      .multiplyScalar(this.radius);
    var cube_geo = new THREE.CubeGeometry(2,2,2);
    cube = new THREE.Mesh(cube_geo, test_material);
    cube.position.set(cur_point.x, cur_point.y, cur_point.z);
    square_center_group.add(cube);
  }
  return square_center_group;
}

Core.prototype.getClosestConeGroup = function(pos) {
  //project to sphere
  var sph_pos = pos.clone().normalize();
  var to_iso_pt_space = new THREE.Matrix4();
  to_iso_pt_space.getInverse(this.group.matrix);
  sph_pos.applyMatrix4(to_iso_pt_space);
  sph_pos.normalize();
  
  //distance on sphere is given by dot product
  //so sort by the distances to appropriate iso points
  //
  var dist_cone_grps = this.cones.sort(function(x,y) {
    return Math.acos(x.geometry.iso_point.dot(sph_pos)) 
    - Math.acos(y.geometry.iso_point.dot(sph_pos))});
  dist_cone_grps[0].geometry.material = new THREE.MeshBasicMaterial({color:0xffffff});
  return dist_cone_grps[0];
}
