/*
Name: Jacqueline Fonseca
Date: April 24th, 2019
Program description: This program implements an animation of a dog walking in a circle on top
    of a ground plane. The dog is created from 10 parts (either cubes or spheres) and 2 different
    textures while the ground plane is an instance of a cube with one texture. The user has the
    ability to turn the animation off or on using the Toggle Animation button and can add or remove
    implemented sound using the Audio On/Off button.
Resources used: Prof. Angel's code, class slides, Khronos.

*/

var canvas;
var gl;
var program;

var texture0;
var texture1;
var texture2

var projectionMatrix;
var modelViewMatrix;

var transitionMatrix;
var instanceMatrix;
var modelViewMatrixLoc;

var vPosition;
var tBuffer;
var vTexCoord;
var vBuffer;
var nBuffer;
var vNormal;

var image0 = new Image();
var image1 = new Image();
var image2 = new Image();

var aud = new Audio('walk.wav');
var canPlay = false;

var sPoints = [];
var sNormals = [];
var index = 0;

var cPoints = [];
var cNormals = [];

var cubeTexCoordsArray = [];
var sphereTexCoordsArray = [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var lighting =
{
    position: vec4(1.0, 1.0, 1.0, 0.0 ),
    ambient: vec4( 0.2, 0.2, 0.2, 1.0 ),
    diffuse: vec4( 1.0, 1.0, 1.0, 1.0 ),
    specular: vec4( 0.0, 0.0, 0.0, 0.0 )
};

var va = vec3(0.0, 0.0, -1.0);
var vb = vec3(0.0, 0.942809, 0.333333);
var vc = vec3(-0.816497, -0.471405, 0.333333);
var vd = vec3(0.816497, -0.471405, 0.333333);

var torsoId = 0;
var headId  = 1;
var leftLeg1Id = 2;
var leftLeg2Id = 3;
var rightLeg1Id = 4;
var rightLeg2Id = 5;
var leftEarId = 6;
var rightEarId = 7;
var tailId = 8;
var snoutId = 9

var torsoHeight = 3.0;
var torsoWidth = 1.5;
var headWidth = 1.0;
var earWidth = 0.3;
var earHeight = 1.15;
var legHeight = 2.25
var legWidth = 0.5;
var tailHeight = 2.0;
var tailWidth = 0.25;
var snoutWidth = 0.5;
var snoutHeight = 0.4;


var theta = [0, 0, 180, 180, 180, 180, 180, 180, -30, 0]


var legDir = true;
var earDir = true;
var tailDir = true;

var moving = true;

var stack = [];

var figure = [];

for( var i=0; i<10; i++) figure[i] = createNode(null, null, null, null);

var eye = vec3(0.0, 10.0, 25.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 2.0, 0.0);

var perspProj =
 {
    fov: 40,
    aspect: 15,
    near: 0.1,
    far:  80
 };

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch(Id) {

    case torsoId:
        let rotTheta = -theta[torsoId] * Math.PI
        let rotMat = rotate(60, 0, -1, 0);
      	m = translate(4 * Math.cos(rotTheta/180), 0, 4 * Math.sin(rotTheta/180));
        m = mult(m, rotMat);
        m = mult(m, rotate(-theta[torsoId], 0, -1, 0 ));
        m = mult(m, scale4(0.3, 0.3, 0.3));
        figure[torsoId] = createNode( m, torso, null, headId );
        break;

    case headId:

        m = translate(-torsoWidth/3, torsoHeight, 0.0);
        figure[headId] = createNode( m, head, leftLeg1Id, snoutId);
        break;

    case leftLeg1Id:

        m = translate(-torsoWidth, 0.8, -0.75);
        m = mult(m, rotate(theta[leftLeg1Id], 0 , 0, 1));
        figure[leftLeg1Id] = createNode( m, leftLeg1, rightLeg1Id, null );
        break;

    case rightLeg1Id:

        m = translate(-torsoWidth, 0.8, 0.75);
        m = mult(m, rotate(theta[rightLeg1Id], 0, 0, 1));
        figure[rightLeg1Id] = createNode( m, rightLeg1, leftLeg2Id, null );
        break;

    case leftLeg2Id:

        m = translate(torsoWidth, 0.8, -0.75);
        m = mult(m , rotate(theta[leftLeg2Id], 0, 0, 1));
        figure[leftLeg2Id] = createNode( m, leftLeg2, rightLeg2Id, null );
        break;

    case rightLeg2Id:

        m = translate(torsoWidth, 0.8, 0.75);
        m = mult(m, rotate(theta[rightLeg2Id], 0, 0, 1));
        figure[rightLeg2Id] = createNode( m, rightLeg2, leftEarId, null );
        break;

    case leftEarId:

        m = translate(-torsoHeight, 2.5*headWidth, -0.75);
        m = mult(m, rotate(theta[leftEarId], 1, 0, 0));
        figure[leftEarId] = createNode( m, leftEar, rightEarId, null );
        break;

    case rightEarId:

        m = translate(-torsoHeight, 2.5*headWidth, 0.75);
        m = mult(m, rotate(theta[rightEarId], 1, 0, 0));
        figure[rightEarId] = createNode( m, rightEar, tailId, null );
        break;

    case tailId:

        m = translate(torsoHeight, torsoWidth, 0.0);
        m = mult(m, rotate(theta[tailId], 1, 0, 0));
        figure[tailId] = createNode( m, tail, null, null );
        break;

    case snoutId: 
        m = translate(-(headWidth + torsoHeight) , -1.2, 0.0);
        m = mult(m, rotate(theta[snoutId], 1, 0, 0));
        figure[snoutId] = createNode( m, snout, null, null );
        break;
    }
}


