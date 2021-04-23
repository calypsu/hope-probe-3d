import { CSS2DRenderer, CSS2DObject } from './examples/jsm/renderers/CSS2DRenderer.js';
import { GLTFLoader } from './examples/jsm/loaders/GLTFLoader.js';
import {
    Mesh,
    Scene,
    WebGLRenderer,
    MeshBasicMaterial,
    SphereGeometry,
    PerspectiveCamera,
    DoubleSide,
    TextureLoader,
    EllipseCurve,
    BufferGeometry,
    LineBasicMaterial,
    Line,
    Path,
    AmbientLight,
    Matrix4,
    Vector3,
    Vector2,
    Raycaster,
} from './build/three.module.js';
import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';
import { Projector } from './examples/jsm/renderers/Projector.js';
const { PI, cos, sin } = Math;

var lang = window.lang || 'en';

// SETUP

var scene = new Scene();

var camera = new PerspectiveCamera( 10, window.innerWidth / window.innerHeight, 0.1, 100000 );
var canvRenderer = document.getElementById('main-canvas');

var renderer = new WebGLRenderer({
    antialias: true,
    canvas: canvRenderer
});

const getDate = () => (new Date());

camera.position.z = 1000;
camera.position.y = -3000;
camera.lookAt(new Vector3(0, 0, 0));

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
document.body.appendChild( renderer.domElement );

var controls = new OrbitControls( camera, renderer.domElement );

var labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, window.innerHeight );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.left = '0';
document.body.appendChild(labelRenderer.domElement);

var labelControls = new OrbitControls( camera, labelRenderer.domElement );

const raycaster = new Raycaster();
const mouseVector = new Vector2();
let objectInFocus = null;
window.addEventListener('mousemove', e => {
    mouseVector.x = 2 * (e.clientX / window.innerWidth) - 1;
    mouseVector.y = 1 - (2 * (e.clientY / window.innerHeight));
});

// COMMON VARIABLES 

var dayFactor =  1000 * 24 * 60 * 60;

var startTime = (new Date('2020-07-19T21:58:14Z')).getTime();
var endTime = (new Date('2021-02-09T17:00:00Z')).getTime();
var previousTime = getDate().getTime();
var time = startTime;

var _speed = (text, crunch) => ({ text, crunch });
var speeds = [
    _speed(`${strings.second[lang]}`, 1000),
    _speed(`${strings.day[lang]}`, dayFactor),
    _speed(`${strings.week[lang]}`, dayFactor * 7),
    _speed(`${strings.month[lang]}`, dayFactor * 30)
];


// CONTROL FUNCTIONS

var pause = true, changing = false, lastTime;
var rangeElement = document.getElementById('currentTime');
rangeElement.addEventListener('pointerdown', () => { changing = true; });
rangeElement.addEventListener('pointerup', (e) => {
    time = startTime + (e.target.value * dayFactor);
    changing = false;
});

window.playPause = e => {
    pause = !pause;
    if (!pause) {
        previousTime = getDate().getTime();
    }
}

var currentSpeed = 0;
const setCurrentTime = () => document.getElementById('current-speed').innerHTML = speeds[currentSpeed].text;
window.changeSpeed = by => {
    currentSpeed = (currentSpeed == 0 && by == -1) ? speeds.length - 1 : (currentSpeed == speeds.length - 1 && by == 1) ? 0 : currentSpeed + by;
    fromCrunch = speeds[currentSpeed].crunch;
    setCurrentTime();
}

const endLoad = () => {
    document.getElementById('loader').style.display = 'none';
    pause = false;
    menuResize();
}

var tz = 0;

window.changeTimeZone = () => {
    tz = (tz == 0) ? 4 * 60 * 60 * 1000 : 0;
    const uae = document.getElementById('uae-time-zone-btn');
    const utc = document.getElementById('utc-time-zone-btn');
    if (tz == 0) {
        utc.removeEventListener('click', changeTimeZone);
        uae.addEventListener('click', changeTimeZone);
        utc.classList.add('selected');
        uae.classList.remove('selected'); 
    } else {
        uae.removeEventListener('click', changeTimeZone);
        utc.addEventListener('click', changeTimeZone);
        utc.classList.remove('selected');
        uae.classList.add('selected');
    }
}

window.changeTimeZone();

// HELPER FUNCTIONS

var makePlanet = (material, radius) => {
    let object = new Mesh( new SphereGeometry(radius, 30, 30), material );
    
    scene.add(object);
    return object;
}

