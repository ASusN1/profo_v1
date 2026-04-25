//immport 3js libaray 
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
//To allow camera to move around the scene
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
//To allow for importing the .gilf file
import {GLTFLoader} from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
//Import clickable objects configuration
import {objectInfo, validClickableNames} from './clickableObjects.js';

//Create a 3 js screen 
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222); //add gray background so we can see if anything renders
//Create a camera to view the scence
const camera = new THREE.PerspectiveCamera(75, window.innerWidth /window.innerHeight, 0.01, 1000);

//keep the 3D object as global so access later 
let object; 
//Orbitcontrols allow the camera to move around the sceen
let controls;
//set which object to render 
let objToRender = "v14b.glb"; //Note: not sure if this is the correct  name, re check later to find the correct 1  *** repalce this with the roomthingy 
//Instaniate a loeader for the gltf file 
const loader = new GLTFLoader();

// ===== RAYCASTING SETUP FOR CLICK & HOVER =====
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let intersectedObject = null; // Track hovered object

// Array to store clickable objects with their metadata
const clickableObjects = [];

// Store original materials for hover effect
const originalMaterials = new Map(); 

//Load the gltf file 
loader.load('model/v14b.glb', function(gltf){
    //if the file load --> add to the scence
    object = gltf.scene; 
    scene.add(object);
    console.log('Model loaded successfully!');
    
    // Debug: Log all mesh names in the model
    console.log('=== All meshes in model ===');
    object.traverse(function(child) {
        if (child.isMesh) {
            console.log('Mesh found:', child.name);
        }
    });
    console.log('===========================');
    
//------------------------------------------------------------------------------
    // ===== SETUP CLICKABLE OBJECTS =====
    // confuses, check the 3js + js docs things 
    object.traverse(function(child) {
        if (child.isMesh) {
            // Store original material with all properties
            const materialClone = child.material.clone();
            originalMaterials.set(child, materialClone);
            
            // Check if this mesh should be clickable
            if (validClickableNames.has(child.name) && objectInfo[child.name]) {
                clickableObjects.push({
                    mesh: child,
                    ...objectInfo[child.name]
                });
                console.log('Clickable object added:', child.name);
            }
        }
    });
    console.log('Total clickable objects ready:', clickableObjects.length);
    },
//------------------------------------------------------------------------------
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
const renderer = new THREE.WebGLRenderer({alpah :true, antialias: true, tone: 'aces'}); //alpha for transparrent acgroudn 
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
//Add the rnder to the DOM
document.getElementById("container").appendChild(renderer.domElement);

//set distace of the camera from the scence
camera.position.z = 6;

//Add light to the sceence, so we can see the object
const topLight = new THREE.DirectionalLight(0xffffff, 1.2); //(color, intensity)
topLight.position.set(10, 15, 10);   //position the light above the object ( top left ish) -- 500 is the distance from the object, adjust as needed
topLight.castShadow = true; //allow the light to cast shadows
scene.add(topLight); //add the light to the scence

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // softer light to fill in the shadows (color, intensity)
scene.add(ambientLight); //add the ambient light to the scence

if (objToRender === "v14b.glb"){
    controls = new OrbitControls(camera, renderer.domElement); //allow the user to move the camera around the sceen
}
//Render the scence
function animate(){
    requestAnimationFrame(animate); //call animate again on the next frame
    renderer.render(scene, camera); //render the scene
}
//------------------------------------------------------------------------------
// ===== MOUSE MOVE EVENT (HOVER DETECTION) =====
window.addEventListener('mousemove', function(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Get intersected clickable objects
    const intersects = raycaster.intersectObjects(clickableObjects.map(obj => obj.mesh), false);
    
    // Reset previous hover
    if (intersectedObject) {
        const originalMat = originalMaterials.get(intersectedObject.mesh);
        if (originalMat) {
            intersectedObject.mesh.material = originalMat;
        }
        document.body.style.cursor = 'default';
    }
    
    // Highlight hovered object
    if (intersects.length > 0) {
        intersectedObject = clickableObjects.find(obj => obj.mesh === intersects[0].object);
        if (intersectedObject) {
            console.log('Hovering over:', intersectedObject.title);
            // Create highlight effect (emissive glow)
            const originalMat = originalMaterials.get(intersectedObject.mesh);
            const highlightMaterial = originalMat.clone();
            highlightMaterial.emissive = new THREE.Color(0xffff00);
            highlightMaterial.emissiveIntensity = 0.5;
            intersectedObject.mesh.material = highlightMaterial;
            document.body.style.cursor = 'pointer';
        }
    } else {
        intersectedObject = null;
    }
});

// ===== MOUSE CLICK EVENT (POPUP) =====
window.addEventListener('click', function(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects.map(obj => obj.mesh), false);
    
    if (intersects.length > 0) {
        const clicked = clickableObjects.find(obj => obj.mesh === intersects[0].object);
        if (clicked) {
            console.log('Clicked on:', clicked.title);
            showPopup(clicked);
        }
    }
});

// ===== POPUP FUNCTION =====
function showPopup(objectData) {
    const popup = document.getElementById('popup');
    document.getElementById('popup-title').textContent = objectData.title;
    document.getElementById('popup-description').textContent = objectData.description;
    
    if (objectData.link) {
        document.getElementById('popup-link').href = objectData.link;
        document.getElementById('popup-link').style.display = 'inline-block';
    } else {
        document.getElementById('popup-link').style.display = 'none';
    }
    
    popup.style.display = 'block';
}

// ===== POPUP DRAG FUNCTIONALITY =====
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

const popup = document.getElementById('popup');
const popupHeader = document.getElementById('popup-header');

// Mouse down on header to start dragging
popupHeader.addEventListener('mousedown', function(event) {
    isDragging = true;
    popup.classList.add('dragging');
    
    const popupRect = popup.getBoundingClientRect();
    dragOffsetX = event.clientX - popupRect.left;
    dragOffsetY = event.clientY - popupRect.top;
    
    event.preventDefault();
});

// Mouse move to drag
document.addEventListener('mousemove', function(event) {
    if (isDragging) {
        const newX = event.clientX - dragOffsetX;
        const newY = event.clientY - dragOffsetY;
        
        // Constrain popup within window bounds
        const constrainedX = Math.max(0, Math.min(newX, window.innerWidth - popup.offsetWidth));
        const constrainedY = Math.max(0, Math.min(newY, window.innerHeight - popup.offsetHeight));
        
        popup.style.position = 'fixed';
        popup.style.left = constrainedX + 'px';
        popup.style.top = constrainedY + 'px';
        popup.style.transform = 'none';
    }
});

// Mouse up to stop dragging
document.addEventListener('mouseup', function() {
    isDragging = false;
    popup.classList.remove('dragging');
});

// Close popup when clicking the X button
document.getElementById('popup-close').addEventListener('click', function() {
    popup.style.display = 'none';
});

// Close popup when clicking outside of it
window.addEventListener('click', function(event) {
    if (event.target === popup) {
        popup.style.display = 'none';
    }
});

//add a event lister to window to resize the window and the camera 
window.addEventListener('resize', function(){
    //update the camera aspect ratio and projection matrix
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    //update the renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
});



// USE ONLY V14B FOR NOW, V12 HAS A BUG WITH THE CAMERA AND ORBIT CONTROLS, REVERT TO V12 LATER IF NEEDED
animate();