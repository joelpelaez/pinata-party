/**
 * Variables de tamaño del canvas
 */
var width, height, aspect;
/**
 *  Objeto DOM del contenedor del canvas 
 */
var container;
/**
 * Objeto WebGLRenderer para la renderización de la escena.
 */
var renderer;

/**
 * DOM Canvas del WebGLRenderer
 */
var canvas;

/**
 * Current model: modelo actual
 */
var current;

/**
 * initScene: Inicializa la escena con las acciones principales.
 */
function initScene() {
    animate();
}

/*+
 * Manejo de estadisticas: solo para depuración, posteriormente se
 * eliminará.
 */
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

/**
 * init: Inicializa los objetos para la renderización.
 */
function init(model_id, interface) {
    /**
     * Se obtiene el contenedor del canvas y se extrae
     * el ancho y se calcula el posible alto.
     */
    container = $("#glcanvas");
    width = container.innerWidth();
    height = width;

    /**
     * Se calcula es aspecto (proporción de vista)
     * de la camara.
     */
    aspect = 1

    /**
     * Se crea el objeto de renderización y se establede un tamaño
     */
    var ratio = window.devicePixelRatio || 1;
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height);
    /**
     * Se agrega el render al documento HTML y luego se carga
     * la escena de la carpeta models.
     */
    canvas = renderer.domElement;
    addMouseHandler(canvas);
    addTouchHandler(canvas);
    container.append(canvas);
    current = interface;
    loadScene("/api/models/" + model_id, "/textures/");
}

/**
 * animate: dibuja el contenido de manera periodica a 60 fps
 */
function animate() {
    stats.begin();

    renderer.render(scene, camera);

    stats.end();
    // Reestablecer el dibujado.
    requestAnimationFrame(animate);
}

/**
 * window resize event: Se cambia el tamaño del canvas
 * de acuerdo al tamaño de la ventana y su contenedor.
 */
var old_width;
window.addEventListener('resize', function(event) {
    width = container.width();
    height = width;
    if (camera === undefined || width === undefined) {
        // No actualizar nada si no se ha inicializado.
        return;
    }
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}, true);

/**
 * Sistema de rotación por eventos del ratón: no aplica touch
 */
var moved = false;

var mouseDown = false,
    mouseX = 0,
    mouseY = 0;

function onMouseMove(evt) {
    if (!mouseDown) {
        return;
    }

    evt.preventDefault();
    moved = true;
    var deltaX = evt.clientX - mouseX,
        deltaY = evt.clientY - mouseY;
    mouseX = evt.clientX;
    mouseY = evt.clientY;
    rotateScene(deltaX, deltaY);
}

function onMouseDown(evt) {
    evt.preventDefault();
    moved = false;
    mouseDown = true;
    mouseX = evt.clientX;
    mouseY = evt.clientY;
}

function onMouseUp(evt) {
    evt.preventDefault();
    if (!moved) {
        var rect = renderer.domElement.getBoundingClientRect();
        console.log(evt.clientX - rect.left);
        console.log(evt.clientY - rect.top);

        var mouse = new THREE.Vector2( ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1,   //x
                                      -( ( event.clientY - rect.top ) / rect.height ) * 2 + 1);   //y
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( scene.children, true );
        // Change color if hit block
        if ( intersects.length > 0 ) {
            console.log(intersects);
            intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );
        }
        moved = false;
    }
    mouseDown = false;
}

function onMouseLeave(evt) {
    evt.preventDefault();
    mouseDown = false;
}

function addMouseHandler(canvas) {
    canvas.addEventListener('mousemove', function (e) {
        onMouseMove(e);
    }, false);
    canvas.addEventListener('mousedown', function (e) {
        onMouseDown(e);
    }, false);
    canvas.addEventListener('mouseup', function (e) {
        onMouseUp(e);
    }, false);
    canvas.addEventListener('mouseleave', function (e) {
        onMouseLeave(e);
    }, false);
}

function rotateScene(deltaX, deltaY) {
    var center = scene.getObjectByName(current_interface.model.center.name);
    center.rotateOnAxis(new THREE.Vector3(0, 1, 0), -deltaX / 100);
    center.rotateOnAxis(new THREE.Vector3(1, 0, 0), deltaY / 100);
}

/**
 * Sistema de rotación por touch
 */
var touchDown = false,
    touchX = 0,
    touchY = 0;

function onTouchMove(evt) {
    if (!touchDown) {
        return;
    }
    var touch = evt.changedTouches[0];
    var x = touch.clientX - touchX;
    var y = touch.clientY - touchY;
    rotateScene(x, y);
    touchX = touch.clientX;
    touchY = touch.clientY;
}

function onTouchEnd(evt) {
    evt.preventDefault();
    touchDown = false;
}

function onTouchStart(evt) {
    evt.preventDefault();
    touchDown = true;
    var touch = evt.changedTouches[0];
    touchX = touch.clientX;
    touchY = touch.clientY;
}

function addTouchHandler(canvas) {
    canvas.addEventListener('touchmove', function (e) {
        onTouchMove(e);
    }, false);
    canvas.addEventListener('touchend', function (e) {
        onTouchEnd(e);
    }, false);
    canvas.addEventListener('touchstart', function (e) {
        onTouchStart(e);
    }, false);
    canvas.addEventListener('touchleave', function (e) {
        onTouchEnd(e);
    }, false);
}