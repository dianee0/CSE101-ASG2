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

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// global variable for UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0]
let g_selectedSize=5;
let g_selectedType="POINT";
// let g_selectedSegments = 10; 
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;

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

function addActionsForHTMLUI(){

    // // slider events
    // document.getElementById("redSlide").addEventListener("mouseup", function() { g_selectedColor[0] = this.value/100; })
    document.getElementById("animationYellowOnButton").onclick = function() { g_yellowAnimation =true; }
    document.getElementById("animationYellowOffButton").onclick = function() { g_yellowAnimation =false; }

    document.getElementById("animationMagentaOnButton").onclick = function() { g_magentaAnimation =true; }
    document.getElementById("animationMagentaOffButton").onclick = function() { g_magentaAnimation =false; }

    document.getElementById("magentaSlide").addEventListener("mousemove", function() { g_magentaAngle = this.value; renderAllShapes(); })
    document.getElementById("yellowSlide").addEventListener("mousemove", function() { g_yellowAngle = this.value; renderAllShapes(); })

    document.getElementById("angleSlide").addEventListener("mousemove", function() { g_globalAngle = this.value; renderAllShapes(); })



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
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

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
    if (g_yellowAnimation) { // if yellow animation is on
        g_yellowAngle = (45*Math.sin(g_seconds));
    }
    if (g_magentaAnimation) {
        g_magentaAngle = (45*Math.sin(3*g_seconds));
    }
}

function renderAllShapes() {
    var startTime = performance.now();

    var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Draw the body cube
    var body = new Cube();
    body.color = [1.0,0.0,0.0,1.0];
    body.matrix.translate(-.25,-.75,0.0);
    body.matrix.rotate(-5,1,0,0);
    body.matrix.scale(0.5,0.3,0.5);
    body.render();

    // Draw a left arm
    var leftArm = new Cube();
    leftArm.color = [1,1,0,1];
    leftArm.matrix.setTranslate(0,-.5,0.0);
    leftArm.matrix.rotate(-5,1,0,0);
    leftArm.matrix.rotate(-g_yellowAngle,0,0,1);
    
    var yellowCoordinatesMat = new Matrix4(leftArm.matrix);
    leftArm.matrix.scale(0.25,.7,.5);
    leftArm.matrix.translate(-.5,0,0);
    leftArm.render();



    // test box
    var box = new Cube();
    box.color = [1,0,1,1];
    box.matrix = yellowCoordinatesMat;
    box.matrix.translate(0,0.65,0);
    box.matrix.rotate(-g_magentaAngle,0,0,1);
    box.matrix.scale(.3,.3,.3);
    box.matrix.translate(-0.5,0,-0.001);
    box.render();


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