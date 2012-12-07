var gl;
var gl_program;
var gl_program_loc = {};
var vbo;
var indices;
var mvmat;
var yrot = 0;


function update( time ) {
    // Setup another request
    requestId = requestAnimFrame( update );
    draw();
}

/**
 * Initializes all variables, shaders, and WebGL options 
 * needed for this program.
 */ 
function init() {
    // Set the clear color to fully transparent black
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
    // Create the two buffer objects
    vbo = gl.createBuffer();
    indices = gl.createBuffer();
    mvmat = mat4.create();
    
    // Bind the vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.depthRange( 10.0, 10.0 );
    
    // Put 4 vertices of a tetrahedron in the VBO
    var vertices = new Float32Array([ -0.5, -0.5,  0.5, 
                                       0.5, -0.5,  0.5,  
                                       0.0,  0.5,  0.0,  
                                       0.0, -0.5, -0.5 ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    // Bind and set the data of the lineIndices buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,3,0,1]), gl.STATIC_DRAW);
    
    
    // Initialize the shaders
    initShaders();
}

/**
 * Loads and compiles a given shader as the given type.
 * @param type WebGL shader type to load (gl.VERTEX_SHADER | gl.FRAGMENT_SHADER)
 * @param shaderSrc String source of the shader to load
 * @return Fully compiled shader, or null on error
 */
function loadShader(type, shaderSrc) {
    var shader = gl.createShader(type);
    
    // Load the shader source
    gl.shaderSource(shader, shaderSrc);
    
    // Compile the shader
    gl.compileShader(shader);
    
    // Check the compile status
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) &&
        !gl.isContextLost()) {
        var infoLog = gl.getShaderInfoLog(shader);
        window.console.log("Error compiling shader:\n" + infoLog);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

/**
 * Initializes the shaders used for the program
 */
function initShaders() {
    // Load the shaders and compile them (shaders are located in the HTML)
    var vertexShader   = loadShader(   gl.VERTEX_SHADER, document.getElementById('vshader').innerHTML );
    var fragmentShader = loadShader( gl.FRAGMENT_SHADER, document.getElementById('fshader').innerHTML );
    
    // Create the program object
    var programObject = gl.createProgram();
    gl.attachShader(programObject, vertexShader);
    gl.attachShader(programObject, fragmentShader);
    gl_program = programObject;
    
    // link the program
    gl.linkProgram(gl_program);
    
    // verify link
    var linked = gl.getProgramParameter(gl_program, gl.LINK_STATUS);
    if( !linked && !gl.isContextLost()) {
        var infoLog = gl.getProgramInfoLog(gl_program);
        window.console.log("Error linking program:\n" + infoLog);
        gl.deleteProgram(gl_program);
        return;
    }
    
    // Get the uniform/attribute locations
    gl_program_loc.aPosition = gl.getAttribLocation(gl_program, "aPosition");
    gl_program_loc.uColor = gl.getUniformLocation(gl_program, "uColor");
    gl_program_loc.uMVmat = gl.getUniformLocation(gl_program, "uMVmat");
}

/**
 * Display function, sets up various matrices, binds data to the GPU,
 * and displays it.
 */
function draw() {
    // Clear the color buffer
    gl.clear( gl.COLOR_BUFFER_BIT );
    
    // Set mvmat to the proper rotation
    mat4.identity( mvmat );
    mat4.translate( mvmat, vec4.create([0.0,0.0,0.0,0.0]), mvmat );
    mat4.rotateY( mvmat, yrot, mvmat );
    yrot += 0.01;
    if ( yrot >= 2 * Math.PI  ) {
        yrot -= 2 * Math.PI;
    }
    
    // Use the created shader program
    gl.useProgram(gl_program);
    
    // Send color uniform to the shader:
    gl.uniform4fv(gl_program_loc.uColor, new Float32Array([ 0.0, 1.0, 0.0, 1.0 ]));
    gl.uniformMatrix4fv( gl_program_loc.uMVmat, false, mvmat );

    // Bind vbo to be the current array buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        
    // Enables a vertex attribute array for vertex positions
    gl.enableVertexAttribArray(gl_program_loc.aPosition);
    
    // Setup the pointer to the position data
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
    gl.vertexAttribPointer(gl_program_loc.aPosition, 3, gl.FLOAT, false, 12,  0);
    gl.drawElements(gl.TRIANGLE_STRIP, 6, gl.UNSIGNED_SHORT, 0);
}

/**
 * Entry point of the application.
 */
function main() {
    // Get the WebGL canvas, and initialize WebGL
    var c = document.getElementById('c');
    gl = WebGLUtils.setupWebGL( c );
    
    // Escape on any error
    if(!gl) {
        return;
    }
    
    // Initialize all variables and display the scene
    init();

    // Draw the scene
    requestId = requestAnimFrame( update );
} 
