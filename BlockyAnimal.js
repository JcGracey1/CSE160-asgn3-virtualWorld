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
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {

    if(u_whichTexture == -2){
      gl_FragColor = u_FragColor; // use color

    } else if(u_whichTexture == -1){
      gl_FragColor = vec4(v_UV,1.0,1.0);  // use UV debug color

    } else if(u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV);   //use texture0

    } else if(u_whichTexture == 1){
      gl_FragColor = texture2D(u_Sampler1, v_UV);
      
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
let u_Sampler1;
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

  u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
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

    document.addEventListener('mousedown', mouseDown);
    document.addEventListener('mouseup', mouseUp);
    document.addEventListener('mousemove', mouseMove);
}

function initTextures(){
  const textures = [
    { src: 'sand.jpg', unit: gl.TEXTURE0, uniform: u_Sampler0 },
    { src: 'grass.jpg', unit: gl.TEXTURE1, uniform: u_Sampler1 }
  ];

  textures.forEach((textureInfo, index) => {
    const image = new Image();
    if (!image) {
      console.log(`Failed to create image for ${textureInfo.src}`);
      return;
    }

    image.onload = function () {
      sendTextureToUnit(image, textureInfo.unit, textureInfo.uniform);
    };
    image.src = textureInfo.src;
  });

  return true;
}

function sendTextureToUnit(image, textureUnit, samplerUniform) {
  const texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create texture');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(samplerUniform, textureUnit - gl.TEXTURE0);
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
    case 'g':
    case 'G':
      g_camera.panUp();
      break;
    case 'b':
    case 'B':
      g_camera.panDown();
      break;
  }

}

let isMouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;
function mouseDown(e) {
  isMouseDown = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
}

function mouseUp() {
  isMouseDown = false;
}

function mouseMove(e) {
  if (!isMouseDown) return;

  // left to right = positive
  let deltaX = e.clientX - lastMouseX;
  // bottom top will be negative
  let deltaY = e.clientY - lastMouseY;

  // Call the camera functions based on mouse movement
  // switched bc idk why
  
  if (deltaX > 0) {
    g_camera.panLeft(deltaY * 0.1);
  } else if(deltaX < 0) {
    g_camera.panRight(deltaY * 0.1);
  }

  if (deltaY > 0) {
    g_camera.panDown(deltaX * 0.1);
  } else if (deltaY < 0) {
    g_camera.panUp(deltaX * 0.1);
  }
  


  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
}


var g_map = [];
for (let x = 0; x < 32; x++) {
  g_map[x] = [];
  for (let y = 0; y < 32; y++) {
    let height = Math.random() < 0.04 ? 2 : Math.random() < 0.09 ? 1 : 0; // Random dunes
    g_map[x][y] = height;
  }
}


var cube = new Cube(); // Create the cube once before the loops

function drawMap() {
  for (let x = 0; x < 32; x++) {
    for (let y = 0; y < 32; y++) {
      let height = g_map[x][y];

      for (let h = 0; h <= height; h++) { // Stack cubes for dunes
        if(height == 0){
          cube.textureNum = 1;
        } else {
          cube.textureNum = 0;
        }
        cube.matrix.setIdentity(); // Reset the transformation matrix to avoid accumulation

        // Apply the transformation for the current tile
        cube.matrix.translate(x - 16, h * 0.5, y - 16);
        //cube.matrix.scale(0.5, 0.5, 0.5);

        // Render the cube
        cube.render();
      }
    }
  }


}

// Add and remove blocks:
document.addEventListener("keydown", function (event) {
  let playerX = Math.floor(g_camera.eye.elements[0] + 16);
  let playerY = Math.floor(g_camera.eye.elements[2] + 16);

  if (playerX >= 0 && playerX < 32 && playerY >= 0 && playerY < 32) {
    if (event.key === "t" || event.key === "T") { // Add block
      if (g_map[playerX][playerY] < 3) g_map[playerX][playerY]++;
    }
    if (event.key === "r" || event.key === "R") { // Remove block
      if (g_map[playerX][playerY] > 0) g_map[playerX][playerY]--;
    }
  } else {
    console.log("Player is out of map bounds:", playerX, playerY);
  }
  
});



function renderAllShapes() {
  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var floor = new Cube();
  floor.color = [0,1,0,1];
  floor.textureNum=-2;
  floor.matrix.translate(0,0,0);
  floor.matrix.scale(16,0,16);
  floor.matrix.translate(-.5,0,.5);
  floor.render();

  var sky = new Cube();
  sky.color = [150/255,203/255,1,1];
  sky.textureNum=-2;
  sky.matrix.scale(50,50,50);
  sky.matrix.translate(-.5,-.5,.5);
  sky.render();
  

  drawMap();


  requestAnimationFrame(renderAllShapes);

  var duration = performance.now() - startTime;
  sendTextToHtml(' fps: ' + Math.floor(1000 / duration)/10, "numdot");
}

function sendTextToHtml(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log('No html element with id=' + htmlID);
    return;
  }
  htmlElm.innerHTML = text;
}