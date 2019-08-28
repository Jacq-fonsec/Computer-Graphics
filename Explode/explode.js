/*
Date: Jan 28, 2019

Description: 
This program creates an explosion out of shapes, where there is core figure that remains stationary and does not change in color. 
The other shapes expand outwards and change to white gradually. For this program, I created a dog, where the head is the core.
*/

var canvas;
var gl;

//store the vertices
//Each triplet represents one triangle
var vertices = [];

//store a color for each vertex
var colors = [];

//control the explosion 
var explode = 0.0;
var explodeLoc;

//control the redraw rate
var delay = 20;

// =============== function init ======================
 
// When the page is loaded into the browser, start webgl stuff
window.onload = function init()
{
	// notice that gl-canvas is specified in the html code
    canvas = document.getElementById( "gl-canvas" );
    
	// gl is a canvas object
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	// Track progress of the program with print statement
    console.log("Opened canvas");
        
    
    // Define  data for object 
	// See HW specs for number of vertices and parts required
	// Recommendation: each set of three points corresponds to a triangle.
	// DCH: I have used sval for scaling the object size if I am not
	// happy with my initial design. (Just an idea for you; no need to use.)
	//(During the explosion all geometry must remain in the window.)
    //
	var sval = 0.3 

	//CORE
	//vertices 0 - 53
	for (var degree = 0; degree <= 340; degree += 20)
	{
		var radian1 = (degree * Math.PI / 180);
		var radian2 = ((degree + 20)* Math.PI / 180);
		vertices.push(
			vec2(0,0),
			vec2(sval * Math.sin(radian1), sval * Math.cos(radian1)),
			vec2(sval * Math.sin(radian2), sval * Math.cos(radian2)))
	};

	//RIGHT WHISKERS
	//vertices 54 - 62
	vertices.push(
		vec2(-sval * 1.8, 0),
		vec2(-sval * 0.8, -.01),
		vec2(-sval * 0.8, .01),

		vec2(-sval * 1.8, .05),
		vec2(-sval * 0.8, -.01),
		vec2(-sval * 0.8, .01),

		vec2(-sval * 1.8, -.05),
		vec2(-sval * 0.8, -.01),
		vec2(-sval * 0.8, .01)
	);

	//LEFT WHISKERS
	//vertices 63 - 71
	vertices.push(
		vec2(sval * 1.8, 0),
		vec2(sval * 0.8, -.01),
		vec2(sval * 0.8, .01),

		vec2(sval * 1.8, .05),
		vec2(sval * 0.8, -.01),
		vec2(sval * 0.8, .01),

		vec2(sval * 1.8, -.05),
		vec2(sval * 0.8, -.01),
		vec2(sval * 0.8, .01)
	);

	//RIGHT EAR
	//vertices 72 - 77
	vertices.push(
		vec2(-sval * 1.3, sval * 1.4),
		vec2(-sval * 1.0, sval * 0.2),
		vec2(-sval * 0.55, sval * 0.9),

		vec2(-sval * 1.2, sval * 1.2),
		vec2(-sval * 0.95, sval * 0.3),
		vec2(-sval * 0.6, sval * 0.8)
	);

	//LEFT EAR
	// vertices 78 - 83
	vertices.push(
		vec2(sval * 1.3, sval * 1.4),
		vec2(sval * 1.0, sval * 0.2),
		vec2(sval * 0.55, sval * 0.9),

		vec2(sval * 1.2, sval * 1.2),
		vec2(sval * 0.95, sval * 0.3),
		vec2(sval * 0.6, sval * 0.8)
	);

	//Collar
	var cval = 0.075;

	for (var degree = 0; degree <= 340; degree += 20)
	{
		var radian1 = (degree * Math.PI / 180);
		var radian2 = ((degree + 20)* Math.PI / 180);


		vertices.push(
			vec2(0.0, -0.3),
			vec2(cval * Math.sin(radian1), cval * Math.cos(radian1) - 0.3),
			vec2(cval * Math.sin(radian2), cval * Math.cos(radian2) - 0.3))
	};

	// Create colors for the core and outer parts
	// See HW specs for the number of colors needed
	for(var i=0; i < vertices.length; i++) {
		if (i <	54 || (i >= 72 && i < 75) || (i >= 78 && i < 81)) //brown
			colors.push(vec3(0.627, 0.49, 0.294));
		else if (i >= 54 && i < 72) //black
			colors.push(vec3(0.47, 0.47, 0.47));
		else if ((i >= 75 && i < 78) || (i >= 81 && i < 84))
			colors.push(vec3(0.941, 0.373, 0.47)) //pink
		else
			colors.push(vec3(0.98, 0.784, 0.333))
	};
	
	// Print the input vertices and colors to the console
	console.log("Input vertices and colors:");
	 
	console.log(vertices);
	console.log(colors);

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
	// Background color to white
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Define shaders to use  
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
	//
	// color buffer: create, bind, and load
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
	
	// Associate shader variable for  r,g,b color
	var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    // vertex buffer: create, bind, load
    var vbuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vbuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate shader variables for x,y vertices	
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	//associate shader explode variable ("Loc" variables defined here) 
    explodeLoc = gl.getUniformLocation(program, "explode");

    console.log("Data loaded to GPU -- Now call render");

    render();
};


// =============== function render ======================

function render()
{
    // clear the screen 
    gl.clear( gl.COLOR_BUFFER_BIT );
	
    //CORE
    gl.uniform1f(explodeLoc, 0);
  	gl.drawArrays(gl.TRIANGLES, 0, 54);

	// send uniform(s) to vertex shader
	explode += .005;
	gl.uniform1f(explodeLoc, explode);
	
    gl.drawArrays( gl.TRIANGLES, 54, 84 ); 
	
	//re-render after delay
	setTimeout(function (){requestAnimFrame(render);}, delay);
}

