04 - Lighting
=============

Since WebGL does not contain "Immediate Mode" graphics, so we must write our own shaders for lighting.

4-1 Phong Lighting
------------------
This demo changes the vertex and fragment shader to light the textured, spinning cube.  As mentioned in the title, this uses the Phong shading model with even specular highlights across each face.

[Demo 4-1 Phong Lighting](http://homepages.rpi.edu/~staufb/webgl-tutorial/04-lighting/index04-01.html)

4-2 Normal Mapping
------------------
This uses a normal map to modify the normals per texture to modify the way the light scatters across the cube.  In order to get this working fine, we need a normal, tangent, and a 3rd vector perpindicular to the normal and tangent  (which is often called the bitangent) at each point.  These three vectors form the Tangent Space for that point, which we can then use to translate the light position and eye vector to properly calculate the light attenuation at each texel.

[Demo 4-2 Normal Mapping](http://homepages.rpi.edu/~staufb/webgl-tutorial/04-lighting/index04-02.html)

4-3 Specular Map
----------------
Similarly, this demo uses an additional specular map to modify the specular highlights per texel.  This modifies the amount of visible specular light that can occur at a texel by modulating it by the value in the specular map.  This is the most realistic model, but also requires the most amount of work to set up and actually render, so it's a pretty big trade off.

[Demo 4-3 Specular Map](http://homepages.rpi.edu/~staufb/webgl-tutorial/04-lighting/index04-03.html)

Each of the Normal Mapping and Specular Map demos are interactive.  Press 'space' to cycle from the Final image -> color map -> normal map -> (specular map) -> final lighting attenuation values on a white cube -> final image again.  Additionally, for the specular map, holding down the 's' key will disable the specular highlight, release it will enable specular highlights again.