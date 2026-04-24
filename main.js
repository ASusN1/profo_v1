//immport 3js libaray 
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
//To allow camera to move around the scene
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
//To allow for importing the .gilf file
import {GLTFLoader} from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';

//Create a 3 js screen 
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222); //add gray background so we can see if anything renders
//Create a camera to view the scence
const camera = new THREE.PerspectiveCamera(75, window.innerWidth /window.innerHeight, 0.1, 1000);

//keep the 3D object as global so access later 
let object; 
//Orbitcontrols allow the camera to move around the sceen
let controls;
//set which object to render 
let objToRender = "v7.glb"; //Note: not sure if this is the correct  name, re check later to find the correct 1  *** repalce this with the roomthingy 
//Instaniate a loeader for the gltf file 
const loader = new GLTFLoader(); 

//Load the gltf file 
loader.load('model/v7.glb', function(gltf){
    //if the file load --> add to the scence
    object = gltf.scene; 
    scene.add(object);
    console.log('Model loaded successfully!');
    }, 
    function(xhr){
        //white laoding-> log the progress
        console.log(xhr.loaded/xhr.total *100 + '% loaded');  
    },
    function (error){ 
        //if errro --> log 
        console.error(error);
    }
);
//Iniatet a new rendered and se its isze 
const renderer = new THREE.WebGLRenderer({alpah :true}); //alpha for transparrent acgroudn 
renderer.setSize(window.innerWidth, window.innerHeight);
//Add the rnder to the DOM
document.getElementById("container").appendChild(renderer.domElement);

//set distace of the camera from the scence
camera.position.z = 4;

//Add light to the sceence, so we can see the object
const topLight = new THREE.DirectionalLight(0xffffff, 0.1); //(color, intensity)
topLight.position.set(500, 500, 500);   //position the light above the object ( top left ish) -- 500 is the distance from the object, adjust as needed
topLight.castShadow = true; //allow the light to cast shadows
scene.add(topLight); //add the light to the scence

const ambientLight = new THREE.AmbientLight(0xf3fff3, objToRender === "v7.glb" ? 5 : 2); // softer light to fill in the shadows (color, intensity) #replace the anem of v7.glb 
scene.add(ambientLight); //add the ambient light to the scence

if (objToRender === "v7.glb"){
    controls = new OrbitControls(camera, renderer.domElement); //allow the user to move the camera around the sceen
}
//Render the scence
function animate(){
    requestAnimationFrame(animate); //call animate again on the next frame
    renderer.render(scene, camera); //render the scene
}

//add a event lister to window to resize the window and the camera 
window.addEventListener('resize', function(){
    //update the camera aspect ratio and projection matrix
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    //update the renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();