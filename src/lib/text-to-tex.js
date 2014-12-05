var THREE = require('./three/three.js');



function createTextMesh (text, size, fontstr, col, blending){

    var backgroundMargin = 10;

    var canvas = document.createElement('canvas');
    
    var context = canvas.getContext("2d");

    context.font = size + fontstr;
    var textWidth = context.measureText(text).width;

    canvas.width = textWidth + backgroundMargin;
    canvas.height = size +  backgroundMargin;

    context = canvas.getContext("2d");
    context.font = size + fontstr;

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = col;
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var material = new THREE.MeshBasicMaterial({
        map : texture,
        blending : (blending || THREE.AdditiveBlending),
        transparent: true,
        depthWrite: false
    });
    material.index0AttributeName = "position";

    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(canvas.width, canvas.height), material);

    return mesh;

}

function HUDScreen (width, height){

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext("2d");

    this.canvas.width = width;
    this.canvas.height = height;

    this.context.textAlign = "center";
    this.context.textBaseline = "middle";

    this.texture = new THREE.Texture(this.canvas);
    this.texture.needsUpdate = true;


    var material = new THREE.MeshBasicMaterial({
        map : this.texture,
       // blending : (THREE.AdditiveBlending),
        transparent : true
    });

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(this.canvas.width / 4, this.canvas.height / 4), material);

    return this;

}

HUDScreen.prototype = {
    clear : function (){

    this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
    /*
    this.context.strokeStyle = "#ffffff";
    this.context.lineWidth = 1;

    this.context.beginPath();
    this.context.rect(10,10,this.canvas.width - 20, this.canvas.height - 20);
    this.context.stroke();

    this.context.strokeStyle = "";

        this.context.closePath();
        */

        this.texture.needsUpdate = true;

        return this;

    },
    setFont : function (size, fontstr){

        this.context.font = size + fontstr;

        return this;

    },
    center : function (){
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        return this;
    },
    topLeft : function (){
        this.context.textAlign = "left";
        this.context.textBaseline = "top";
        return this;
    },
    topRight : function (){
        this.context.textAlign = "right";
        this.context.textBaseline = "top";
        return this;
    },
    setColour : function (col){

        this.context.fillStyle = col;

        return this;

    },
    write : function (text, x, y){

        this.context.fillText(text, x, y);

        this.texture.needsUpdate = true;

        return this;

    }
}

module.exports.createTextMesh = createTextMesh;

module.exports.HUDScreen = HUDScreen;