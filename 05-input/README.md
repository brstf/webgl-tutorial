05 - Input
==========
These 2 demos explore the use of keyboard input and mouse input for spinning the textured and lit cubes.

5-1 Keyboard Input
------------------
Uses two key callback functions, `onkeyup` and `onkeydown` to test when arrow keys are pressed or released to rotate the cube.  Holding the up/down arrows rotates the cube around the x-axis, while holding down the left/right arrows rotates the cube around the y-axis.

[5-1 Keyboard Input](http://homepages.rpi.edu/~staufb/webgl-tutorial/05-input/index05-01.html)

5-2 Mouse Input
---------------
Uses my custom `CameraController.js`, script to use the mouse control the rotation of the cube.  The `CameraController` uses quaternions to store the rotation, and rotates by calculate coordinates on the imaginary sphere that encapsulates the object, and during the drag continually calculating these points of intersection and interpolating between them to obtain a final quaternion rotation.

[5-2 Mouse Input](http://homepages.rpi.edu/~staufb/webgl-tutorial/05-input/index05-02.html)