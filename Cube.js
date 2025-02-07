class Cube{
    constructor(){
        //this.type = 'cube';
        //this.position = [0.0, 0.0,0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 5;
        this.matrix = new Matrix4();
        this.textureNum=0; // default use texture0
    }

    // render(){
    //     var rgba = this.color;

    //     gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    //     gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    //     drawTriangle3D([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0]);
    //     drawTriangle3D([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0]);

    //     // make "fake" lighting
    //     gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    // }
    setVertices() {
        // prettier-ignore
        this.vertices = new Float32Array([
          //FRONT
          -0.5,0.5,0.5, -0.5,-0.5,0.5, 0.5,-0.5,0.5,
          -0.5,0.5,0.5, 0.5,-0.5,0.5, 0.5,0.5,0.5,
          //LEFT
          -0.5,0.5,-0.5, -0.5,-0.5,-0.5, -0.5,-0.5,0.5,
          -0.5,0.5,-0.5, -0.5,-0.5,0.5, -0.5,0.5,0.5,
          //RIGHT
          0.5,0.5,0.5, 0.5,-0.5,0.5, 0.5,-0.5,-0.5,
          0.5,0.5,0.5, 0.5,-0.5,-0.5, 0.5,0.5,-0.5,
          //TOP
          -0.5,0.5,-0.5, -0.5,0.5,0.5, 0.5,0.5,0.5,
          -0.5,0.5,-0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5,
          //BACK
          0.5,0.5,-0.5, 0.5,-0.5,-0.5, -0.5,0.5,-0.5,
          -0.5,0.5,-0.5, 0.5,-0.5,-0.5, -0.5,-0.5,-0.5,
          //BOTTOM
          -0.5,-0.5,0.5, -0.5,-0.5,-0.5, 0.5,-0.5,-0.5,
          -0.5,-0.5,0.5, 0.5,-0.5,-0.5, 0.5,-0.5,0.5
        ]);
      }

    setUvs() {
    // prettier-ignore
    this.uvs = new Float32Array([
        // FRONT
        0,1, 0,0, 1,0, 0,1, 1,0, 1,1,
        // LEFT
        0,1, 0,0, 1,0, 0,1, 1,0, 1,1,
        // RIGHT
        0,1, 0,0, 1,0, 0,1, 1,0, 1,1,
        // TOP
        1,0, 1,1, 0,1, 1,0, 0,1, 0,0,
        // BACK
        0,1, 0,0, 1,1, 1,1, 0,0, 1,0,
        // BOTTOM
        0,1, 0,0, 1,0, 0,1, 1,0, 1,1,
        ]);
    }
    render() {
       // var xy = this.position;
        var rgba = this.color;
        //var size = this.size;
        
        gl.uniform1i(u_whichTexture, this.textureNum);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        

        // Front of Cube
        drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [1,0, 0,1, 1,1]);
        drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 1,0, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        // Back of the Cube
        drawTriangle3DUV([0,0,-1, 1,1,-1, 1,0,-1], [1,0, 0,1, 1,1]);
        drawTriangle3DUV([0,0,-1, 0,1,-1, 1,1,-1], [0,0, 1,0, 1,1]);

        // Top of the Cube
        drawTriangle3DUV([0,1,0, 1,1,-1, 1,1,0], [0,1, 1,0, 1,1]);
        drawTriangle3DUV([0,1,0, 0,1,-1, 1,1,-1], [0,1, 0,0, 1,0]);

        // Bottom of the Cube
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        drawTriangle3DUV([0,0,0, 1,0,-1, 1,0,0], [0,1, 1,0, 1,1]);
        drawTriangle3DUV([0,0,0, 0,0,-1, 1,0,-1], [0,1, 0,0, 1,0]);

        // Left Side of the Cube
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        drawTriangle3DUV([0,0,0, 0,1,0, 0,0,-1], [1,1, 1,0, 0,1]);
        drawTriangle3DUV([0,0,-1, 0,1,0, 0,1,-1], [0,1, 1,0, 0,0]);

        // Right Side of the Cube
        drawTriangle3DUV([1,0,0, 1,1,0, 1,0,-1], [0,1, 0,0, 1,1]);
        drawTriangle3DUV([1,0,-1, 1,1,0, 1,1,-1], [1,1, 0,0, 1,0]);

        
    }
}