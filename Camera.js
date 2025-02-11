class Camera{
    constructor(){
        this.fov = 60.0
        this.movementSpeed = 0.5;
        this.alpha = .5;

        this.eye=new Vector3([0,0,3]);
        this.at=new Vector3([0,0,-100]);
        this.up=new Vector3([0,1,0]);

        this.projectionMatrix = new Matrix4();        
        this.viewMatrix = new Matrix4();        
        this.updateView();
    }


    forward(){
        var d = new Vector3(this.at.elements);
        d.sub(this.eye);
        d.normalize();
        this.eye.add(d);
        this.at.add(d);
        this.updateView();
    }

    backward(){
        var d = new Vector3(this.at.elements); 
        d.sub(this.eye);
        d.normalize();
        this.eye.sub(d);
        this.at.sub(d);
        this.updateView();
    }

    moveLeft(){
        var d = new Vector3(this.at.elements);
        d.sub(this.eye);
        //d = d.normalize();
        var s = new Vector3();
        s = Vector3.cross(d, this.up);
        s.normalize();
        this.eye.sub(s);
        this.at.sub(s);
        this.updateView();
    }

    moveRight(){
        var d = new Vector3(this.at.elements);
        d.sub(this.eye);
        //d = d.normalize();
        var s = Vector3.cross(d,this.up);
        s.normalize();
        this.eye.add(s);
        this.at.add(s);
        this.updateView();
    }

    panLeft(){
        var d = new Vector3(this.at.elements);
        d.sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var f_prime = new Matrix4();
        f_prime = rotationMatrix.multiplyVector3(d);
        var eye = new Vector3(this.eye.elements);
        this.at = eye.add(f_prime);
        this.updateView();
    }

    panRight(){
        var d = new Vector3(this.at.elements);
        d.sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var f_prime = new Matrix4();
        f_prime = rotationMatrix.multiplyVector3(d);
        var eye = new Vector3(this.eye.elements);
        this.at = eye.add(f_prime);
        this.updateView();
    }

    updateView() {
        this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
        gl.uniformMatrix4fv(u_ProjectionMatrix, false, this.projectionMatrix.elements);

        this.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], this.at.elements[0], this.at.elements[1], this.at.elements[2], this.up.elements[0], this.up.elements[1], this.up.elements[2]); // (eye, at, up)
        gl.uniformMatrix4fv(u_ViewMatrix, false, this.viewMatrix.elements);
    }


}