function traverse(Id) {

   if(Id == null) return;
   stack.push(modelViewMatrix);
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
   figure[Id].render();
   if(figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {

    var emissive = vec4(0, 0, 0, 0);
    gl.uniform4fv( gl.getUniformLocation(program,  "emissive"),flatten(emissive) );

    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(sNormals), gl.STATIC_DRAW );

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sPoints), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereTexCoordsArray), gl.STATIC_DRAW)

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoHeight, torsoWidth, torsoWidth));

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for( var i=0; i<index; i+=3) gl.drawArrays( gl.TRIANGLES, i, 3 );
}

function head() {

    var emissive = vec4(0, 0, 0, 0);
    gl.uniform4fv( gl.getUniformLocation(program,  "emissive"),flatten(emissive) );

    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(sNormals), gl.STATIC_DRAW );

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sPoints), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereTexCoordsArray), gl.STATIC_DRAW)

    instanceMatrix = mult(modelViewMatrix, translate(-torsoHeight, -0.5 * headWidth, 0.0 ));
    instanceMatrix = mult(instanceMatrix, scale4(headWidth, headWidth, headWidth) );

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for( var i=0; i<index; i+=3) gl.drawArrays( gl.TRIANGLES, i, 3 );
}

function leftLeg1() {

    var emissive = vec4(0, 0, 0, 0);
    gl.uniform4fv( gl.getUniformLocation(program,  "emissive"),flatten(emissive) );

    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cNormals), gl.STATIC_DRAW );

    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cPoints), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeTexCoordsArray), gl.STATIC_DRAW)

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 *legHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(legWidth, legHeight, legWidth) );

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLeg2() {

    var emissive = vec4(0, 0, 0, 0);
    gl.uniform4fv( gl.getUniformLocation(program,  "emissive"),flatten(emissive) );

    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cNormals), gl.STATIC_DRAW );

    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cPoints), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeTexCoordsArray), gl.STATIC_DRAW)

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * legHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(legWidth, legHeight, legWidth) );

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLeg1() {

    var emissive = vec4(0, 0, 0, 0);
    gl.uniform4fv( gl.getUniformLocation(program,  "emissive"),flatten(emissive) );

    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cNormals), gl.STATIC_DRAW );

    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cPoints), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeTexCoordsArray), gl.STATIC_DRAW)

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * legHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(legWidth, legHeight, legWidth) );

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLeg2() {

    var emissive = vec4(0, 0, 0, 0);
    gl.uniform4fv( gl.getUniformLocation(program,  "emissive"),flatten(emissive) );

    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cNormals), gl.STATIC_DRAW );


    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cPoints), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeTexCoordsArray), gl.STATIC_DRAW)

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * legHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(legWidth, legHeight, legWidth) );

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftEar() {

    var emissive = vec4(0, 0, 0, 0);
    gl.uniform4fv( gl.getUniformLocation(program,  "emissive"),flatten(emissive) );

    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(sNormals), gl.STATIC_DRAW );

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sPoints), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindTexture( gl.TEXTURE_2D, texture0 );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereTexCoordsArray), gl.STATIC_DRAW)

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headWidth, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(earWidth, earHeight, 0.5) );

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for( var i=0; i<index; i+=3) gl.drawArrays( gl.TRIANGLES, i, 3 );
}

