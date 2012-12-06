var gl;
var gl_program;
var gl_program_loc = {};
var mvmat, projmat, nmat;
var vbo;
var lineIndices;
var triIndices;
var line = false;
var lighting = true;
var zoomval = 1.0;
var controller;

/**
 * Reads in a model .data file and initializes all buffers with 
 * the contained data.
 * @param fileText String source of the .data file
 */
function readDataFile(fileText) {
    // Split the file text into individual lines
    var lines = fileText.split(/\r\n|\r|\n/);
    
    // Initialize some arrays to keep track of vertices, line 
    // indices, and triangle indices
    var vertices = [];
    var linds = [];
    var trinds = [];
    
    // Loop through each line
    for( var i = 0; i < lines.length; ++i ) {
        // Split the line by whitespace
        var tokens = lines[i].split(" ");
        
        // If there weren't 3 tokens on the line, we don't care about it
        if( tokens.length !== 3 ) {
            continue;
        }
        
        // If there were, we have a new vertex, update all arrays
        linds.push( linds.length );
        if( ((vertices.length / 3) + 1) % 4 !== 0 ) {
            trinds.push( vertices.length / 3 );
        }
        vertices.push( tokens[0], tokens[1], tokens[2] );
    }
    
    // Bind and set the data of the vbo
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    vbo.length = vertices.length;
    
    // Bind and set the data of the lineIndices buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIndices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(linds), gl.STATIC_DRAW);
    lineIndices.length = linds.length;
    
    // Bind and set the data of the triangle Indices buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triIndices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(trinds), gl.STATIC_DRAW);
    triIndices.length = trinds.length;
    
    // Finally, display the results of the computation
    display();
}

/**
 * Initializes all variables, shaders, and WebGL options 
 * needed for this program.
 */ 
function init() {
    // Set the clear color to fully transparent black
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    
    // Create the model-view matrix and projection matrix
    mvmat = mat4.create();
    projmat = mat4.create();
    nmat = mat3.create();
    
    // Create all buffer objects and reset their lengths
    vbo = gl.createBuffer();
    lineIndices = gl.createBuffer();
    triIndices = gl.createBuffer();
    vbo.length = 0;
    lineIndices.length = 0;
    
    // Initialize the shaders
    initShaders();
    
    // Reshape the canvas, and setup the viewport and projection
    reshape();
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
    gl_program_loc.uMVMatrix = gl.getUniformLocation(gl_program, "uMVMatrix");
    gl_program_loc.uPMatrix  = gl.getUniformLocation(gl_program, "uPMatrix");
    gl_program_loc.uNMatrix  = gl.getUniformLocation(gl_program, "uNMatrix");
    gl_program_loc.uColor    = gl.getUniformLocation(gl_program, "uColor");
    gl_program_loc.uLighting = gl.getUniformLocation(gl_program, "uLighting");
    gl_program_loc.aPosition = gl.getAttribLocation(gl_program, "aPosition");
}

/**
 * Reshape function, reshapes the WebGL viewport and sets up the 
 * projection matrix based on current zoom level.
 */
var reshape = function() {
    // Get the WebGl canvas
    var canvas = document.getElementById('c');
    
    // Resize the canvas based on the window size
    canvas.width = document.body.clientWidth - 22;
    canvas.height = document.body.clientHeight - 22;
    
    // Set the WebGL viewport based on this new width and height
    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    
    // Get the aspect ratio, and use this to setup the projection matrix
    var aspect_ratio = canvas.width / canvas.height;
    mat4.ortho((-1.0 * aspect_ratio / zoomval), (1.0 * aspect_ratio / zoomval), 
        -1.0 / zoomval, 1.0 / zoomval, -10.0, 10.0, projmat);
        
    // Display the new scene
    display();
}

/**
 * Display function, sets up various matrices, binds data to the GPU,
 * and displays it.
 */
