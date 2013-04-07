function Core(radius, subdivs, sq_dim) {
  this.group = new THREE.Object3D();
  this.iso_points = (new THREE.IcosahedronGeometry(1,subdivs)).vertices;
  console.log(this.iso_points);
  this.radius = radius;
  this.sq_dim = sq_dim;
  this.cones = [];

  for (var i = 0; i < this.iso_points.length; i++) {
    var sq_cone = new SquareCone(this.radius, this.sq_dim, this.iso_points[i]);
    this.group.add(sq_cone.group);
    this.cones.push(sq_cone.mesh);
  }
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
  
  //distance on sphere is given by dot product
  //so sort by the distances to appropriate iso points
  //
  var dist_cone_grps = this.group.children.sort(function(x,y) {
    return Math.acos(x.children[0].geometry.iso_point.dot(sph_pos)) 
    - Math.acos(y.children[0].geometry.iso_point.dot(sph_pos))});
  return dist_cone_grps[0];
}