function rightEar() {

    var emissive = vec4(0, 0, 0, 0);
    gl.uniform4fv( gl.getUniformLocation(program,  "emissive"),flatten(emissive) );

    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(sNormals), gl.STATIC_DRAW );

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sPoints), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindTexture( gl.TEXTURE_2D, texture0 );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereTexCoordsArray), gl.STATIC_DRAW)

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * headWidth, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(earWidth, earHeight, 0.5) );

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for( var i=0; i<index; i+=3) gl.drawArrays( gl.TRIANGLES, i, 3 );
}

function tail() {

    var emissive = vec4(0, 0, 0, 0);
    gl.uniform4fv( gl.getUniformLocation(program,  "emissive"),flatten(emissive) );

    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(sNormals), gl.STATIC_DRAW );

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sPoints), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindTexture( gl.TEXTURE_2D, texture0 );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereTexCoordsArray), gl.STATIC_DRAW)

    instanceMatrix = mult(modelViewMatrix, translate(0.0, torsoWidth , 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(tailWidth, tailHeight, tailWidth) );

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for( var i=0; i<index; i+=3) gl.drawArrays( gl.TRIANGLES, i, 3 );
}

function snout() {

    var emissive = vec4(0, 0, 0, 0);
    gl.uniform4fv( gl.getUniformLocation(program,  "emissive"),flatten(emissive) );

    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(sNormals), gl.STATIC_DRAW );

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sPoints), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindTexture( gl.TEXTURE_2D, texture0 );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereTexCoordsArray), gl.STATIC_DRAW)

    instanceMatrix = mult(modelViewMatrix, translate(0.0, snoutWidth , 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4(snoutWidth, snoutHeight, snoutWidth) );

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for( var i=0; i<index; i+=3) gl.drawArrays( gl.TRIANGLES, i, 3 );
}

function floor()
{

    var emissive = vec4(0, 0, 0, 0);
    gl.uniform4fv( gl.getUniformLocation(program,  "emissive"),flatten(emissive) );

    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cNormals), gl.STATIC_DRAW );

    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cPoints), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeTexCoordsArray), gl.STATIC_DRAW)

    instanceMatrix = mult(modelViewMatrix, translate(0.0, -16.5, 0.-2) );
    instanceMatrix = mult(instanceMatrix, scale4(30, 30, 30) );

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}