var makeOrbit = (params, hope = '') => {
    var ellipse = new EllipseCurve(...params);
    var points = ellipse.getPoints(50);
    var path = new Path(points);
    var geometry = (new BufferGeometry()).setFromPoints(points);
    const thisOrbitMaterial = (hope == '') ? orbitMaterial : new LineBasicMaterial( { color: 0xff0000 } );
    var orbit = new Line(geometry, thisOrbitMaterial);
    scene.add(orbit);

    return { orbit, path };
}

var makeLabel = (txt, isProbe = false) => {
    var e = document.createElement('div');
    e.innerHTML = txt;
    e.className = 'label';
    e.style.marginLeft = '-1.8rem';
    if (isProbe) e.style.marginTop = '-1rem';
    var labelObject = new CSS2DObject( e );
    return labelObject;
}

var makeModalTrigger = (material, radius) => {
    const object = new Mesh(new SphereGeometry(radius, 10, 10), material);
    scene.add(object);
    return object;
}

var orbitMaterial = new LineBasicMaterial({ color: 0xaaaaaa });

const getTruncValue = (i) => i % 1;

var mars_angle_start = 232 / 360 * 2 * PI;

const getRotatedValues = (point, angle) => ({
    x: (point.x * cos(angle)) - (point.y * sin(angle)),
    y: (point.y * cos(angle)) + (point.x * sin(angle))
});

var peri = 14.7;

// MAKING OBJECTS

// GUIDES
// const guide1 = makePlanet(new MeshBasicMaterial({ color: 0xFF0000 }), 3);
// const guide2 = makePlanet(new MeshBasicMaterial({ color: 0x00FF00 }), 3);
// const guide3 = makePlanet(new MeshBasicMaterial({ color: 0x0000FF }), 3);

// const dist = 40;
// guide1.position.x = dist;
// guide2.position.y = dist;
// guide3.position.z = dist;

// // scene.add(guide1);
// // scene.add(guide2);
// // scene.add(guide3);

// MAKE ENVIRONMENT

(new TextureLoader()).load(files.space, function( texture ) {
    var sphereGeometry = new SphereGeometry( 8000, 100, 100 )
    var sphereMaterial = new MeshBasicMaterial({
        map: texture,
        side: DoubleSide
    })
    var mesh = new Mesh( sphereGeometry, sphereMaterial );
    scene.add( mesh );
    mesh.position.set( 0, 0, 0 )
})

// ADDING SUN

var sun = makePlanet(
    new MeshBasicMaterial( { color: 0xffff00 } ),
    10
);

    // ADDING SUN IMAGE

    var sun_image = (() => {
        var image = document.createElement("img");
        image.setAttribute('src', files.sun);
        image.style.width = '120px';
        image.setAttribute('id', 'sun-image');
        var imageObject = new CSS2DObject(image);
        return imageObject;
    })();

    sun.add(sun_image);

// ADDING EARTH

var earth = makePlanet(
    new MeshBasicMaterial( { map: (new TextureLoader()).load(files.earth) } ),
    10
);

earth.rotateX(PI / 2);

    // ADDING EARTH ORBIT

    var e_orbit = makeOrbit([
        -2.5, 0,
        149.5, 149.4,
        0, 2 * PI,
        false,
        0
    ]);

    // ADDING EARTH LABEL

    var e_label = makeLabel(strings.earth[lang]);
    earth.add(e_label);

// ADDING MARS

var mars = makePlanet(
    new MeshBasicMaterial( { map: (new TextureLoader()).load(files.mars) }),
    10
);

mars.rotateX(PI / 2);

    // ADDING MARS ORBIT

    var m_orbit = makeOrbit([
        -22, 0,
        227, 225.93,
        0, 2 * PI,
        false,
        0
    ]);
    
    m_orbit.orbit.rotateZ(mars_angle_start);

    var m_label = makeLabel(strings.mars[lang]);
    mars.add(m_label);

// ADDING HOPE PROBE

var probe;

    var h_orbit;
    var l_container = document.getElementById('loading-percentage');
        
    // LOADING HOPE PROBE MODEL
    
    const objLoader = new GLTFLoader();
    objLoader.load(
        files.hope_probe_glb,
        object => {
            probe = object.scene;
            let matrix4 = new Matrix4();
            matrix4.makeScale( 1.5, 1.5, 1.5 );
            probe.applyMatrix4(matrix4);

            const light = new AmbientLight(0xffffff, 10);
            scene.add(light);

            scene.add(probe);
            probe.rotation.x = PI / 2;
            probe.rotation.y = PI;

            // ADDING HOPE PROBE TRAJECTORY

            h_orbit = makeOrbit([
                47, 0,
                200.21, 192.22,
                PI, PI + 2.257,
                false,
                0
            ], 'hope');

            h_orbit.orbit.rotateZ(0.23);

            var h_label = makeLabel(strings.hope_probe[lang], true);
            probe.add(h_label);

            endLoad();
        },
        xhr => {
            l_container.innerHTML = Math.floor(xhr.loaded / 4007704 * 100) + "%";
        },
        err => { console.log(err); }
    );

