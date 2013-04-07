var stats;

function init() {
  scene = new THREE.Scene();

  // create a light
  light = new THREE.PointLight(0xffffff);
  light.position.set(0,250,0);
  scene.add(light);
  var ambientLight = new THREE.AmbientLight(0x111111);
  // scene.add(ambientLight);

  // set the view size in pixels (custom or according to window size)
  // var SCREEN_WIDTH = 400, SCREEN_HEIGHT = 300;
  var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;	
  // camera attributes
  var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
  // set up camera
  camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
  // add the camera to the scene
  // 	so pull it back (z = 400) and up (y = 100) and set the angle towards the scene origin
  camera.position.set(0,0,400);
  camera.lookAt(scene.position);
  
  //controls = new THREE.TrackballControls( camera );

  scene.add(game.player_mesh);
  scene.add(game.opponent_meshes);

  scene.add(core.squareCenters());
  scene.add(core.group);

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
};

function animate()  {
  requestAnimationFrame( animate );
  update();
  render();
  //controls.update();
  stats.update();
};

function update() {
  
};

function render() {	
  renderer.render( scene, camera );
};


/**
 * Check localStorage for game info.
 */
function maybeLocalStorage() {
  var user;
  if (window.localStorage && (user = localStorage.getItem('user'))) {
    return JSON.parse(user);
  }
  return {};
};

/**
 * Start.
 */
$(document).ready(function() {
  // var game, user;
  core = new Core(Globals.INNER_RADIUS,Globals.NUM_SUBDIVS,Globals.SQUARE_DIM);
  game = new Game();
  user = new User(game, maybeLocalStorage());

  init();
});
