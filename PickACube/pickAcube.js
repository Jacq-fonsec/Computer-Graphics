
// CreateCubeHW2.js
// These are the cube vertices and cube definition that must be used for HW 2.
// TO DO for HW:
// Add per face color: each face must have a unique color
//
var canvas;
var gl;

var cubeVertices = [];
var cubeColor = [];
var cubeObjects = [];
var cubeProtInd = []
var theta = 0;
var scale = 0.25;
var scaleLoc;
var thetaLoc;
var speed = 0.2;
var matrixLoc;
var r = .25 / 2 + 0.2;


var vertices = [
    vec3( 0.0, 0.0,  0.0),
    vec3( 0.0, 1.0,  0.0 ),
    vec3( 1.0, 1.0,  0.0 ),
    vec3( 1.0, 0.0,  0.0 ),
    vec3( 0.0, 0.0, -1.0 ),
    vec3( 0.0, 1.0, -1.0 ),
    vec3( 1.0, 1.0, -1.0 ),
    vec3( 1.0, 0.0, -1.0 )
];

var oneColor = [ 0.0, 0.5, 0.2, 1.0 ];
 
	
function createCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{

    // We need to partition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
     var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],   // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]  // white
    ];
    
    var indices = [ a, b, c, a, c, d ];

    console.log("CreateCube: indices = ",indices);

    var colorIn = 0
    for ( var i = 0; i < indices.length; ++i )
    {
        cubeVertices.push( vertices[indices[i]] );
        cubeColor.push(vertexColors[a]);
    };
};

function cubePrototypes(axis, x, y)
{
    this.axis = axis;
    this.x = x + 0.05;
    this.y = y - 0.1;
    this.position = translate(x, y, 0.0);
};

cubePrototypes.prototype.cubeSpecifications = function(t, s)
{
    for(var i = 0; i < 3; i++)
    {
        if (this.axis[i] != 0)
        {
            rotMat = rotate(t, this.axis);
            var scaledMat = mult(scalem(s, s, s),  rotMat);
            
            var transMat =  mult(scaledMat, translate(-0.45, -0.45, 0.45));
            return mult(this.position, transMat);
        }
    }
    return mult(this.position, scalem(s, s, s));
};


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    createCube();


    var step = 2*Math.PI/8;
    var rad = 0.75;
    var ang = 0

    for(var i=0;  i < 8;  i++) {
        let x = rad*Math.cos(ang);
        let y = -rad*Math.sin(ang);
        cubeProtInd.push(x);
        cubeProtInd.push(y);
        ang += step;
    }

    cubeObjects.push(new cubePrototypes([-1, 0, 0], cubeProtInd[0], cubeProtInd[1]));
    cubeObjects.push(new cubePrototypes([-1, 1, 0], cubeProtInd[2], cubeProtInd[3]));
    cubeObjects.push(new cubePrototypes([0, 1, 0], cubeProtInd[4], cubeProtInd[5]));
    cubeObjects.push(new cubePrototypes([1, 1, 0], cubeProtInd[6], cubeProtInd[7]));
    cubeObjects.push(new cubePrototypes([1, 0, 0], cubeProtInd[8], cubeProtInd[9]));
    cubeObjects.push(new cubePrototypes([1, -1, 0], cubeProtInd[10], cubeProtInd[11]));
    cubeObjects.push(new cubePrototypes([0, -1, 0], cubeProtInd[12], cubeProtInd[13]));
    cubeObjects.push(new cubePrototypes([-1, -1,  0], cubeProtInd[14], cubeProtInd[15]));
    cubeObjects.push(new cubePrototypes([0, 0, 0], -0.1, -0.1));

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeColor), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeVertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    matrixLoc = gl.getUniformLocation(program, "matrix")

    document.getElementById("rButton").onclick = function(){
        console.log("reset button clicked");
        cubeObjects[cubeObjects.length-1].axis = [0,0,0];
        cubeObjects[cubeObjects.length-1].position = translate(-0.1, -0.1, 0);
    }
    document.getElementById("scale").oninput = function () {
        console.log("scale slider changed");
        scale = parseFloat(document.getElementById("scale").value);
        r = 1/2 * scale + 0.2;
    }

    document.getElementById("rotation").oninput = function () {
        console.log("rotation slider changed");
        speed = parseFloat(document.getElementById("rotation").value);
    }
    document.getElementById("gl-canvas").onclick = function (m) {

        console.log("clicked");
        var coordinates = getCursorPosition(this, m);
        var xC = coordinates[0];
        var yC = coordinates[1];


        var closest = cubeObjects[0];
        var distance = Infinity;

       for (var i = 0; i < cubeObjects.length-1; i++)
        {
            var xSum = cubeObjects[i].x - xC;
            var ySum = cubeObjects[i].y - yC;

            var objDistance = Math.sqrt(Math.pow(xSum, 2) + Math.pow(ySum, 2));

            if (distance > objDistance)
            {
                distance = objDistance;
                closest = cubeObjects[i];
            }
        }

        if (distance <= r)
        {
            cubeObjects[cubeObjects.length-1].axis = closest.axis; 
            cubeObjects[cubeObjects.length-1].position = translate(0, 0, 0);
        }

    }

    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta += speed * 0.5;
    theta = (theta % 360);

    console.log("theta = ",theta);

    for (i = 0; i < cubeObjects.length; i++)
    {
        var matrix = cubeObjects[i].cubeSpecifications(theta, scale);
        gl.uniformMatrix4fv(matrixLoc, false, flatten(matrix));
        gl.drawArrays(gl.TRIANGLES, 0, 36);
      
    };
    requestAnimFrame( render );
}