// ADDING HOPE PROBE ORBIT AROUND MARS

var probe_orbit;
    
    let zoom_on_mars = false;
    let zoomTriggered = false;
    let zoomTimeStart = (new Date()).getTime();
    let zoomTransitionPeriod = 1000 * 2;
    let initialZoomCameraPosition = {};
    let zoomInTo = { x: 0, y: -3000, z: 1000 };

    const probe_orbit_time_period = 1000 * 60 * 60 * 55; // HOPE PROBE ORBITTING TIME PERIOD 
    let probe_orbit_time_cursor = (new Date()).getTime();
    probe_orbit = makeOrbit([
        -10, 0,
        33, 24,
        0, 2 * PI,
        false,
        0
    ]);
    scene.add(probe_orbit);
    const poObj = probe_orbit.orbit;
    const { path: probe_orbit_path } = probe_orbit;

    
// ADDING MODAL TRIGGERS
let modalsCreated = false;
const modalTriggerRadius = 4;
let modalCSSObjects = [];
let blinkPeriod = 0.5 * 1000;

window.createModalTriggers = () => {
    modalPositions = modalPositions.map((pos, index) => {
        const sphere = makeModalTrigger(new MeshBasicMaterial({ color: 0xFF0000 }), modalTriggerRadius);
        const position = getRotatedValues(h_orbit.path.getPoint(modalPositions[index] / 100), 0.24);
        sphere.position.x = position.x;
        sphere.position.y = position.y;

        const cssMarker = document.createElement("div");
        const style = {
            width: '50px',
            height: '50px',
            background: 'red',
            'border-radius': '100%',
            cursor: 'pointer'
        };
        Object.keys(style).map(key => cssMarker.style[key] = style[key]);
        cssMarker.classList.add('modal-trigger');
        const cssMarkerObject = new CSS2DObject(cssMarker);
        modalCSSObjects.push(cssMarkerObject);

        let label = makeLabel(window.modals[index][window.lang == 'en' ? 'Title' : 'arabic_title']);
        label.element.style.cursor = 'pointer';
        label.element.style.marginTop = '-1rem';
        label.element.style['text-transform'] = 'capitalize';
        label.element.onpointerdown = () => {
            objectInFocus = { object: sphere };
            window.click();
        }
        sphere.add(label);

        sphere.add(cssMarkerObject);

        return sphere;
    })
}


// ANIMATION FUNCTIONS STACK AND GLOBAL VARIABLES

var currentTimeElement = document.getElementById('current');
var isLiveEle = document.getElementById('is-live');
var goLiveEle = document.getElementById('go-live');
var completed;

