class Cube{
    constructor(){
        this.type='cube';
        this.color = [1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
    }

    render(){
        var rgba = this.color;
        // pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // front of cube
        drawTriangle3D([0,0,0,   1,1,0,   1,0,0]);
        drawTriangle3D([0,0,0,   0,1,0,   1,1,0]);

        // pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3])

        // top of cube
        drawTriangle3D( [0,1,0,   0,1,1,    1,1,1] );
        drawTriangle3D( [0,1,0,   1,1,1,    1,1,0] );

        // Set the color for the bottom face
        // gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);

        // bottom of cube
        drawTriangle3D( [0,0,0,   1,0,1,    1,0,0] );
        drawTriangle3D( [0,0,0,   0,0,1,    1,0,1] );

        // Set the color for the back face
        // gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);

        // Back face
        drawTriangle3D( [0,0,1,  1,0,1,   1,1,1]);
        drawTriangle3D( [0,0,1,  1,1,1,   0,1,1]);

        // Set the color for the left face
        // gl.uniform4f(u_FragColor, rgba[0]*0.6, rgba[1]*0.6, rgba[2]*0.6, rgba[3]);

        // Left face
        drawTriangle3D([0,0,0,  0,1,1,  0,1,0]);
        drawTriangle3D([0,0,0,  0,0,1,  0,1,1]);

        // Set the color for the right face
        // gl.uniform4f(u_FragColor, rgba[0]*0.5, rgba[1]*0.5, rgba[2]*0.5, rgba[3]);

        // Right face
        drawTriangle3D([1,0,0,  1,1,1,  1,1,0]);
        drawTriangle3D([1,0,0,  1,0,1,  1,1,1]);
        

    }
}