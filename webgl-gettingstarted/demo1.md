Getting Started - Your First WebGL Program
------------------------------------------

Computer graphics is inherently a huge, complex, and complicated topic with a wide reaching span of uses.  It is commonly used in television and movies to create special effects, often showing spectacular new environments that we cannot find on our own planet, different lifeforms so alien to us it would be hard to imagine them without seeing, or making an action scene even more intense with huge explosions sending objects flying around the screen.  Video games use graphics to give life to characters for the player to interact with, create fantastical enviroments for players to explore, and make the player feel more engaged by making the small details in the world seem that much more believable and real.  The Air Force may use computer graphics to visualize complex sets of information in a palatable way so that decisions that depend on this data can be made more quickly.  Hospitals use computer graphics to visualize results of an MRI or CAT scan to make diagnosing a patient much easier.  Every year SIGGRAPH hosts a conference drawing researchers world wide to gather and discuss new techniques and findings to further our understanding of creating realistic graphics with computers.  We'll start our foray into this vast area of research by drawing a red triangle.

To begin, we'll look at the code to accomplish this highly complex task.  Don't be intimidated by by the large amount of code in the first example, most of it is very simple, but necessary tasks and we'll go through the program section by section to examine what it does:

    // Javascript source file
    var gl;
    var gl_program;
    var gl_program_loc = {};
    var vbo;
    var indices;

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
    
        // Bind the vertex buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    
        // Put 3 vertices of a triangle in the VBO
        var vertices = new Float32Array([-0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.0,  0.5, 0.0]);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
        // Bind and set the data of the lineIndices buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2]), gl.STATIC_DRAW);
    
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
    }

    /**
     * Display function, sets up various matrices, binds data to the GPU,
     * and displays it.
     */
    function draw() {
        // Clear the color buffer
        gl.clear( gl.COLOR_BUFFER_BIT );
    
        // Use the created shader program
        gl.useProgram(gl_program);

        // Bind vbo to be the current array buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        
        // Enables a vertex attribute array for vertex positions
        gl.enableVertexAttribArray(gl_program_loc.aPosition);
    
        // Setup the pointer to the position data
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
        gl.vertexAttribPointer(gl_program_loc.aPosition, 3, gl.FLOAT, false, 12,  0);
        gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);
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
        draw();
    } 


Vertex Shader

    attribute vec3 aPosition;

    void main() {
        gl_Position = vec4(aPosition, 1.0);
    }

Fragment Shader

    precision mediump float;

    void main() {
        gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
    }

These 100+ lines of code are responsible for drawing a simple red triangle in the center of our canvas.  It may seem hard to believe that all of this is necessary for such a simple task, but we'll go through each part of it to see how it works and why each part is necessary.  You may have also noticed that there are not 1 but 3 separate code files being used here, the second two being *shaders*.  We'll learn more about shaders later, but for now it sufficient to know that shaders are code that the graphics card runs, whereas the Javascript code we'll write is what the CPU runs.

Typically, all of our WebGL programs will start in the `main` function of our Javascript code, so that's where we'll start our analysis:

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
        draw();
    }

Because WebGL displays its content in an HTML5 `<canvas>` element, our first order of business is retrieving the `canvas` from the HTML DOM tree.  For now, the HTML markup is ommitted, but if we have a `canvas` like the following:

    <canvas id='c'></canvas>

This can be obtained by the Javascript code:

    var c = document.getElementById('c');


Once we have retrieved this `canvas`, we have to initialize WebGL on this `canvas`.  This is where the second line of our `main` function comes in, and where things get a little tricky:

    gl = WebGLUtils.setupWebGL( c );

This line does more than it seems at first.  If we take a look at the official WebGL specification, we can see that we should be able to initialize a WebGL context on our `canvas c` by the following line of code:

    gl = c.getContext('webgl');

