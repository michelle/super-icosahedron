var stats;

function init() {
  camera = new THREE.PerspectiveCamera(55, 
      window.innerWidth / window.innerHeight, 20, 3000);
  camera.position.z = 1000;

  scene = new THREE.Scene();

  var dark_material = new THREE.MeshBasicMaterial( { color: 0xffffcc } );
  var wireframe_material = new THREE.MeshBasicMaterial( { color: 0x000000, 
    wireframe: true, transparent: true } ); 
  var multiMaterial = [ dark_material, wireframe_material ]; 

  var test_material = new THREE.MeshLambertMaterial( {color: 0x8888ff} );
  var geometry = new THREE.CubeGeometry(500,500,500);
  cube = new THREE.Mesh(geometry, test_material);
  //scene.add(cube);

  var shape = THREE.SceneUtils.createMultiMaterialObject( 
      new THREE.IcosahedronGeometry( 500, 1 ), // radius, subdivisions
      multiMaterial );
  scene.add( shape );

  var axes = new THREE.AxisHelper(100);
  scene.add( axes );

  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  $('#container').append(renderer.domElement);

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.left = '0px';
  stats.domElement.style.zIndex = 100;
  $('#container').append(stats.domElement);

  animate();
}


function animate()  {
  requestAnimationFrame( animate );
  render();
  update();
  stats.update();
}

function update() {
}

function render() {	
  renderer.render( scene, camera );
}

$(document).ready(init);