function display() {
    // Clear the color buffer
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    
    // Set the model-view matrix to the current CameraController rotation
    quat4.toMat4( controller.currentOrientation, mvmat );
    
    // Get the normal matrix from the model-view matrix (for lighting)
    mat4.toInverseMat3( mvmat, nmat );
    mat3.transpose( nmat );
    
    // Use the created shader program
    gl.useProgram(gl_program);
    
    // Upload the projection matrix and the model-view matrix to the shader
    gl.uniformMatrix4fv(gl_program_loc.uPMatrix,  false, projmat);
    gl.uniformMatrix4fv(gl_program_loc.uMVMatrix, false, mvmat);
    gl.uniformMatrix3fv(gl_program_loc.uNMatrix,  false, nmat);
    gl.uniform3fv(gl_program_loc.uColor, new Float32Array([0.5, 0.5, 0.5]));
    gl.uniform1i(gl_program_loc.uLighting, lighting ? 1 : 0 );
    
    // If there is a model loaded
    if( vbo.length > 0 ) {
        // Bind vbo to be the current array buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        
        // Enables a vertex attribute array for vertex positions
        gl.enableVertexAttribArray(gl_program_loc.aPosition);
        
        // Setup the pointer to the position data
        gl.vertexAttribPointer(gl_program_loc.aPosition, 3, gl.FLOAT, false, 12,  0);
        
        if( line ) {
            // Bind lineIndices to be the current index array buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lineIndices);
            
            // Finally, draw the data as lines using all of the current settings
            gl.drawElements(gl.LINE_LOOP, lineIndices.length, gl.UNSIGNED_SHORT, 0);
        } else {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triIndices);
            gl.drawElements(gl.TRIANGLES, triIndices.length, gl.UNSIGNED_SHORT, 0);
        }
    }
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
    
    // Setup the window's resize function
    window.onresize = reshape;
    
    // On key presses, zoom in or out
    window.onkeydown = function(event) {
        // If '+' is pressed, zoom in, '-' zoom out
        if( event.keyCode == 107 || event.keyCode == 187 ) {
            zoomval += 0.1;
            reshape();
        } else if( event.keyCode == 109 || event.keyCode == 189 ) {
            zoomval -= 0.1;
            reshape();
        }
    }
    
    // Set the drag over function,
    c.ondragover = function () { 
        // This changes the appearance of the canvas to notify the 
        // user that something is being dragged over it
        this.className = 'hover'; 
        return false; 
    };
    
    // Set the drag end function
    c.ondragend = function () { 
        // This resets the appearance of the canvas to notify the
        // user the drag event has ended
        this.className = ''; 
        return false; 
    };
    
    // Set the on drop function to actually load in the drag and
    // dropped data file
    c.ondrop = function (e) {
        this.className = '';
        e.preventDefault();
        
        // Get the dragged file, and create a new FileReader object
        var file = e.dataTransfer.files[0],
          reader = new FileReader();
          
        // Set the onload function called when the file is fully loaded
        reader.onload = function (event) {
            // Read in the file and display the specified model
            readDataFile(event.target.result);
        };
        
        // Finally, start reading in the file, when finished, the onload
        // function will be called
        reader.readAsText(file);

        return false;
    };
    var wf = document.getElementById('wireframe');
    var wft = document.getElementById('wireframe-text');
    wf.onclick = function(e) {
        e.preventDefault();
        line = !line;
        wf.className = line ? 'wire' : 'solid'; 
        wft.innerHTML = line ? 'Wireframe Mode' : 'Solid Mode';
        display();
    }
    var lg = document.getElementById('lighting');
    var lgt = document.getElementById('lighting-text');
    lg.onclick = function(e) {
        e.preventDefault();
        lighting = !lighting;
        lg.className = lighting ? 'light' : 'nolight'; 
        lgt.innerHTML = lighting ? 'Lighting Enabled' : 'Lighting Disabled';
        display();
    }

    // Initialize a new camera controller that draws the scene
    // on an update
    controller = new CameraController(c);
    controller.onchange = display;
    
    // Initialize all variables and display the scene
    init();
    display();
}   
