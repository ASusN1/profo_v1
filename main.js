//immport 3js libaray 
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
//To allow camera to move around the scene
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
//To allow for importing the .gilf file
import {GLTFLoader} from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
//To load EXR environment textures
import {EXRLoader} from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/EXRLoader.js';
//Import clickable objects configuration
import {objectInfo, validClickableNames} from './clickableObjects.js';





//Create a 3 js screen 
const scene = new THREE.Scene();

// Load equirectangular environment texture from EXR
const exrLoader = new EXRLoader();
exrLoader.load('image/belfast_sunset_puresky_1k.exr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture; // Improves object lighting
});

//Create a camera to view the scence
const camera = new THREE.PerspectiveCamera(75, window.innerWidth /window.innerHeight, 0.01, 1000);

//keep the 3D object as global so access later 
let object; 
//Orbitcontrols allow the camera to move around the sceen
let controls;
//set which object to render 
let objToRender = "v17.glb"; //Note: not sure if this is the correct  name, re check later to find the correct 1  *** repalce this with the roomthingy 
//Instaniate a loeader for the gltf file 
const loader = new GLTFLoader();

// ===== ANIMATION SETUP =====
let mixer;
let actions = {};
let currentAction = null;
const clock = new THREE.Clock();

// ===== RAYCASTING SETUP FOR CLICK & HOVER =====
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let intersectedObject = null; // Track hovered object

// Array to store clickable objects with their metadata
const clickableObjects = [];

// Store original materials for hover effect
const originalMaterials = new Map(); 

// ===== AUDIO SETUP =====
const backgroundAudio = new Audio('sound/sound_track_background.mp3');
backgroundAudio.loop = true;
backgroundAudio.volume = 0.5;
let isAudioPlaying = false;

// Function to toggle music
function toggleMusic() {
    const musicIcon = document.getElementById('music-icon');
    
    if (isAudioPlaying) {
        // Turn off music
        backgroundAudio.pause();
        musicIcon.src = 'icon/music_off.png';
        isAudioPlaying = false;
        console.log('Music stopped');
    } else {
        // Turn on music
        backgroundAudio.play().catch(error => {
            console.log('Could not play audio:', error);
        });
        musicIcon.src = 'icon/music_on.png';
        isAudioPlaying = true;
        console.log('Music playing');
    }
}

// Music toggle button event listener
document.getElementById('music-toggle').addEventListener('click', function() {
    toggleMusic();
});

// Try to autoplay
const playPromise = backgroundAudio.play();
if (playPromise !== undefined) {
    playPromise.then(() => {
        isAudioPlaying = true;
        console.log('Autoplay successful');
    }).catch(error => {
        console.log('Autoplay blocked. Will play on first user interaction.');
        document.addEventListener('click', function playOnClick() {
            backgroundAudio.play();
            isAudioPlaying = true;
            document.getElementById('music-icon').src = 'icon/music_on.png';
            document.removeEventListener('click', playOnClick);
        }, { once: true });
    });
}

// ===== KEYBOARD EVENT - PRESS 'M' TO STOP AUDIO =====
document.addEventListener('keydown', function(event) {
    if (event.key === 'm' || event.key === 'M') {
        toggleMusic();
    }
});