var fstack = [

    // EARTH REVOLUTION
    
    () => {
        var point = e_orbit.path.getPoint(getTruncValue(((1/(365 * dayFactor)) * (time - startTime)) + 0.547));
        earth.position.x = point.x;
        earth.position.y = point.y;
    },

        // EARTH AND MARS ROTATION

        () => {
            var angle = earth.rotation.y;
            angle = (((2 * PI) / dayFactor) * (time % dayFactor)) - 3.4;
            earth.rotation.y = angle;
            mars.rotation.y = angle;
        },

    // MARS REVOLUTION

    () => {
        var point = m_orbit.path.getPoint(getTruncValue(((1/(685 * dayFactor)) * (time - startTime)) + 0.968));
        point = getRotatedValues(point, mars_angle_start);
        mars.position.x = point.x;
        mars.position.y = point.y;
    },

    // HOPE PROBE TRAVEL

    () => {
        if (probe != undefined) {
            completed = (time - startTime) / (endTime - startTime);
            let point = {};
            if (completed < 1) {
                point = getRotatedValues(h_orbit.path.getPoint(completed), 0.24);
                poObj.visible = false;

                probe.position.x = point.x;
                probe.position.y = point.y;
                probe.position.z = (point.z || -1);
            }
        }
        
    },

    // CSS ELEMENTS RESIZING

    () => {
        let distanceFromSunRatio = 4000 / camera.position.distanceTo(new Vector3(0, 0, 0));
        sun_image.element.style.width = Math.floor(100 * distanceFromSunRatio) + 'px';
        modalCSSObjects.map(mco => {
            const modalTriggerSize = 13;
            mco.element.style.width = Math.floor(modalTriggerSize * distanceFromSunRatio) + 'px';
            mco.element.style.height = Math.floor(modalTriggerSize * distanceFromSunRatio) + 'px';
        })
    },

    // RANGE UPDATE

    () => {
        if (!changing) {
            rangeElement.value = Math.floor((time - startTime) / dayFactor);
        }
    },

    // CLOCK

    () => {
        const timestamp = getDate().getTime();
        const elapsed = timestamp - previousTime;
        time += (fromCrunch / toCrunch) * elapsed;
        previousTime = timestamp;
    },

    // SETTING CURRENT TIME

    () => {
        currentTimeElement.innerHTML = (new Date(time + tz)).toUTCString().split(" ").slice(0, 5).join(" ");
    },

    // CHECK LIVE

    () => {
        if (Math.floor(time / 10000) != Math.floor(getDate().getTime() / 10000) || fromCrunch != 1000) {
            goLiveEle.style.display = 'inline-block';
            isLiveEle.style.display = 'none';
        } else {
            goLiveEle.style.display = 'none';
            isLiveEle.style.display = 'flex';
        }
    },

    // TRIGGER CREATION OF MODAL TRIGGERS

    () => {
        if (!modalsCreated && probe != undefined && modalPositions.length > 0) {
            modalsCreated = true;
            createModalTriggers();
        }
    },

    // CHECK ZOOM TRIGGER

    () => {
        if (!zoomTriggered) {
            if (time > endTime) {
                zoomTriggered = true;
                camera.position.x = mars.position.x;
                camera.position.y = mars.position.y;
                camera.position.z = 400;
                camera.lookAt(mars.position);
            }
        } else {
            if (time < endTime) {
                zoomTriggered = false;
                zoomTimeStart = (new Date()).getTime();
                camera.position.x = 0;
                camera.position.z = 1000;
                camera.position.y = -3000;
                camera.lookAt(new Vector3(0, 0, 0));
            }
        }
    },

    // BLINK MODAL TRIGGERS

    () => {
        modalCSSObjects.map(el => {
            let raiseLevel = Math.abs((((new Date()).getTime() - startTime) % blinkPeriod) - (blinkPeriod / 2)) / blinkPeriod * 255;
            el.element.style.backgroundColor = `rgb(255, ${raiseLevel}, ${raiseLevel})`
        })
    },

    // ZOOM ANIMATION

    () => {
        // let currentTime = (new Date()).getTime();
        // if (currentTime - zoomStartTime < zoomTransitionPeriod) {
        //     camera.position.x = (0 - camera.position.x) / zoomTransitionPeriod;
        // }
    },

    // RAYCASTING HANDLER

    () => {
        raycaster.setFromCamera(mouseVector, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        objectInFocus = intersects[0];
        counter++;
    },

    // POST COMPLETION OF HOPE PROBE TRAVEL

    () => {
        if (completed >= 1 && probe != undefined) {
            let point;
            poObj.visible = true;
            poObj.position.x = mars.position.x;
            poObj.position.y = mars.position.y;
            let potp = probe_orbit_time_period;
            let time_ratio = ((time - startTime) % potp) / potp;
            let poObjPosition = probe_orbit_path.getPoint(time_ratio);
            point = {
                x: poObjPosition.x + mars.position.x,
                y: 1.55 + poObjPosition.y + mars.position.y,
                z: mars.position.z
            };
            probe.rotation.y = (time_ratio * 2 * PI) - (PI / 2);

            probe.position.x = point.x;
            probe.position.y = point.y - 2;
            probe.position.z = (point.z || -1);
        }
    },

];

let counter = 1;

window.goToCurrentTime = () => {
    time = getDate().getTime();
    fromCrunch = 1000;
    setCurrentTime();
}

// CLICK EVENT HANDLER

window.addEventListener('pointerdown', e => {
    let i = 0;
    let objectFound = null;
    while (i < modalPositions.length) {
        const obj = modalPositions[i];
        if (obj.uuid == objectInFocus.object.uuid) {
            objectFound = objectInFocus.object;
            break;
        }
        i++;
    }
    if (objectFound) window.openModal(i);
})

// MAIN ANIMATE FUNCTION

let fromCrunch = dayFactor;
let toCrunch = 1000;

const animationEndTime = startTime + (250 * dayFactor);

function animate() {
    requestAnimationFrame( animate );

    if (!pause) {
        for (let i=0; i < fstack.length; i++) {
            fstack[i]();
        }
    } else fstack.slice(fstack.length - 2, fstack.length).map(e => e());

    renderer.render( scene, camera );
    labelRenderer.render( scene, camera );
}
goToCurrentTime();
animate();