function quad(a, b, c, d) {

    var norm = cross(subtract(vertices[b], vertices[a]), subtract(vertices[c], vertices[b]));
    norm = normalize(vec3(norm));

    cPoints.push(vertices[a]);
    cPoints.push(vertices[b]);
    cPoints.push(vertices[c]);
    cPoints.push(vertices[d]);

    cNormals.push(norm);
    cNormals.push(norm);
    cNormals.push(norm);
    cNormals.push(norm);

    cubeTexCoordsArray.push(texCoord[0]);
    cubeTexCoordsArray.push(texCoord[1]);
    cubeTexCoordsArray.push(texCoord[2]);
    cubeTexCoordsArray.push(texCoord[3]);
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


function triangle(a, b, c) {

    sPoints.push(a);
    sPoints.push(b);
    sPoints.push(c);

    sNormals.push(a);
    sNormals.push(b);
    sNormals.push(c);

    sphereTexCoordsArray.push(a);
    sphereTexCoordsArray.push(b);
    sphereTexCoordsArray.push(c);

    index += 3;

}

function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        // normalize 3d vector
        ab = normalize(ab, false);
        ac = normalize(ac, false);
        bc = normalize(bc, false);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

function legMovement()
{
    if (legDir)
    {
        theta[2] += 5
        theta[5] += 5
        theta[3] -= 5
        theta[4] -= 5

        if (theta[2] > 200)
        {

            legDir = false
            if (canPlay)
            {
            	aud.play();
            }
        }
    }
    else
    {
        theta[2] -= 5
        theta[5] -= 5
        theta[3] += 5
        theta[4] += 5
        if (theta[2] < 160)
        {
            legDir = true
            if (canPlay)
            {
            	aud.play();
            }
        }
    }
}

function earMovement()
{
    if (earDir)
    {
        theta[6] += 5
        theta[7] -= 5
        if (theta[6] > 220)
            earDir = false
    }
    else
    {
        theta[6] -= 5
        theta[7] += 5
        if (theta[6] < 180)
            earDir = true
    }
}

function tailMovement()
{
    if (tailDir)
    {
        theta[8] += 5
        if (theta[8] > 30)
            tailDir = false
    }
    else
    {
        theta[8] -= 5
        if (theta[8] < -30)
            tailDir = true
    }

}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program );

    perspProj.aspect =  canvas.width/canvas.height;

    instanceMatrix = mat4();

    projectionMatrix = perspective(perspProj.fov, perspProj.aspect, perspProj.near, perspProj.far);
    modelViewMatrix = lookAt(eye, at , up);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix) );

    cube()

    tetrahedron(va, vb, vc, vd, 6);

    nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);

    vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cPoints), gl.STATIC_DRAW);


    vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeTexCoordsArray), gl.STATIC_DRAW)

    vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    gl.uniform4fv( gl.getUniformLocation(program, "ambient"),flatten(lighting.ambient) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuse"),flatten(lighting.diffuse) );
    gl.uniform4fv( gl.getUniformLocation(program, "specular"),flatten(lighting.specular) );
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lighting.position) );

    getIm0();

    document.getElementById("toggle").onclick = function(){
       moving = !(moving);
    };

    document.getElementById("audio").onclick = function(){
    	aud.play().then(() => { 
    		aud.pause();
    		canPlay = !canPlay;
  		});
    };

    for(i=0; i<10; i++) initNodes(i);

    render();
}

function getIm0()
{
    image0.src = 'texture0.jpg';
    image0.onload = function() {
       getIm1();
    }
}

function getIm1()
{
    image1.src = 'texture1.jpg';
    image1.onload = function() {
       getIm2();
    }
}

function getIm2()
{
    image2.src = 'texture2.jpg';
    image2.onload = function() {
        configureIm();
    }
}
function configureIm()
{
    texture0 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture0 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image0 );


    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                    gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    //--------------------------------------------------------------------------
    texture1 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture1 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image1 );


    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                    gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    //--------------------------------------------------------------------------
    texture2 = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture2 );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image2 );


    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                    gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
}

var render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (moving)
    {
        theta[torsoId] = ( theta[torsoId] + 5 ) 
        legMovement();
        earMovement();
        tailMovement();
        for (x = 0; x < 10; x += 1)
        	initNodes(x);
    }

    traverse(torsoId);
    floor();
    requestAnimFrame(render);
}
