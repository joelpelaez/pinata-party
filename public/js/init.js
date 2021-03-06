/**
 * Ancho del canvas
 */
var width;

/**
 * Largo del canvas.
 */
var height;

/**
 * Aspecto de imagen. Basado en las medidas del canvas.
 */
var aspect;

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

// Rewrite ImageLoader load action, update the view if a new image is loaded.
THREE.ImageLoader.prototype.load = function (a,b,c,d) {
    var e = document.createElementNS("http://www.w3.org/1999/xhtml","img");
    e.onload = function() {
        URL.revokeObjectURL(e.src);
        b && b(e);
        animate();
    };
    if (0 === a.indexOf("data:")) 
        e.src = a;
    else {
        var f = new THREE.XHRLoader(this.manager);
        f.setPath(this.path);
        f.setResponseType("blob");
        f.load(a, function(a) {
            e.src = URL.createObjectURL(a)
        },c,d);
    }
    return e;
}


function removeOld() {
    $("#glcanvas").empty();
    $("#dynamic-controls").empty();
}

/**
 * init: Inicializa los objetos para la renderización.
 */
function init(model_name, interface) {
    /**
     * Se obtiene el contenedor del canvas y se extrae
     * el ancho y se calcula el posible alto.
     */
    container = $("#glcanvas");
    width = Math.floor(container.innerWidth());
    height = Math.floor(width / 1.66);

    /**
     * Se calcula es aspecto (proporción de vista)
     * de la camara.
     */
    aspect = width / height;

    /**
     * Se crea el objeto de renderización y se establede un tamaño
     */
    var ratio = window.devicePixelRatio || 1;
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
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
    loadScene("/models/" + model_name, "/textures/");
}

/**
 * animate: dibuja el contenido de manera periodica a 60 fps
 */
function animate() {
    if (container == undefined || camera === undefined || width === undefined) {
        // No actualizar nada si no se ha inicializado.
        return;
    }
    renderer.render(scene, camera);
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
    height = Math.floor(width / 1.66);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    animate();
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
 * Permite rotar el modelo desde el nodo padre, despues de la operación realiza
 * un dibujado de la pantalla.
 */
function rotateScene(deltaX, deltaY) {
    var center = scene.getObjectByName(current_interface.model.center.name);
    center.rotateOnAxis(new THREE.Vector3(0, 0, 1), deltaX / 100);
    center.rotateOnAxis(new THREE.Vector3(0, 1, 0), deltaY / 100);
    animate();
}

/**
 * Sistema de rotación por eventos del ratón: no aplica touch
 */
var mouseDown = false,
    mouseX = 0,
    mouseY = 0;
/**
 * Evento de movimiento. Si esta presionado, se rotara la figura.
 */
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

/**
 * Activar modo de rotación.
 */
function onMouseDown(evt) {
    evt.preventDefault();
    moved = false;
    mouseDown = true;
    mouseX = evt.clientX;
    mouseY = evt.clientY;
}

/**
 * Descativar modo de rotación
 */
function onMouseUp(evt) {
    evt.preventDefault();
    if (!moved) {
        touchObject(evt);
        moved = false;
    }
    mouseDown = false;
}

/*
 * Si el ratón sale del área se desactiva la rotación.
 */
function onMouseLeave(evt) {
    evt.preventDefault();
    mouseDown = false;
}

/**
 * Inicializar los eventos hacia el canvas.
 */
function addMouseHandler(canvas) {
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mouseleave', onMouseLeave, false);
}

/**
 * Sistema de rotación por touch
 */
var touchDown = false,
    touchX = 0,
    touchY = 0;

/**
 * Calcula el movimiento a partir del touch. Rota el modelo
 * si esta activo y se encuentra dentro del canvas.
 */
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

/**
 * Detecta finalización del evento touch o salida del área.
 */
function onTouchEnd(evt) {
    evt.preventDefault();
    touchDown = false;
    if (!moved) {
        touchObject(evt.changedTouches[0]);
        moved = false;
    }
}

/**
 * Inicializa el evento de atrastrado y rotación.
 */
function onTouchStart(evt) {
    evt.preventDefault();
    touchDown = true;
    moved = false;
    var touch = evt.changedTouches[0];
    touchX = touch.clientX;
    touchY = touch.clientY;
}

/**
 * Asigna los eventos al canvas. Solo aplica en plataformas con touch.
 */
function addTouchHandler(canvas) {
    canvas.addEventListener('touchmove', onTouchMove, false);
    canvas.addEventListener('touchend', onTouchEnd, false);
    canvas.addEventListener('touchstart', onTouchStart, false);
    canvas.addEventListener('touchleave', onTouchEnd, false);
}

/**
 * Eventos drag'n drop.
 * Permite arrastrar imagenes (texturas) de la lista hacia los elementos
 * del modelo.
 */

/**
 * Desactiva el comportamiento natural, evitando arrastrar el canvas como imagen-
 */
function onDragOver(evt) {
    evt.preventDefault();
}

/**
 * Captura la información del evento drop a partir de dato "text".
 * Realiza el llamado a la textura en base al url.
 */
function onDrop(evt) {
    evt.preventDefault();
    var data = evt.dataTransfer.getData("text");
    var intersects = objectInPosition(evt);
    if (intersects.length > 0) {
        setTexture(intersects[0].object.name, data);
    }
}

/**
 * Habilita los events para el manejo de drag'n drop en el canvas.
 */
function addDragDropHandler(canvas) {
    canvas.addEventListener('dragover', onDragOver, false);
    canvas.addEventListener('drop', onDrop, false);
}