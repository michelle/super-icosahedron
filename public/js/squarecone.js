function SquareCone(length, size, iso_point) {
  this.geometry = new SquareConeGeometry(length, size, iso_point);
  this.ocl_geometry = new SquareConeGeometry(length, size, iso_point);
  this.length = length;
  this.size = size;

  this.mesh = new THREE.Mesh(this.geometry,
      new THREE.MeshLambertMaterial( { color: 0x00ff00 }));
  this.ocl_mesh = new THREE.Mesh(this.ocl_geometry,
      new THREE.MeshBasicMaterial( { color: 0x000000 }));

  this.group = new THREE.Object3D();
  this.ocl_group = new THREE.Object3D();
  this.group.add(this.mesh);
  this.ocl_group.add(this.ocl_mesh);

  this.placement_matrix = new THREE.Matrix4();
  var m1 = new THREE.Matrix4();
  var m2 = new THREE.Matrix4();
  var theta = Math.atan2(iso_point.x, iso_point.z);
  var phi = Math.PI/2 - Math.acos(-iso_point.y);
  m1.makeRotationY(theta);
  m2.makeRotationX(phi);
  this.placement_matrix.multiplyMatrices(m1,m2);

  // how the heck do i set a matrix?!
  this.group.matrix = new THREE.Matrix4();
  this.group.applyMatrix(this.placement_matrix);
  this.ocl_group.matrix = new THREE.Matrix4();
  this.ocl_group.applyMatrix(this.placement_matrix);
}

SquareCone.prototype.setScale = function (s) {
  this.group.matrix = new THREE.Matrix4();
  this.group.applyMatrix(this.placement_matrix);
  this.ocl_group.matrix = new THREE.Matrix4();
  this.ocl_group.applyMatrix(this.placement_matrix);
  var m = new THREE.Matrix4();
  var min_s = 1;
  var max_s = Globals.OUTER_RADIUS/Globals.INNER_RADIUS;
  var s_range = max_s - min_s;
  var upd_s = s*s_range + min_s;
  m.makeScale(upd_s, upd_s, upd_s);
  this.group.applyMatrix(m);
  this.ocl_group.applyMatrix(m);
}


function SquareConeGeometry(length, size, iso_point) {
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

SquareConeGeometry.prototype = Object.create( THREE.Geometry.prototype );