//Load the gltf file 
loader.load('model/v17.glb', function(gltf){
    //if the file load --> add to the scence
    object = gltf.scene; 
    scene.add(object);
    console.log('Model loaded successfully!');
    
    // ===== SETUP ANIMATIONS =====
    mixer = new THREE.AnimationMixer(object);
    const animations = gltf.animations;
    console.log('Available animations:', animations.map(a => a.name));
    
    // Create action objects for available animations
    animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        actions[clip.name] = action;
        
        // Set Wave to loop
        if (clip.name === 'Wave') {
            action.loop = THREE.LoopRepeat;
            action.clampWhenFinished = false;
        }
    });
    
    // Play Wave animation by default
    if (actions['Wave']) {
        actions['Wave'].play();
        currentAction = actions['Wave'];
        console.log('Playing Wave animation (looping)');
    } else if (animations.length > 0) {
        const firstAnimation = animations[0].name;
        actions[firstAnimation].play();
        currentAction = actions[firstAnimation];
        console.log('Wave animation not found, playing:', firstAnimation);
    }
    
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
    object.traverse(function(child) {
        if (child.isMesh) {
            // Store original material with all properties
            const materialClone = child.material.clone();
            originalMaterials.set(child, materialClone);
        }
        
        // Check if this object should be clickable (mesh or non-mesh)
        if (validClickableNames.has(child.name) && objectInfo[child.name]) {
            clickableObjects.push({
                mesh: child,
                ...objectInfo[child.name]
            });
            console.log('Clickable object added:', child.name, '| Type:', child.type);
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
camera.position.x = -15;    // Left (-) / Right (+)
camera.position.y = 10;    // Down (-) / Up (+)
camera.position.z = 6;    // Distance from object

// The starting camera rotation 
camera.lookAt(0, 0, 0);  // 

//Add light to the sceence, so we can see the object
const topLight = new THREE.DirectionalLight(0xffffff, 1.2); //(color, intensity)
topLight.position.set(10, 15, 10);   //position the light above the object ( top left ish) -- 500 is the distance from the object, adjust as needed
topLight.castShadow = true; //allow the light to cast shadows
scene.add(topLight); //add the light to the scence

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // softer light to fill in the shadows (color, intensity)
scene.add(ambientLight); //add the ambient light to the scence

if (objToRender === "v17.glb"){
    controls = new OrbitControls(camera, renderer.domElement); //allow the user to move the camera around the sceen
}
//Render the scence
function animate(){
    requestAnimationFrame(animate); //call animate again on the next frame
    
    // Update animation mixer
    if (mixer) {
        mixer.update(clock.getDelta());
    }
    
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
        if (intersectedObject.mesh.isMesh) {
            const originalMat = originalMaterials.get(intersectedObject.mesh);
            if (originalMat) {
                intersectedObject.mesh.material = originalMat;
            }
        }
        document.body.style.cursor = 'default';
    }
    
    // Highlight hovered object
    if (intersects.length > 0) {
        intersectedObject = clickableObjects.find(obj => obj.mesh === intersects[0].object);
        if (intersectedObject) {
            console.log('Hovering over:', intersectedObject.title);
            // Create highlight effect (emissive glow) - only for meshes
            if (intersectedObject.mesh.isMesh) {
                const originalMat = originalMaterials.get(intersectedObject.mesh);
                if (originalMat) {
                    const highlightMaterial = originalMat.clone();
                    highlightMaterial.emissive = new THREE.Color(0xffff00);
                    highlightMaterial.emissiveIntensity = 0.5;
                    intersectedObject.mesh.material = highlightMaterial;
                }
            }
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
    //handle image stuff for pop up 
    const popupImage = document.getElementById('popup-image');
    if (objectData.image) {
        popupImage.src = objectData.image;
        popupImage.style.display = 'block';
    } else {
        popupImage.style.display = 'none';
    }
    
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

// ===== MENU BUTTON EVENT LISTENERS =====
// Map menu data-game values to objectInfo keys
const menuMapping = {
    'extractorv2': 'ExtractorV2_1',
    'fatseal': 'fat_seal',
    'sudoku': 'sudoku_1'
};

// Add click listeners to all menu items
document.querySelectorAll('.menu-item').forEach(button => {
    button.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent 3D click detection
        const gameType = this.getAttribute('data-game');
        const objectKey = menuMapping[gameType];
        
        if (objectKey && objectInfo[objectKey]) {
            console.log('Menu clicked:', gameType, '-> showing', objectKey);
            showPopup(objectInfo[objectKey]);
        }
    });
});

//add a event lister to window to resize the window and the camera 
window.addEventListener('resize', function(){
    //update the camera aspect ratio and projection matrix
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    //update the renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== SOCIAL MEDIA ICON LINKS =====
// Set up social media icon click handlers to use links from objectInfo
document.querySelectorAll('.social-icon').forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        const socialId = this.getAttribute('data-social');
        if (objectInfo[socialId] && objectInfo[socialId].link) {
            window.open(objectInfo[socialId].link, '_blank');
        }
    });
});

// USE ONLY V14B FOR NOW, V12 HAS A BUG WITH THE CAMERA AND ORBIT CONTROLS, REVERT TO V12 LATER IF NEEDED
animate();