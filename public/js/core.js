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
  this.mergeVertices();
}

SquareCone.prototype = Object.create( THREE.Geometry.prototype );

function Core(radius, subdivs, sq_dim) {

}

function drawIsocahedronPoints(scene, iso_rad) {
  var iso_point = (new THREE.IcosahedronGeometry(1,subdivs)).vertices;
  var test_material = new THREE.MeshBasicMaterial( {color: 0x8888ff} );
  for (var i = 0; i < iso_points.length; i++) {
    var cur_point = iso_points[i].clone().normalize().multiplyScalar(iso_rad);
    console.log(cur_point);
    var cube_geo = new THREE.CubeGeometry(10,10,10);
    cube = new THREE.Mesh(cube_geo, test_material);
    cube.position.set(cur_point.x, cur_point.y, cur_point.z);
    scene.add(cube);
  }
}
