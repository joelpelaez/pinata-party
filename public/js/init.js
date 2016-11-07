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

/**
 * init: Inicializa los objetos para la renderización.
 */
function init(model_id, interface) {
    /**
     * Se obtiene el contenedor del canvas y se extrae
     * el ancho y se calcula el posible alto.
     */
    container = $("#glcanvas");
    width = Math.floor(container.innerWidth());
    height = width;

    /**
     * Se calcula es aspecto (proporción de vista)
     * de la camara.
     */
    aspect = 1;

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
    addDragDropHandler(canvas);
    container.append(canvas);
    current = interface;
    loadScene("/api/pinata/models/" + model_id, "/textures/");
}

/**
 * animate: dibuja el contenido de manera periodica a 60 fps
 */
function animate() {
    renderer.render(scene, camera);

    // Reestablecer el dibujado.
    requestAnimationFrame(animate);
}

/**
 * window resize event: Se cambia el tamaño del canvas
 * de acuerdo al tamaño de la ventana y su contenedor.
 */
var old_width;
window.addEventListener('resize', function(event) {
    if (container == undefined || camera === undefined || width === undefined) {
        // No actualizar nada si no se ha inicializado.
        return;
    }
    width = Math.floor(container.width());
    height = width;
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}, true);

/**
 * Calculo de posición de un objeto 3D en el canvas, utiliza la información del evento.
 */
function objectInPosition(evt) {
    var rect = renderer.domElement.getBoundingClientRect();
    var mouse = new THREE.Vector2( ( ( evt.clientX - rect.left ) / rect.width ) * 2 - 1,   //x
                                  -( ( evt.clientY - rect.top ) / rect.height ) * 2 + 1);   //y
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children, true );
    return intersects;
}

/**
 * Selección de objetos: solo trabaja con el primer objeto de la colisión.
 */
 var moved = false;

function touchObject(evt) {
    var intersects = objectInPosition(evt);
    if (intersects.length > 0) {
        if (active_controller) active_controller.css("display", "none");
            active_controller = controllers[intersects[0].object.name.split('.')[0]];
        if (active_controller !== undefined)
            active_controller.css("display", "block");
    }
}

/**
 * Sistema de rotación por eventos del ratón: no aplica touch
 */
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
        touchObject(evt);
        moved = false;
    }
    mouseDown = false;
}

function onMouseLeave(evt) {
    evt.preventDefault();
    mouseDown = false;
}

function addMouseHandler(canvas) {
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mouseleave', onMouseLeave, false);
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
    if (x > 1 || y > 1) {
        moved = true;
    }
    rotateScene(x, y);
    touchX = touch.clientX;
    touchY = touch.clientY;
}

function onTouchEnd(evt) {
    evt.preventDefault();
    touchDown = false;
    if (!moved) {
        touchObject(evt.changedTouches[0]);
        moved = false;
    }
}

function onTouchStart(evt) {
    evt.preventDefault();
    touchDown = true;
    moved = false;
    var touch = evt.changedTouches[0];
    touchX = touch.clientX;
    touchY = touch.clientY;
}

function addTouchHandler(canvas) {
    canvas.addEventListener('touchmove', onTouchMove, false);
    canvas.addEventListener('touchend', onTouchEnd, false);
    canvas.addEventListener('touchstart', onTouchStart, false);
    canvas.addEventListener('touchleave', onTouchEnd, false);
}

function onDragOver(evt) {
    evt.preventDefault();
}

function onDrop(evt) {
    evt.preventDefault();
    var data = evt.dataTransfer.getData("text");
    var intersects = objectInPosition(evt);
    if (intersects.length > 0) {
        setTexture(intersects[0].object.name, data);
    }
}

function addDragDropHandler(canvas) {
    canvas.addEventListener('dragover', onDragOver, false);
    canvas.addEventListener('drop', onDrop, false);
}