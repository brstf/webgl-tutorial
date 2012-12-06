Overview
--------
This is a set of graphics tutorials that utilize WebGL to introduce graphics concepts and techniques.

Table of Contents
-----------------

* Demo 1 - Getting Started : Teaches several basics of getting started with WebGL including initializing a `canvas` for use with WebGL, loading in shaders, and drawing a simple triangle.
* Demo 2 - Drawing and Shaders:
    * 1 - Changing Colors - Change the red triangle to green by passing in a `uniform` to the shader
    * 2 - Per Vertex Colors - Passing in one color per vertex of the triangle by using vertex `attributes`
    * 3 - Modifying the Shaders - Modulate color based on y coordinate, demonstrate "swizzling"
    * 4 - Attribute Interleaving - Demonstrate interleaving color data between positional data 
    * 5 - More than Just Triangles - Drawing a square; modifying the index object and using `gl.TRIANGLES`
    * 6 - Primitives - Replicate the square through use of `TRIANGLE_STRIP` and investigate some more WebGL primitives
* Demo 3 - Moving to 3 Dimensions
    * 1 - Tetrahedron - Draw a simple tetrahedron making use of `TRIANGLE_STRIP` and make it spin
    * 2 - Coloring per Face - Add color per face of the tetrahedron, demonstrating the need for `gl.TRIANGLES` over `gl.TRIANGLE_STRIP`
    * 3 - Colored Cube - Change the tetrahedron to a cube, apply a rotation, and enlarging the `canvas`
    * 4 - Texturing - Applying a stone texture to the cube
    * 5 - Texture Coordinates - Using texture `REPEAT` to make the texture line up properly
* Demo 4 - Lighting
    * 1 - Basic Lighting - Using the Phong lighting model to do per-fragment lighting with specular highlihgt
    * 2 - Normal Maps - Adding physical texture to the cube through normal maps, demonstrate interactivity by cycling through layers that form the final cube
    * 3 - Specular Map - Adding shiny highlights through a specular map to create a final, realistic looking stone cube
* Demo 5 - Input
    * 1 - Exploring Input Further - Adding keyboard input callback functions, responding to holding down a key properly.
    * 2 - Mouse Rotation and Quaternions - Use mouse input to rotate the model of the lit cube, uses quaternion rotation to achieve smooth, predictable object rotation
* Demo 6 - Having Fun!
    * 1 - WebGL Flock - An implementation of the "Boid" flocking algorithm to show interaction between objects
    * 2 - WebGL Model Loader - Simple model loader to demonstrate `.css` and `HTML` menus working with WebGL, drawing wireframes, and the basics of reading model formats.

Textures
--------
Stone texture, normal map, and specular map obtained from Spiney's texture pack from opengameart.org:

http://opengameart.org/content/metalstone-textures

Licensed by the Creative Commons license 3.0:

http://creativecommons.org/licenses/by/3.0/