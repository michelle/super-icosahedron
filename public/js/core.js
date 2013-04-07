function SquareCone(length, size, iso_point) {
  THREE.Geometry.call(this);

  this.vertices = [
    new THREE.Vector3(0,0,0),
    new THREE.Vector3(-size, size, length),
    new THREE.Vector3(-size, -size, length),
    new THREE.Vector3(size, -size, length),
    new THREE.Vector3(size, size, length)
      ];


  this.faces = [
    new THREE.Face3(0,1,4),
    new THREE.Face3(0,2,1),
    new THREE.Face3(0,4,3),
    new THREE.Face3(0,3,2),
    new THREE.Face3(1,2,3),
    new THREE.Face3(1,3,4)
      ];
  this.computeCentroids();
  this.computeFaceNormals();
  this.mergeVertices();
  this.iso_point = iso_point.clone().normalize();
}

SquareCone.prototype = Object.create( THREE.Geometry.prototype );

function Core(radius, subdivs, sq_dim) {
  this.group = new THREE.Object3D();
  this.iso_points = (new THREE.IcosahedronGeometry(1,subdivs)).vertices;
  console.log(this.iso_points);
  this.radius = radius;
  this.sq_dim = sq_dim;
  this.cones = [];

  for (var i = 0; i < this.iso_points.length; i++) {
    var n_g = new THREE.Object3D();
    var cur_iso_point = this.iso_points[i].clone().normalize();
    var cur_cone = new THREE.Mesh(new SquareCone(this.radius,
          this.sq_dim,cur_iso_point),
          new THREE.MeshLambertMaterial( { color: 0x00ff00 }));
    n_g.add(cur_cone);
    var theta = Math.atan2(cur_iso_point.x, cur_iso_point.z);
    var phi = Math.PI/2 - Math.acos(-cur_iso_point.y);

    var m1 = new THREE.Matrix4();
    var m2 = new THREE.Matrix4();
    m1.makeRotationY(theta);
    m2.makeRotationX(phi);

    var m = new THREE.Matrix4();
    m.multiplyMatrices(m1,m2);

    n_g.applyMatrix(m);
    this.group.add(n_g);
    this.cones.push(cur_cone);
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
