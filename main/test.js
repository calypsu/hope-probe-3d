import { Scene, PerspectiveCamera, WebGLRenderer, SphereGeometry, MeshBasicMaterial, Mesh } from "./src/Three.js";

var scene = new Scene();
var camera = new PerspectiveCamera( 10, window.innerWidth / window.innerHeight, 0.1, 100000 );
camera.position.z = 200;

var renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let time = (new Date()).getTime();

var sphere = new SphereGeometry(1, 10, 10);
var material = new MeshBasicMaterial({ color: 0x00ff00 });
var obj = new Mesh(sphere, material);

scene.add(obj);
var a = 3, b = 6;

const animateObj = () => {
    const y = a * Math.cos(time);
    const x = b * Math.sin(time);

    obj.position.x = x;
    obj.position.y = y;
};

function animate() {
    requestAnimationFrame( animate );
    animateObj();
    time = (time - (new Date()).getTime())/1000;
    renderer.render( scene, camera );
}
animate();