This calls `getContext` on our `canvas`, letting it know that we want a WebGL context.  In a perfect world, this is all we would need to do, but unfortunately before the official WebGL spec was published, forward thinking browsers like Chrome, Firefox, and Safari implemented their own versions of prerelease WebGL.  Because they were custom implementations, and the final `'webgl'` context was not confirmed yet, several other context names were developed; Firefox used `'moz-webgl'`, the webkit family (Chrome and Safari) used `'webkit-3d'` or `'experimental-webgl'` (in fact, my version of Chrome is still using `'experimental-webgl'`.  Because of this, to guarantee that a WebGL context is initialized, we have to try all possible tags to be compatible with all supporting browsers (yay web technologies).  While this is a hassle, Google wrote a short Javascript code called `WebGLUtils` to encapsulate this initialization into a function (you can find the source for `WebGLUtils` [here](http://code.google.com/p/webglsamples/source/browse/book/webgl-utils.js?r=41401f8a69b1f8d32c6863ac8c1953c8e1e8eba0).  I use this function here to initialize the WebGL context, and I would suggest using it for all WebGL projects to guarantee compatibility.  Theoretically, we'll eventually be able to use `c.getcontext('webgl')` but I don't believe that time has arrived yet.

Next, we ensure that the context was properly initialized.  If the user's browser does not support WebGL, the `setupWebGL` function will return a null context.  So, we can check that the context variable `gl` is non-null to verify that a context exists before calling WebGL functions, we wouldn't want to try calling functions on a `null` variable now would we?  Finally, we call two of our defined functions `init()`, which does some WebGL initialization and creation of our triangle, and `draw()`, which draws our scene.

`init()` - Shaders, Vertices, and Buffers, Oh My!
-------------------------------------------------

Now that we've created a WebGL context in the `canvas`, we have to do some setup before we can begin drawing.  We do all of this ground work in the `init()` function below:

    function init() {
        // Set the clear color to fully transparent black
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
    
        // Create the two buffer objects
        vbo = gl.createBuffer();
        indices = gl.createBuffer();
    
        // Bind the vertex buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    
        // Put 3 vertices of a triangle in the VBO
        var vertices = new Float32Array([-0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.0,  0.5, 0.0]);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
        // Bind and set the data of the lineIndices buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2]), gl.STATIC_DRAW);
    
        // Initialize the shaders
        initShaders();
    }
    
At first glance, there's a lot more going on here than in the startup function, and we're finally getting into some real WebGL specific code.  Even though this particular function isn't very long, it introduces many important concepts in graphics, so it's important to go through this slowly.

First things first, we call the function `clearColor` using our global WebGL context, `gl`, that we initialized in the main function:

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

We call this function to let WebGL know what color it should set the canvas to when we clear the screen.  This will come into play in the `draw` function before the triangle is rendered.  The color set in the function is specified as 4 floats representing red, green, blue, and alpha respectively.  An RGB value of `[1.0, 1.0, 1.0]` is equivalent to white, and an alpha value of `1.0` means that the color is fully opaque.  When the canvas is cleared, the entire canvas will become an opaque white.  (If you didn't understand how the color was specified, don't worry!  This will be covered in more detail in the next lesson.)

The next chunk of code creates the triangle that will eventually be drawn onto the canvas:

    // Create the two buffer objects
    vbo = gl.createBuffer();
    indices = gl.createBuffer();
    
    // Bind the vertex buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    
    // Put 3 vertices of a triangle in the VBO
    var vertices = new Float32Array([-0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.0,  0.5, 0.0]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    // Bind and set the data of the lineIndices buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2]), gl.STATIC_DRAW);

In order to create the triangle, we have to specify the vertices that make up the triangle, and send this data to the graphics card so that we can draw it.  This seems overly complicated, but as we'll see it affords a lot of advantages especially as drawing tasks get increasingly complex.  Thankfully, sending just triangle data is easy enough.

In order to send vertex data to graphics card, we can follow a few simple steps:

1.  Create a vertex buffer and an index buffer.  The vertex buffer will store the raw vertex positions, and the index buffer will store indices of the vertex buffer, telling the graphics card which vertices to draw in what order.  Initialization of these buffers can be done by:
    
        vbo = gl.createBuffer();
        indices = gl.createBuffer();

    Each call to `gl.createBuffer()` creates a buffer on the graphics card, and returns the id of the created buffer.  We don't have direct access to the buffer objects, instead this id is used to tell the graphics card which buffer to work with.

2.  Next, we bind a buffer and assign data to it.  As discussed in part 1, first the buffer must be bound by its id:

        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    
    All subsequent calls that modify a buffer will now modify the buffer with id `vbo` until we call `bindBuffer` with a different buffer id.  

3.  Finally, to actually assign data to the buffer, the data must first be created.  In our example, the data is created by creating a vertex array with the vertices of the triangle:

        var vertices = new Float32Array([-0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.0,  0.5, 0.0]);

    An astute reader will notice that unlike typical JavaScript `vars`, an actual data type is needed on the graphics card so a Float32Array is constructed as opposed to a normal JavaScript array.  This array contains 9 floats, 3 per vertex of the form `(x,y,z)`.  Since the triangle will eventually be drawn in 2D, the `z` component of each vertex is set to `0.0`.  In 2 dimensions, the points that make up the triangle are the points `(-0.5, -0.5), (0.5,-0.5),` and `(0.0, 0.5)`.  This data can be stored in the currently bound buffer by calling `gl.bufferData`:

        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    The first argument to this function specifies whether the data is for an `ARRAY_BUFFER` or for an `ELEMENT_ARRAY_BUFFER`.  The former is used when specifying vertex data, while the latter is used for specifying index data.  The second argument is the data to store in the buffer, typically `Float32Array` for vertices and `Uint16Array` or `Uint8Array` for an element array.  Finally, the third argument specifies that the data will not be changed.  And that's it!  With those simple function calls the buffer has been created, and data has been stored in it.  This process is very important to understand and will be used often within graphics programs.

    To store data in the index array, the same steps are followed:

        // Bind and set the data of the lineIndices buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2]), gl.STATIC_DRAW);

    In this case, the index array stores the indices `[0,1,2]`.  Later, when the triangle is drawn, these will refer to the first, second, and third vertices in the vertex buffer.  Using an index buffer like this enables us to very easily re-use vertices when drawing complex objects simply by referring to the repeated vertex's index.  More on this later.

Finally, the `init()` function calls a function to load in the shaders:

    initShaders();

This introduces the topic of *shaders*, which was an incredibly important topic in graphics that we'll be covering in great depth in a few lessons.  For now, it is sufficient to understand how to compile and load them in.

With that in mind, let's take a look at the `initShaders` function:

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
    }

First, we call a function listed in the original source code post called `loadShader`, and pass in the type of shader `VERTEX` or `FRAGMENT` along with the shader source (which is stored in the HTML.  This load shader function creates and compiles the shaders for us, and performs clean up and returns `null` if the compilation failed for some reason.  Next, we create a program object for our shaders, attach each compiled shader, and store the program object in a global variable `gl_program`.  Next, this program is linked with the WebGL instance, which, if successful, creates the binaries of the shaders in the program.  Once the program's link has been verified, the shaders are reaedy to use!  Finally, we retrieve the location of an attribute used in the shader, `aPosition`, which will be used to store our vertex position data.  Remember, shaders will be covered in greater depth soon, so don't worry if this is a little overwhelming or confusing.  With that bit covered, initialization has been completed!  Our scene can now be drawn!

`draw()` - Rendering the Triangle
---------------------------------
A lot has been accomplished thus far; we've initialized a WebGL context and set it's viewport, we've set a clear color, loaded vertex/index data to buffers and sent them off to the graphics card, and we've compiled and loaded in some shaders that will control how the scene is drawn, all that's left is to finally draw the scene.  This is done in the `draw()` function previously called in `main()`.  Let's see how it works:

    function draw() {
        // Clear the color buffer
        gl.clear( gl.COLOR_BUFFER_BIT );
    
        // Use the created shader program
        gl.useProgram(gl_program);

        // Bind vbo to be the current array buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        
        // Enables a vertex attribute array for vertex positions
        gl.enableVertexAttribArray(gl_program_loc.aPosition);
    
        // Setup the pointer to the position data
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
        gl.vertexAttribPointer(gl_program_loc.aPosition, 3, gl.FLOAT, false, 12,  0);
        gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);
    }

First off, we call the `clear` function of the WebGL context, which clears the specified buffer.  The argument passed in is the `COLOR_BUFFER_BIT`, which let's WebGL know to clear the color buffer only.  As you may have guessed, it clears it to the color we specified in `init` using `clearColor`, fully opaque white!  Other possible values to clear are `DEPTH_BUFFER_BIT` and `STENCIL_BUFFER_BIT` which clear the depth buffer and stencil buffer respectively.  Similar to the color buffer, each of these buffers' clear value can be user set using `clearDepth( float )` and `clearStencil( int )`, and we'll see exactly what these buffers can be used for later.

Next up, we use the program that was created in `initShaders`.  Much like buffer objects, we have to "bind" a shader program object, and all subsequent function calls to modify a program will modify the currently "bound" program until either the current program is unbound, or a new program is bound.  This is true of most WebGL objects, as it is a *state machine*.  The calls to `useProgram` and `bindBuffer` change WebGL's state, and all calls operate using WebGL's current state.  So, `useProgram` changes the current WebGL program to the created program `gl_program` so that our scene will be drawn using this program.  Cool!

Next up, we do a little setup before our draw call.  First, we bind our created vertex buffer `vbo` to be the current `ARRAY_BUFFER`, as we have seen before.  Then, the attribute location retrieved previously is enabled by `enableVertexAttribArray`, which enables us to pass in an array of values as vertex position information to the shader.  The index buffer `indices` is then bound as the current `ELEMENT_ARRAY_BUFFER`.  At this point, we now have a 9-float array bound as a vertex buffer, a 3-int array bound as an element array, and our shader program ready to accept an array of data to draw.  But how do we tell the shader how to interpret our 9 floats as vertices?  This is done with the next call:

    gl.vertexAttribPointer(gl_program_loc.aPosition, 3, gl.FLOAT, false, 12,  0);

The first argument is the location of the attribute that this data will be assigned to.  In this case, it is being assigned to the position attribute, but if this were to be color information, texture coordinates, etc. a different attribute would be used.  The second argument specifies the number of components per attribute.  In this case, the positional information is of the form `[x,y,z]`, so there are 3 components for the attribute.  The third argument specifies the type of data being passed in, which in this case is `FLOAT`.  The fourth argument controls whether or not passed in float values are normalized to between `0.0` and `1.0` as they're passed in.  In our case, we have specified our vertex positions exactly, so we don't want them to be normalized.  The fifth argument gives the byte offset between consecutive vertex attributes.  Since there are 3 attributes per vertex, and each float is 4 bytes, there is a 12 byte offset between attributes in this case.  Finally, the 6th argument gives the pointer to the first element in the array, or `0` to start at the beginning of the array.  As might be expected, passing vertex data to the graphics card is not a simple process, and this is only scratching the surface.  

Now that our data is on the graphics card and set up properly for the shader, all that remains is to draw:

    gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);    

This function call will draw the data stored in the attribute pointers based on the bound element array.  The first argument specifies the primitive type to draw; in our case `TRIANGLES`.  Other primitive types include `LINES`, `LINE_LOOP`, `TRIANGLE_STRIP`, and `TRIANGLE_FAN`, which will all be covered soon.  The second argument specifies 3 vertices to be used.  In general, this argument is the number of indices from the index buffer to use.  The third argument is the type of data being used with the index buffer, in our case `UNSIGNED_SHORT`.  Finally the last argument gives an offset from the start of the element array, in our case `0`.  

And that's it!  The shaders do the rest of the work!  As we can see here:

    // Vertex Shader
    attribute vec3 aPosition;

    void main() {
        gl_Position = vec4(aPosition, 1.0);
    }

    // Fragment Shader

    precision mediump float;

    void main() {
        gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
    }

The vertex shader simply sets the `gl_Position` variable to the position attribute passed in from our program.  This `gl_Position` specifies the final position of the vertex in WebGL coordinates, where x and y are between `-1.0` and `1.0`.  Our vertices are already in that range so no modification must be done.  Next, the fragment shader assigns the color of each fragment (`gl_FragColor`) to opaque red `[1.0, 0.0, 0.0, 1.0]`.  And that's it, we get a red triangle!.  

We have accomplished a lot in this first lesson.  We learned how to initialize a WebGL context on a `canvas`, learned how to set the clear color for the context and clear the `canvas`, learned how to create vertex/index buffers and store data in them, learned how to draw the vertices that we've stored, and touched on how to create, compile, and link shaders to a shader program.  This should seem like a lot of information, and that's fine!  Soon, we'll cover each of these topics in greater depth, then we'll revisit this basic triangle example and it will make much more sense.