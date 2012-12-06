/**
 * A simple camera controller for use with any HTML DOM element,
 * but created with WebGL in mind.  Uses the glMatrix library to 
 * compute rotations.
 *
 * To use, simply initialize a CameraController using any HTML DOM
 * element:
 *
 *   var c = document.getElementById('c');
 *   var controller = new CameraController(c);
 *
 * During mouse drag events, the controller will call its 
 * onchange function, if one is specified, for example:
 *
 *   controller.onchange = display;
 *
 * causes the display function to be called every time a 
 * change is made to the rotation of this controller.
 *
 * NOTE: Originally based off of Google's camera controller:
 *  https://www.khronos.org/registry/webgl/sdk/demos/google/resources/cameracontroller.js
 * for the "Shiny Teapot" demo:
 *  https://www.khronos.org/registry/webgl/sdk/demos/google/shiny-teapot/index.html
 */
function CameraController(element) {
    var controller = this;
    this.element = element;
    this.elwidth = element.width;
    this.elheight = element.height;
    this.onchange = null;
    this.dragging = false;
    this.curX = 0;
    this.curY = 0;
    this.currentOrientation = quat4.identity();

    // Assign a mouse down handler to the HTML element.
    element.onmousedown = function(ev) {
        controller.curX = ev.clientX;
        controller.curY = ev.clientY;
        
        controller.dragging = true;
    };

    // Assign a mouse up handler to the HTML element.
    element.onmouseup = function(ev) {
        controller.dragging = false;
    };

    // Returns coordinates on imaginary sphere surrounding model
    // that correspond to the given mouse coordinates (mx, my)
    controller.mouseToSphere = function(mx, my) {
        var sphere_coord = vec3.create([ 0, 0, 0 ]);
        sphere_coord[0] = mx / ( this.element.width / 2 ) - 1.0;
        sphere_coord[1] = 1.0 - my / ( this.element.height / 2 );
        sphere_coord[2] = 1.0 - Math.pow( sphere_coord[0], 2 ) - Math.pow( sphere_coord[1], 2 );
        vec3.normalize(sphere_coord);
        return sphere_coord;
    }
    
    // Assign a mouse move handler to the HTML element.
    element.onmousemove = function(ev) {
        // We only update if the mouse is dragging
        if (controller.dragging) {
            // Get the current mouse coordinates
            var curX = ev.clientX;
            var curY = ev.clientY;
            
            // Get the coordinates on an imaginary sphere enclosing the model
            // oldsc = sphere coordinates at last time step
            // cursc = sphere_coordinates at this time step
            var oldsc = controller.mouseToSphere( controller.curX, controller.curY );
            var cursc = controller.mouseToSphere( curX, curY );
            
            // Get the axis that these sphere coordinates define a rotation 
            // around, and the angle of that rotation
            var axis = vec3.create();
            vec3.cross( oldsc, cursc, axis );
            var theta = Math.acos( vec3.dot( oldsc, cursc ) );
            
            // Check to make sure we have a valid axis/angle combo
            if( !vec3.length(axis) == 0 && !isNaN( theta ) ) {
                // Normalize the axis to unit length
                vec3.normalize( axis );
                
                // Construct a quaternion from this angle/axis pair
                var delta = quat4.fromAngleAxis( theta, axis );
                quat4.normalize( delta );
                
                // Concatenate this rotation with the current orientation
                quat4.multiply( delta, controller.currentOrientation, controller.currentOrientation );
                quat4.normalize( controller.currentOrientation );
                
                // Finally, set the old coordinates to be the current coordinates for the next update
                controller.curX = curX;
                controller.curY = curY;
                
                if( controller.onchange !== null ) {
                    controller.onchange();
                }
            }
        }
    };
}
