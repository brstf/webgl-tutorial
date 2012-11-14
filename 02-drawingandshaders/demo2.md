02 - Colors, Drawing, and Shaders
=================================

In the first lesson, we looked at the basics of setting up a WebGL context and drawing, but we didn't really touch on the full power of WebGL.  Obviously, drawing a basic triangle to the screen is not impressive in comparison to the special effects of movies and highly detailed video games, so how do they accomplish so much more?  We'll begin to dig into more detail about more powerful methods and drawing capabilities of WebGL in this lesson.

Triangles And You
-----------------

When the triangle was drawn in the previous demo, we set up the buffers, set up the vertices as an attribute, then made a call to `drawElements` to actually render the triangle.  Already, a lot is happening here with the numerous function calls and various arguments supplied to these functions, so what really is going on here and how can we use it?

First, let's take a look at attributes.  If we take a look at the basic vertex shader that was used in lesson 1, we can see above the main function, a variable is declared as an "`attribute`":

    attribute vec3 aPosition;

    void main() {
        gl_Position = vec4(aPosition, 1.0);
    }

and that's no accident!  That attribute is what we used to get the vertices' positional information into the shader to draw.  What is an `attribute` you ask?  Simple! It's any value that is supplied for each vertex.  For our example, each vertex had a position, so our only `attribute` is a 3-element vector of positional information `[x,y,z]`.  Often times, you may want to add more information for each vertex, like a color to be used, a texture coordinate, or a vector normal to the surface at that vertex.  Essentially any value that varies per vertex will be an `attribute` in the shader.  In our JavaScript code, that means we will have to retrieve another attribute location, and set up another attribute pointer, and then this data will be sent off to the graphics card!

However, what if you want to specify a *global* property of an object?  Maybe we want to specify the color of the entire triangle or tell the shader whether or not to use lighting with this object?  For that, we can set a `uniform` variable.  Unlike `attribute`s, `uniforms` stay constant across all vertices drawn in a single draw call.  This way we can set variables that affect all vertices equally, like a color or transformation (i.e. all vertices should be shifted to the left by 2 units).  So let's make use of this `uniform` concept, and specify the color of the triangle through the JavaScript code instead of inside the shader.

First, let's modify the vertex shader to accept a `uniform` for color information.  Since we want to supply color information across the whole object, we'll use a `uniform vec4` for a 4 element color `[r, g, b, a]`.  Here's the new shader:

    attribute vec3 aPosition;

    uniform vec4 uColor;

    void main() {
        gl_Position = vec4(aPosition, 1.0);
    }

But we have seen before that color information is used in the fragment shader, not the vertex shader, so how can we transfer the information?

To do this, we'll have to introduce the third type of shader variable, `varying`.  If one `varying` is specified in the vertex shader as `vColor`, and another `varying` is specified in the fragment of the name `vColor`, we can transfer information between shaders.  In the vertex shader, we'll modify the `main` code:

    attribute vec3 aPosition;

    uniform vec4 uColor;

    varying vec4 vColor;

    void main() {
        gl_Position = vec4(aPosition, 1.0);

        vColor = uColor;
    }

And add the `varying` to the fragment shader, using it for the fragment color:

    precision mediump float;

    varying vec4 vColor;

    void main() {
        gl_FragColor = vColor;
    } 

Now if we send a color to the vertex shader, it will get sent to the fragment shader and used to color our vertices!  As a final note, `varying` is used between shaders, and `uniform` and `attribute` is used to get data from the JavaScript code to the shader code.

To see this change in action, we need to head back to our JavaScript code and make use of this `uniform`.  First, we must get the location of this uniform similar to how we retrieved the attribe location.  To do this, we'll add a line in the `initShaders` function to retrieve another location from the shaders, this time the location of our color uniform:

    // Get the uniform/attribute locations
    gl_program_loc.aPosition = gl.getAttribLocation(gl_program, "aPosition");
    gl_program_loc.uColor = gl.getUniformLocation(gl_program, "uColor");

Note the change of function from `getAttribLocation` to `getUniformLocation` because we are retrieving a `uniform` and not an `attribute`.  The location is stored in the global variable `gl_program_loc` property, `uColor`.  

With the location of the uniform,  data can be stored in the uniform.  This is done in the draw method as follows: 

    // Use the created shader program
    gl.useProgram(gl_program);

    // Send color uniform to the shader:
    gl.uniform4fv(gl_program_loc.uColor, Float32Array([ 0.0, 1.0, 0.0, 1.0 ]));

And that's it, the triange should now be drawn as green, and to change the color, we can simply modify the JavaScript code!  Remember, this line has to be placed after the call to `useProgram` because the uniform that is receiving information is stored in the program `gl_program`, so it must be the active program before we can access it's locations.

