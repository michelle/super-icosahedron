function SquareCone(length, size) {
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
}

SquareCone.prototype = Object.create( THREE.Geometry.prototype );

function Core(radius, subdivs, sq_dim) {
  this.group = new THREE.Object3D();
  this.iso_points = (new THREE.IcosahedronGeometry(1,subdivs)).vertices;
  this.radius = radius;

  for (var i = 0; i < this.iso_points.length; i++) {
    var z_axis = new THREE.Vector3(0,0,1);
    var n_g = new THREE.Object3D();
    var test_material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    var squarecone_geo = new SquareCone(100,10);
    var shape = new THREE.Mesh(squarecone_geo, test_material);
    n_g.add(shape);
    var mat = new THREE.Matrix4();
    var rot_axis = new THREE.Vector3();
    rot_axis.crossVectors(z_axis, this.iso_points[i].normalize());
    rot_axis.normalize();

    var rot_angle = z_axis.dot(this.iso_points[i]);


    mat.makeRotationAxis(rot_axis, rot_angle);
    n_g.applyMatrix(mat);
    this.group.add(n_g);
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
