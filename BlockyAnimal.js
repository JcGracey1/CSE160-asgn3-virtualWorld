// ColoredPoints.js
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform int u_whichTexture;
  void main() {

    if(u_whichTexture == -2){
      gl_FragColor = u_FragColor; // use color

    } else if(u_whichTexture == -1){
      gl_FragColor = vec4(v_UV,1.0,1.0);  // use UV debug color

    } else if(u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV);   //use texture0
      
    } else{
      gl_FragColor = vec4(1, .2, .2, 1.0);   // ERROR reddish color
    }
  }`

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
//let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler0;
let u_whichTexture;

function setupWebGL() {
	// Retrieve <canvas> element
	canvas = document.getElementById('webgl');
  if (!canvas) {
    console.log("Failed to retrieve the <canvas> element");
    return;
  }

	// Get the rendering context for WebGL
	//gl = getWebGLContext(canvas);
  gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}	

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablestoGLSL() {
	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
	console.log('Failed to intialize shaders.');
	return;
	}

	// // Get the storage location of a_Position
	a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
	console.log('Failed to get the storage location of a_Position');
	return;
	}

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

	// Get the storage location of u_FragColor
	u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	if (!u_FragColor) {
	console.log('Failed to get the storage location of u_FragColor');
	return;
	}

  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture");
  if(!u_whichTexture){
    console.log('Failed to get the storage location of u_whichTexture');
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  // u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  // if (!u_Size){
  //   console.log('Failed to get the storage location of u_Size');
  //   return;    
  // }
	
}


// Globals related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];

let g_globalAngle = 0;
//let g_jointAngle = 0;


function addActionsForHtmlUI(){

  // document.getElementById('jointSlide').addEventListener('mousemove', function() { g_jointAngle = this.value; renderAllShapes();});
  // document.getElementById('headSlide').addEventListener('mousemove', function() { g_headAngle = this.value; renderAllShapes();});
  // // // size slider events
  // document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value;});

  //angle slider:
  document.getElementById('angleSlide').addEventListener('mousemove', function() {
     g_globalAngle = parseFloat(this.value); 
     startingMouseX = null;
     renderAllShapes();
    });
}

function initTextures(){

  var image = new Image();
  if(!image){
    console.log('Failed to create image');
    return;
  }

  image.onload = function(){ sendTextureToTEXTURE0(image); };
  image.src = 'sample_wood.jpg';

  // Add more texture loading
  return true;
}

function sendTextureToTEXTURE0(image){
  var texture = gl.createTexture();
  if(!texture){
    console.log('Failed to create texture');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler0, 0);

  //console.log('Texture loaded');
}


let g_camera;
function main() {
	setupWebGL();
	connectVariablestoGLSL();

  addActionsForHtmlUI();

  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  //gl.viewport(0, 0, canvas.width, canvas.height);

  g_camera = new Camera();
  document.onkeydown = keydown;

  // Clear <canvas>
 // requestAnimationFrame(tick);

  renderAllShapes();


}

// change this to be WSAD
function keydown(e) {
  switch (e.key) {
    case 'w':
    case 'W':
      g_camera.forward();
      break;
    case 's':
    case 'S':
      g_camera.backward();
      break;
    case 'a':
    case 'A':
      g_camera.moveLeft();
      break;
    case 'd':
    case 'D':
      g_camera.moveRight();
      break;
    case 'q':
    case 'Q':
      g_camera.panLeft();
      break;
    case 'e':
    case 'E':
      g_camera.panRight();
      break;
  }
  // TODO: When user hits Q call camera.panLeft()
  // TODO: When user hits E call camera.panRight()
}




var g_map=[
  
];

function drawMap(){
  for(x=0;x<32;x++){
    for(y=0;y<32;y++){
      if(x<1 || x==31 || y==0 || y==31){
        var cube = new Cube();
        cube.color = [1.0, 0.0, 0.0, 1.0];
        cube.matrix.translate(0,-.75,0);
        cube.matrix.scale(.5,.5,.5);
        cube.matrix.translate(x-16, 0, y-16);
        //cube.renderFast();
      }
    }
  }

}

var g_eye = [1, 0, 3];
var g_at = [0, 0, -1000];
var g_up = [0, 1, 0];

function renderAllShapes() {
  //console.log("Rendering all shapes");

  //var startTime = performance.now();
  // var projMat = new Matrix4();
  // // first num: fov essentially
  // projMat.setPerspective(60, canvas.width/canvas.height, .1, 100);
  // gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // var viewMat = new Matrix4();
  // //viewMat.setLookAt(0,0,3,0,0,-100,0,1,0);
  // viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]);
  // // viewMat.setLookAt(
  // //   g_camera.eye.x, g_camera.eye.y, g_camera.eye.z,
  // //   g_camera.at.x, g_camera.at.y, g_camera.at.z,
  // //   g_camera.up.x, g_camera.up.y, g_camera.up.z
  // // );
  // gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var floor = new Cube();
  floor.color = [0,1,0,1];
  floor.textureNum=0;
  floor.matrix.translate(0,-.75,0);
  floor.matrix.scale(10,0,10);
  floor.matrix.translate(-.5,0,.5);
  floor.render();

  var sky = new Cube();
  sky.color = [150/255,203/255,1,1];
  sky.textureNum=-2;
  sky.matrix.scale(50,50,50);
  sky.matrix.translate(-.5,-.5,.5);
  sky.render();
  

  var testCube = new Cube();
  testCube.color = [1,0,0,1];
  testCube.matrix.translate(-.25,-.75,0);
  testCube.render();

  //drawTriangle3D([0.0, 0.0, -0.5,  1.0, 0.0, -0.5,  0.5, 1.0, -0.5]);
  //drawTriangle([0.0, 0.0, -0.5,  1.0, 0.0, -0.5,  0.5, 1.0, -0.5]);

  requestAnimationFrame(renderAllShapes);
}