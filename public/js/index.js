var stats;

function init() {
  scene = new THREE.Scene();

  // create a light
  light = new THREE.PointLight(0xffffff);
  light.position.set(0,0,Globals.LIGHT_DIST);
  scene.add(light);
  var ambientLight = new THREE.AmbientLight(0x111111);

  var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;	
  // camera attributes
  var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1; 
  var FAR = 1000;
  // set up camera
  camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
  // add the camera to the scene
  camera.position.set(0,0,400);
  camera.lookAt(scene.position);

  scene.add(game.player_mesh);
  scene.add(game.opponent_meshes);


  //occlusion scene for god rays
  oclscene = new THREE.Scene();
  oclscene.add(core.ocl_group);
  scene.add(core.group);

  var axes = new THREE.AxisHelper(100);
  scene.add( axes );

  oclscene.add( new THREE.AmbientLight( 0xffffff ) );

  // "sun" for god rays
  vlight = new THREE.Mesh( 
      new THREE.IcosahedronGeometry(150, 1),
      new THREE.MeshBasicMaterial({
        color: 0xffffff
      }));
  oclscene.add(vlight);

  renderer = new THREE.WebGLRenderer({//antialias:true
  });
  renderer.setSize( window.innerWidth, window.innerHeight );

  renderer.autoClear = false;
  renderer.sortObjects = true;
  $('#container').append(renderer.domElement);

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  stats.domElement.style.left = '0px';
  stats.domElement.style.zIndex = 100;
  $('#container').append(stats.domElement);

  var render_params = { minFilter: THREE.LinearFilter, 
    magFilter: THREE.LinearFilter, format: THREE.RGBFormat, 
    stencilBufer: false };
  ocl_render_target = new THREE.WebGLRenderTarget( SCREEN_WIDTH/2, 
      SCREEN_HEIGHT/2, render_params );

  var normal_render = new THREE.RenderPass( scene, camera );
  var ocl_render = new THREE.RenderPass( oclscene, camera );

  var gr_pass = new THREE.ShaderPass( gr_shader );
  // light is always in center of screen
  gr_pass.uniforms["fX"].value = 0.5;
  gr_pass.uniforms["fY"].value = 0.5;
  gr_pass.needsSwap = true;
  gr_pass.renderToScreen = false;

  var add_gr = new THREE.ShaderPass(THREE.AdditiveBlendShader,'tDiffuse1');
  add_gr.needsSwap = true;
  add_gr.renderToScreen = true;

  oclcomposer = new THREE.EffectComposer( renderer, ocl_render_target );

  oclcomposer.addPass(ocl_render);
  oclcomposer.addPass(gr_pass);

  add_gr.uniforms['tDiffuse2'].value = oclcomposer.renderTarget1;

  var render_target = new THREE.WebGLRenderTarget( SCREEN_WIDTH, SCREEN_HEIGHT, 
      render_params );

  finalcomposer = new THREE.EffectComposer( renderer, render_target );

  finalcomposer.addPass(normal_render);
  finalcomposer.addPass(add_gr);

  animate();
};

function animate()  {
  requestAnimationFrame( animate );
  update();
  render();
  stats.update();
};

function update() {
  
};

function render() {	
  oclcomposer.render();
  finalcomposer.render();
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
