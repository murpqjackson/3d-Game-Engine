const width = 256;
const height = 240;


//Structs

function vec3d(x = 0, y = 0, z = 0) {
  this.x = x;
  this.y = y;
  this.z = z;
}

function triangle(p1 = new vec3d(), p2 = new vec3d(), p3 = new vec3d()) {
  this.p = [p1, p2, p3];
}

function mesh(tris = []) {
  this.tris = tris;
}

function MultiplyMatrixVector(i, m) {
    let o = new vec3d();

    o.x = i.x * m[0][0] + i.y * m[1][0] + i.z * m[2][0] + m[3][0];
    o.y = i.x * m[0][1] + i.y * m[1][1] + i.z * m[2][1] + m[3][1];
	o.z = i.x * m[0][2] + i.y * m[1][2] + i.z * m[2][2] + m[3][2];
	let w = i.x * m[0][3] + i.y * m[1][3] + i.z * m[2][3] + m[3][3];

	if (w != 0) {
		o.x /= w;
        o.y /= w;
        o.z /= w;
	}

    return o;
}

let triRotatedZ, triRotatedZX, triTranslated, triProjected;

// Make a cube: 6 faces each made of 2 triangles
let meshCube = new mesh([
    // SOUTH
	new triangle(new vec3d(0, 0, 0), new vec3d(0, 1, 0), new vec3d(1, 1, 0)),
	new triangle(new vec3d(0, 0, 0), new vec3d(1, 1, 0), new vec3d(1, 0, 0)),
	// EAST                                                      
	new triangle(new vec3d(1, 0, 0), new vec3d(1, 1, 0), new vec3d(1, 1, 1)),
	new triangle(new vec3d(1, 0, 0), new vec3d(1, 1, 1), new vec3d(1, 0, 1)),
	// NORTH                                                     
	new triangle(new vec3d(1, 0, 1), new vec3d(1, 1, 1), new vec3d(0, 1, 1)),
	new triangle(new vec3d(1, 0, 1), new vec3d(0, 1, 1), new vec3d(0, 0, 1)),
	// WEST                                                      
	new triangle(new vec3d(0, 0, 1), new vec3d(0, 1, 1), new vec3d(0, 1, 0)),
	new triangle(new vec3d(0, 0, 1), new vec3d(0, 1, 0), new vec3d(0, 0, 0)),
	// TOP                                                       
	new triangle(new vec3d(0, 1, 0), new vec3d(0, 1, 1), new vec3d(1, 1, 1)),
	new triangle(new vec3d(0, 1, 0), new vec3d(1, 1, 1), new vec3d(1, 1, 0)),
	// BOTTOM                                                    
	new triangle(new vec3d(1, 0, 1), new vec3d(0, 0, 1), new vec3d(0, 0, 0)),
	new triangle(new vec3d(1, 0, 1), new vec3d(0, 0, 0), new vec3d(1, 0, 0))
]);

// Create the projection matrix:

let fNear = 1;
let fFar = 1000;
let fFov = 90;
let fAspectRatio = height / width;
let fFovRad = 1 / Math.tan(fFov * 0.5 / 180 * Math.PI);

let matProj = [
  [fAspectRatio * fFovRad, 0, 0, 0],
  [0, fFovRad, 0, 0],
  [0, 0, fFar / (fFar - fNear), 1],
  [0, 0, (-fFar * fNear) / (fFar - fNear), 0]
];

// Rotation matrices
let matRotZ = [
  [0,0,0,0],
  [0,0,0,0],
  [0,0,0,0],
  [0,0,0,0]
];
let matRotX = [
  [0,0,0,0],
  [0,0,0,0],
  [0,0,0,0],
  [0,0,0,0]
];

let fTheta = 0; // Rotation angle
let fElapsedTime = 0; // Delta time since last frame
let last = 0;

