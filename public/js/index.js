var stats;

function init() {
  $('img').each(function() {
    var email = $(this).attr('data-email');
    $(this).attr('src', User.getGravatarUrl(email)).attr('width', '20px');
  });

  shader_time = 0;

  scene = new THREE.Scene();
  oclscene = new THREE.Scene();
  glowscene = new THREE.Scene();

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
  oclscene.add(game.occ_player_mesh);
  glowscene.add(game.glow_player_mesh);
  scene.add(game.opponent_meshes);
  scene.add(game.occ_opponent_meshes);


  //occlusion scene for god rays
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

  //stats = new Stats();
  //stats.domElement.style.position = 'absolute';
  //stats.domElement.style.top = '0px';
  //stats.domElement.style.left = '0px';
  //stats.domElement.style.zIndex = 100;
  //$('#container').append(stats.domElement);

  var render_params = { minFilter: THREE.LinearFilter, 
    magFilter: THREE.LinearFilter, format: THREE.RGBFormat, 
    stencilBufer: false };
  ocl_render_target = new THREE.WebGLRenderTarget( SCREEN_WIDTH/2, 
      SCREEN_HEIGHT/2, render_params );
  var glow_render_target = new THREE.WebGLRenderTarget( SCREEN_WIDTH/2, 
      SCREEN_HEIGHT/2, render_params );

  var normal_render = new THREE.RenderPass( scene, camera );
  var ocl_render = new THREE.RenderPass( oclscene, camera );
  var glow_render = new THREE.RenderPass(glowscene, camera);

  var gr_pass = new THREE.ShaderPass( gr_shader );
  // light is always in center of screen
  gr_pass.uniforms["fX"].value = 0.5;
  gr_pass.uniforms["fY"].value = 0.5;
  gr_pass.needsSwap = true;
  gr_pass.renderToScreen = false;

  var horiz_blur = new THREE.ShaderPass(THREE.HorizontalBlurShader);
  var vert_blur = new THREE.ShaderPass(THREE.VerticalBlurShader);
  
  horiz_blur.uniforms[ "h" ].value = 5 / window.innerWidth;
  vert_blur.uniforms[ "v" ].value = 5 / window.innerHeight;

  var add_gr = new THREE.ShaderPass(THREE.AdditiveBlendShader,'tDiffuse1');
  var add_glow = new THREE.ShaderPass(THREE.AdditiveBlendShader,'tDiffuse1');

  add_gr.needsSwap = true;
  //add_gr.renderToScreen = true;

  oclcomposer = new THREE.EffectComposer(renderer, ocl_render_target);

  oclcomposer.addPass(ocl_render);
  oclcomposer.addPass(gr_pass);


  glowcomposer = new THREE.EffectComposer(renderer, glow_render_target);

  glowcomposer.addPass(glow_render);
  glowcomposer.addPass(horiz_blur);
  glowcomposer.addPass(vert_blur);

  add_gr.uniforms['tDiffuse2'].value = oclcomposer.renderTarget1;
  add_glow.uniforms['tDiffuse2'].value = glowcomposer.renderTarget1;
  //add_gr.renderToScreen = true;

  var render_target = new THREE.WebGLRenderTarget(SCREEN_WIDTH, SCREEN_HEIGHT, 
      render_params);

  finalcomposer = new THREE.EffectComposer(renderer);
  
  film_pass = new THREE.ShaderPass(THREE.FilmShader);
  film_pass.uniforms['grayscale'].value = 0;
  film_pass.uniforms['sCount'].value = 750;
  film_pass.uniforms['sIntensity'].value = 1.0;
  film_pass.uniforms['sIntensity'].value = 1.0;

  static_pass = new THREE.ShaderPass(THREE.StaticShader);
  static_pass.uniforms['amount'].value = 0.1;
  static_pass.uniforms['size'].value = 10.0;

  static_pass.renderToScreen = true;

  finalcomposer.addPass(normal_render);
  finalcomposer.addPass(add_gr);
  finalcomposer.addPass(add_glow);
  finalcomposer.addPass(add_glow);
  finalcomposer.addPass(film_pass);
  finalcomposer.addPass(static_pass);

  animate();
};

function animate()  {
  requestAnimationFrame( animate );
  update();
  TWEEN.update();
  render();
  //stats.update();
};

function update() {
  shader_time += 0.1;
  film_pass.uniforms['time'].value = shader_time;
  static_pass.uniforms['time'].value = shader_time;
  core.stepRotation(0.002);
};

function render() {	
  oclcomposer.render();
  glowcomposer.render();
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
