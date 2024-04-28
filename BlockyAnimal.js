// HelloPoint1.js (c) 2012 matsuda
// Vertex shader program


var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

  // global variables
let gl;
let canvas;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL(){
    // retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    // gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
    }

    gl.enable(gl.DEPTH_TEST);
    
}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
    }

    // set an initial value for this matrix to identify
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// global variable for UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0]
let g_selectedSize=5;
let g_selectedType="POINT";

let g_globalAngle = 0;
let g_globalAngleY = 0;
let g_globalAngleZ = 0;
let g_armAngle = 0;
let g_legAngle = 0;
let g_backFootAngle = 0;
let g_feetAngle = 0;

let g_Animation = false;


function addActionsForHTMLUI(){

    // // slider events
    // document.getElementById("redSlide").addEventListener("mouseup", function() { g_selectedColor[0] = this.value/100; })
    document.getElementById("animationOnButton").onclick = function() { g_Animation =true; }
    document.getElementById("animationOffButton").onclick = function() { g_Animation =false; }

    // document.getElementById("animationMagentaOnButton").onclick = function() { g_magentaAnimation =true; }
    // document.getElementById("animationMagentaOffButton").onclick = function() { g_magentaAnimation =false; }

    document.getElementById("armSlide").addEventListener("mousemove", function() { g_armAngle = this.value; renderAllShapes(); })
    document.getElementById("backfeetSlide").addEventListener("mousemove", function() { g_backFootAngle = this.value; renderAllShapes(); })
    document.getElementById("legSlide").addEventListener("mousemove", function() { g_legAngle = this.value; renderAllShapes(); })

    document.getElementById("angleSlide").addEventListener("mousemove", function() { g_globalAngle = this.value; renderAllShapes(); })
    document.getElementById("angleYSlide").addEventListener("mousemove", function() { g_globalAngleY = this.value; renderAllShapes(); });
    document.getElementById("angleZSlide").addEventListener("mousemove", function() { g_globalAngleZ = this.value; renderAllShapes(); });
    document.getElementById("resetCameraButton").onclick = resetCameraAngles;



}

function main() {

    // set up canvas and gl variables
    setupWebGL();
    // set up GLSL and connect GLSL variables
    connectVariablesToGLSL();

    // Set up actions for the HTML UI elements
    addActionsForHTMLUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) { if (ev.buttons == 1) {click(ev) } };

    // Specify the color for clearing <canvas>
    gl.clearColor(91/255, 138/255, 83/255, 1.0);

    // renderAllShapes();
    requestAnimationFrame(tick);

}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
    // print some debug info so we know we are running
    g_seconds = performance.now()/1000.0-g_startTime;
    // console.log(g_seconds);

    // update animation angles
    updateAnimationAngles();

    // draw everything
    renderAllShapes();

    // tell browser to update again when it has time
    requestAnimationFrame(tick);
}


var g_shapesList = [];


function click(ev) {

    // extract the event click and return it in WebGL coordinats
    let [x,y] = convertCoordinatesEventToGL(ev);
    // create and store the new point
    let point;
    if (g_selectedType == POINT){
    point = new Point();
    } else if (g_selectedType == TRIANGLE){
    point = new Triangle();
    } else {
    point = new Circle();
    point.segments = g_selectedSegments; // Seting the num of segments
    }
    point.position=[x,y];
    point.color=g_selectedColor.slice();
    point.size=g_selectedSize;
    g_shapesList.push(point);

    // Draw every shape that is supposed to be in the canvas
    renderAllShapes();
}

function convertCoordinatesEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return ([x,y]);
}

function updateAnimationAngles() {
    if (g_Animation) { // if yellow animation is on
        g_armAngle = (45*Math.sin(g_seconds));
        g_legAngle = (35*Math.sin(g_seconds))
        g_backFootAngle = 27.5 + 17.5 * Math.sin(g_seconds);  // Oscillates between 0 and 45 degrees

    }

}

function resetCameraAngles() {
    // Reset angles
    g_globalAngle = 0;
    g_globalAngleY = 0;
    g_globalAngleZ = 0;

    // Update slider positions
    document.getElementById('angleSlide').value = 0;
    document.getElementById('angleYSlide').value = 0;
    document.getElementById('angleZSlide').value = 0;

    // Re-render the scene
    renderAllShapes();
}