What we have done here may seem a little silly, why did we upload a uniform to the vertex shader, then pass it to the fragment shader without modification?  Couldn't we have just gave the fragment shader the information directly by placing the uniform there:

    //Vertex Shader
    attribute vec3 aPosition;
        
    void main() {
        gl_Position = vec4(aPosition, 1.0);
    }

    //Fragment Shader
    precision mediump float;

    uniform vec4 uColor;
    
    void main() {
        gl_FragColor = uColor;
    } 

Why yes we can!  Without any modification of our JavaScript, this code will work just fine!  But now we also know how to pass different variables through shaders, and we'll make use of this shortly.

Now we can specify a single color for the whole object to use, but what if we wanted to specify a different color for each vertex?  How would we accomplish such a thing, and what would it even look like?  Let's experiment, and get a good look at how these shaders actually work!

First, we'll revert our shader back to having the color passed into the vertex shader, with one modification:

    // Vertex Shader
    attribute vec3 aPosition;
    attribute vec4 aColor;
    
    varying vec4 vColor;
    
    void main() {
        gl_Position = vec4(aPosition, 1.0);
        vColor = aColor;
    }

    // Fragment Shader
    precision mediump float;
    
    varying vec4 vColor
    
    void main() {
        gl_FragColor = vColor;
    }        

The major change made was to change the color to be `attribute`.  And we know this is the case, because we know that an `attribute` should be used if a variable changes depending on the vertex.

Now, let's head into the JavaScript again to use this new color information.  We first change the location retrieval to get an `attribute`:

    // Get the uniform/attribute locations
    gl_program_loc.aPosition = gl.getAttribLocation(gl_program, "aPosition");
    gl_program_loc.aColor = gl.getAttribLocation(gl_program, "aColor");

We want to populate that attribute with information, so we'll need to store it in a buffer to upload it to the graphics card.  But how can we do that since only one `ARRAY_BUFFER` can be active at a time?  

In order to store this information, we'll have to store the color information in the *same* buffer as the color information.  Since we don't want to mess up the positional information, we can just tack the color info at the end of the array:

    // Put 3 vertices of a triangle in the VBO
    var vertices = new Float32Array([ -0.5, -0.5, 0.0,      // Position 1
                                       0.5, -0.5, 0.0,      // Position 2
                                       0.0,  0.5, 0.0,      // Position 3    
                                       1.0,  0.0, 0.0, 1.0, // Color 1 - Red
                                       0.1,  0.3, 0.7, 1.0, // Color 2 - Blue
                                       1.0,  1.0, 0.0, 1.0, // Color 3 - Yellow
                                   ]);

We still have 3 vertices, so the element array doesn't need to change.  However, we need to modify the `draw` function to reflect our buffer changes.

First things first, we remove the `uniform4fv` call from the `draw` function as we are not using a uniform anymore.  Next, we enable a vertex attribute array for our color information:  

    // Enables a vertex attribute array for vertex positions and colors
    gl.enableVertexAttribArray(gl_program_loc.aPosition);
    gl.enableVertexAttribArray(gl_program_loc.aColor);

Finally, we have to handle the `attribute` pointers.  The position pointer was setup by:

    gl.vertexAttribPointer(gl_program_loc.aPosition, 3, gl.FLOAT, false, 12,  0);

with the `attribute` `aPosition`, `3` elements per vertex, all of type `FLOAT`, non-normalized, taking up 12 bytes total, starting at position 0.  So how do we setup the color pointer?  

We can setup the color attribute pointer by:

    gl.vertexAttribPointer(gl_program_loc.aPosition, 3, gl.FLOAT, false, 12,  0);
    gl.vertexAttribPointer(gl_program_loc.aColor,    4, gl.FLOAT, false, 16, 36);

But where did these new numbers come from?  Is there some magical method?  Well, not really, it just takes some reasoning about how the data is stored in the buffer.  Take a look at the following diagram:

    [coloroffset.png]

This splits the positional and color information up so that it's easier to see what the offsets should be.  First off, we know that there are `4` non-normalized color float values per vertex, so that the call quite evidently starts with:

    gl.vertexAttribPointer(gl_program_loc.aColor, 4, gl.FLOAT, false, 

But that leaves the `stride`, number of bytes between vertices, and the `offset`, number of bytes from the beginning of the buffer to the first value.  From the diagram, we can easily see that each position value is a 4-byte float, with 12 bytes per vertex.  There are 3 vertices of 3 floats each, giving us 9 floats times 4 bytes = 36 bytes from the start of the buffer to the first color value.  Next, we see 4 floats per vertex for the color information, so we get 4 floats times 4 bytes = 16 bytes per vertex.  Filling in those values gives us the final function call:

    gl.vertexAttribPointer(gl_program_loc.aColor, 4, gl.FLOAT, false, 16, 36);

Easy, right?  This sort of calculation is pretty simple to do, as long as you're careful and double check your logic.  