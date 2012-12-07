03 - The 3rd Dimension
======================
This set of demos shows off objects in 3 dimensions as opposed to 2.

3-1 Tetrahedrons and Animation
------------------------------
Creates a simple, green tetrahedron with no modification to the shaders.  Also introduces animations by using the recommended JavaScript `requestAnimFrame` function with an `update` callback:

    function update( time ) {
        // Setup another request
        requestId = requestAnimFrame( update, document.getElementById('c') );
        draw();
    }

This calls update when the request finishes with the time between calls passed in as the argument.  This `requestAnimFrame` function is another helper function provided by `webgl_utils` that calls the `requestAnimationFrame` function with similar arguments across all browsers.  

[Demo 3-1 Spinning Tetrahedron](http://homepages.rpi.edu/~staufb/webgl-tutorial/03-3dimensions/index03-01.html)

3-2 Tetrahedron with Colored Faces
----------------------------------
`TRIANGLE_STRIP` requires less vertices to draw the same number of triangles as `TRIANGLES`, but the vertices in `TRIANGLE_STRIP` share attributes, which is sometimes undesirable.  In this case, we can use `TRIANGLES` again to specify different colors per vertex per face, which allows us to color each face differently.

[Demo 3-2 Tetrahedron with Colored Faces](http://homepages.rpi.edu/~staufb/webgl-tutorial/03-3dimensions/index03-02.html)

3-3 Cube with Large Canvas
--------------------------
We have been using a relatively small 300 x 300 `canvas`.  The third demo uses a different style sheet to specify a larger 750 x 750 canvas, and due to browser differences adds a couple of lines to the main code to ensure the `canvas` size is initialized properly:

    c.width = c.clientWidth;
    c.height = c.clientHeight;

Additionally, the object drawn is changed to be a spinning cube, again to show the same sort of differences needed to go from a triangle to a square, but in 3 dimensions.

[Demo 3-3 Cube with Large Canvas](http://homepages.rpi.edu/~staufb/webgl-tutorial/03-3dimensions/index03-03.html)

3-4 Texturing
-------------
Drawing a textured cube with texture coordinates as attributes instead of color information.  Also loades in the texture image by using typical JavaScript calls to load in the image, then shipping that data to the GPU like a uniform.  Also shows off a pretty neat trick that can be done in WebGL.  Without any special modifications, if the image has not finished loading, the texture is black, so if the image takes a second or two to load, the cube will be black, then the texture will be filled in automatically.

[Demo 3-4 Texturing](http://homepages.rpi.edu/~staufb/webgl-tutorial/03-3dimensions/index03-04.html)

3-5 Texture Wrapping
--------------------
Change the wrapping mode to mirror so that we can line up the stone textures to create evenly sized slabs by shifting texture coordinates.

[Demo 3-5 Texture Wrapping](http://homepages.rpi.edu/~staufb/webgl-tutorial/03-3dimensions/index03-05.html)

Textures
--------
Stone texture, normal map, and specular map obtained from Spiney's texture pack from opengameart.org:

http://opengameart.org/content/metalstone-textures

Licensed by the Creative Commons license 3.0:

http://creativecommons.org/licenses/by/3.0/