function update() {

    fTheta += 1 * fElapsedTime / 1000;

	// Rotation Z
	matRotZ[0][0] = Math.cos(fTheta);
	matRotZ[0][1] = Math.sin(fTheta);
	matRotZ[1][0] = -Math.sin(fTheta);
	matRotZ[1][1] = Math.cos(fTheta);
	matRotZ[2][2] = 1;
	matRotZ[3][3] = 1;

	// Rotation X
	matRotX[0][0] = 1;
	matRotX[1][1] = Math.cos(fTheta * 0.5);
	matRotX[1][2] = Math.sin(fTheta * 0.5);
	matRotX[2][1] = -Math.sin(fTheta * 0.5);
	matRotX[2][2] = Math.cos(fTheta * 0.5);
	matRotX[3][3] = 1;

    // Clear screen
    ctx.clearRect(0, 0, width, height);

    // Draw triangles
    for(const tri of meshCube.tris) {
    
        let triRotatedZ = new triangle(), triRotatedZX= new triangle(), triTranslated = new triangle(), triProjected = new triangle();

        // Rotate in Z-Axis
		triRotatedZ.p[0] = MultiplyMatrixVector(tri.p[0], matRotZ);
		triRotatedZ.p[1] = MultiplyMatrixVector(tri.p[1], matRotZ);
		triRotatedZ.p[2] = MultiplyMatrixVector(tri.p[2], matRotZ);

		// Rotate in X-Axis
		triRotatedZX.p[0] = MultiplyMatrixVector(triRotatedZ.p[0], matRotX);
		triRotatedZX.p[1] = MultiplyMatrixVector(triRotatedZ.p[1], matRotX);
		triRotatedZX.p[2] = MultiplyMatrixVector(triRotatedZ.p[2], matRotX);

		// Offset into the screen
		triTranslated = triRotatedZX;
		triTranslated.p[0].z = triRotatedZX.p[0].z + 3;
		triTranslated.p[1].z = triRotatedZX.p[1].z + 3;
		triTranslated.p[2].z = triRotatedZX.p[2].z + 3;

		// Project triangles from 3D --> 2D
		triProjected.p[0] = MultiplyMatrixVector(triTranslated.p[0], matProj);
        triProjected.p[1] = MultiplyMatrixVector(triTranslated.p[1], matProj);
		triProjected.p[2] = MultiplyMatrixVector(triTranslated.p[2], matProj);

        // Scale into view
        triProjected.p[0].x += 1; triProjected.p[0].y += 1;
		triProjected.p[1].x += 1; triProjected.p[1].y += 1;
		triProjected.p[2].x += 1; triProjected.p[2].y += 1;
		triProjected.p[0].x *= 0.5 * width;
		triProjected.p[0].y *= 0.5 * height;
		triProjected.p[1].x *= 0.5 * width;
		triProjected.p[1].y *= 0.5 * height;
		triProjected.p[2].x *= 0.5 * width;
		triProjected.p[2].y *= 0.5 * height;

		// Rasterize triangle
		DrawTriangle(triProjected.p[0].x, triProjected.p[0].y, triProjected.p[1].x, triProjected.p[1].y, triProjected.p[2].x, triProjected.p[2].y, "#000000", false);
    }

    // Get delta time and request a new frame
    fElapsedTime = performance.now() - last;
    last = performance.now();
    requestAnimationFrame(update);
}

//Draw a triangle onto the canvas using paths
function DrawTriangle(p1x, p1y, p2x, p2y, p3x, p3y, color = "#000000", fill = false) {
    ctx.beginPath();
    ctx.moveTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.lineTo(p3x, p3y);
    if (fill) {
        ctx.fillStyle = color;
        ctx.fill();
    } else {
        ctx.strokeStyle = color;
        ctx.stroke();
    }
}

// Initialize the canvas and begin the animation

let Canvas = document.getElementById("canvas");
Canvas.width = width;
Canvas.height = height;
let ctx = Canvas.getContext("2d");
requestAnimationFrame(update);