function renderAllShapes() {
    var startTime = performance.now();

    var globalRotMat = new Matrix4()
    .rotate(g_globalAngle, 0, 1, 0) // Rotation around Y-axis
    .rotate(g_globalAngleY, 1, 0, 0) // Rotation around X-axis
    .rotate(g_globalAngleZ, 0, 0, 1); // Rotation around Z-axis

    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Draw the white body cube
    var body = new Cube();
    body.color = [1.0,1.0,1.0,1.0];
    body.matrix.translate(-.4,-.3,0.0);
    body.matrix.rotate(10,1,0,0);
    body.matrix.scale(0.5,0.5,0.5);
    body.render();

    // black cube body
    var body2 = new Cube();
    body2.color = [0.129,0.129,0.129,1];
    body2.matrix.translate(-.4,-.39,0.501);
    body2.matrix.rotate(10,1,0,0);
    body2.matrix.scale(0.5,0.5001,0.5);
    body2.render();

    // Right Thigh
    var rightThigh = new Cube();
    rightThigh.color = [0.129,0.129,0.129,1];
    rightThigh.matrix.translate(0, -0.5, 0.54);
    rightThigh.matrix.rotate(-g_legAngle, 1, 0, 0);
    var thighCoordR = new Matrix4(rightThigh.matrix);
    rightThigh.matrix.rotate(10, 1, 0, 0);
    rightThigh.matrix.scale(0.2, 0.4, 0.5);
    rightThigh.render();

    // Back Foot Right
    var backFootRight = new Cube();
    backFootRight.color = [0.129,0.129,0.129,1];
    backFootRight.matrix = new Matrix4(thighCoordR);
    backFootRight.matrix.translate(0, -0.18, 0.0);
    // backFootRight.matrix.translate(0, 0.05, 0); // adjust
    backFootRight.matrix.rotate(-g_backFootAngle, 1, 0, 0);
    // backFootRight.matrix.translate(0, -0.05, 0); // adjust

    var backCoordR = new Matrix4(backFootRight.matrix);
    backFootRight.matrix.scale(0.2, 0.1, 0.5);
    backFootRight.render();


    // Front Foot Right - Using setTranslate to initialize the position
    var frontFootRight = new Cube();
    frontFootRight.color = [1,1,1,1];
    frontFootRight.matrix = new Matrix4(backCoordR);

    frontFootRight.matrix.translate(0, 0, -.29); // Sets the position ignoring any previous transformations
    frontFootRight.matrix.scale(0.2, 0.1, 0.3);
    frontFootRight.render();

    // left leg

    var leftThigh = new Cube();
    leftThigh.color = [0.129,0.129,0.129,1];
    leftThigh.matrix.translate(-.5,-0.5,0.54);
    leftThigh.matrix.rotate(-g_legAngle,1,0,0);
    var thighCoordL = new Matrix4(leftThigh.matrix);
    leftThigh.matrix.rotate(10,1,0,0);
    leftThigh.matrix.scale(0.2,0.4,0.5);
    leftThigh.render();

    var backFootLeft = new Cube();
    backFootLeft.color = [0.129,0.129,0.129,1];
    backFootLeft.matrix = thighCoordL;
    backFootLeft.matrix.translate(0,-0.18,0);
    backFootLeft.matrix.rotate(-g_backFootAngle, 1, 0, 0);


    var backCoordL = new Matrix4(backFootLeft.matrix);

    backFootLeft.matrix.scale(0.2,0.1,0.5);
    backFootLeft.render();



    var frontFootLeft = new Cube();
    frontFootLeft.color = [1,1,1,1];
    frontFootLeft.matrix = new Matrix4(backCoordL);

    frontFootLeft.matrix.translate(0,0,-.29);
    // frontFootLeft.matrix.translate(-.5,-0.68,-0.29);
    frontFootLeft.matrix.scale(0.2,0.1,0.3);
    frontFootLeft.render();

    var head = new Cube();
    head.color = [1,1,1,1];
    head.matrix.translate(-.375,0,-0.3);
    head.matrix.scale(0.45,0.45,0.45);
    head.render();

    var leftEar = new Cube();
    leftEar.color = [1,1,1,1];
    leftEar.matrix.translate(-.4,.4,-0.3);
    leftEar.matrix.rotate(8,0,0);
    leftEar.matrix.scale(0.2,0.4,0.08);
    leftEar.render();

    var RightEar = new Cube();
    RightEar.color = [1,1,1,1];
    RightEar.matrix.translate(-0.1,.43,-0.3);
    RightEar.matrix.rotate(-8,0,0);
    RightEar.matrix.scale(0.2,0.4,0.08);
    RightEar.render();

    innerLeftEar = new Cube();
    innerLeftEar.color = [0.902, 0.627, 0.604, 1];
    innerLeftEar.matrix.translate(-.3,.43,-0.3001);
    innerLeftEar.matrix.rotate(8,0,0);
    innerLeftEar.matrix.scale(0.1,0.3,0.08);
    innerLeftEar.render();

    innerRightEar = new Cube();
    innerRightEar.color = [0.902, 0.627, 0.604, 1];
    innerRightEar.matrix.translate(-0.1,.44,-0.3001);
    innerRightEar.matrix.rotate(-8,0,0);
    innerRightEar.matrix.scale(0.1,0.3,0.08);
    innerRightEar.render();


    var leftArm = new Cube();
    leftArm.color = [1,1,1,1];
    // leftArm.matrix.rotate(-g_armAngle,0,-1,-1);
    leftArm.matrix.translate(-.5,-0.68,0);
    // Additional translation to align the rotation axis at the shoulder (assuming the length is 0.6, we adjust half of it)
    leftArm.matrix.translate(0, 0.5, 0);
    leftArm.matrix.rotate(-g_armAngle,1,0,0);
    // Translate back
    leftArm.matrix.translate(0, -0.5, 0);
    leftArm.matrix.scale(0.2,0.6,0.2);
    leftArm.render();

    var rightArm = new Cube();
    rightArm.color = [1,1,1,1];
    rightArm.matrix.translate(0,-0.68,0);
    // Additional translation to align the rotation axis at the shoulder
    rightArm.matrix.translate(0, 0.5, 0);
    rightArm.matrix.rotate(-g_armAngle,1,0,0);
    // Translate back
    rightArm.matrix.translate(0, -0.5, 0);
    rightArm.matrix.scale(0.2,0.6,0.2);
    rightArm.render();

    var nose = new Cube();
    nose.color = [237/255, 109/255, 109/255, 1];
    nose.matrix.translate(-0.1875,0.2,-0.33);
    nose.matrix.scale(0.05,0.05,0.05);
    nose.render();

    var eyeDarkLeft = new Cube();
    eyeDarkLeft.color = [0.18, 0.18, 0.18, 1];
    eyeDarkLeft.matrix.translate(-0.2375,0.25,-0.31);
    eyeDarkLeft.matrix.scale(0.05,0.05,0.02);
    eyeDarkLeft.render();

    var eyeWhiteLeft = new Cube();
    eyeWhiteLeft.color = [0.71, 0.71, 0.71, 1];
    eyeWhiteLeft.matrix.translate(-0.2375,0.3,-0.31);
    eyeWhiteLeft.matrix.scale(0.05,0.05,0.02);
    eyeWhiteLeft.render();

    var eyeDarkRight = new Cube();
    eyeDarkRight.color = [0.18, 0.18, 0.18, 1];
    eyeDarkRight.matrix.translate(-0.1375,0.25,-0.31);
    eyeDarkRight.matrix.scale(0.05,0.05,0.02);
    eyeDarkRight.render();

    var eyeWhiteRight = new Cube();
    eyeWhiteRight.color = [0.71, 0.71, 0.71, 1];
    eyeWhiteRight.matrix.translate(-0.1375,0.3,-0.31);
    eyeWhiteRight.matrix.scale(0.05,0.05,0.02);
    eyeWhiteRight.render();



    // // Draw a left arm
    // var leftArm = new Cube();
    // leftArm.color = [1,1,0,1];
    // leftArm.matrix.setTranslate(0,-.5,0.0);
    // leftArm.matrix.rotate(-5,1,0,0);
    // leftArm.matrix.rotate(-g_yellowAngle,0,0,1);
    
    // var yellowCoordinatesMat = new Matrix4(leftArm.matrix);
    // leftArm.matrix.scale(0.25,.7,.5);
    // leftArm.matrix.translate(-.5,0,0);
    // leftArm.render();


    // test box
    // var box = new Cube();
    // box.color = [1,0,1,1];
    // box.matrix = yellowCoordinatesMat;
    // box.matrix.translate(0,0.65,0);
    // box.matrix.rotate(-g_magentaAngle,0,0,1);
    // box.matrix.scale(.3,.3,.3);
    // box.matrix.translate(-0.5,0,-0.001);
    // box.render();


    var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID){
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
    }
    htmlElm.innerHTML = text;
}