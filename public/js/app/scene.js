/**
 * Información de la escena
 */
var scene;
var camera;
var status = {
    total: 0,
    loaded: 0
};

/**
 * Callback para la carga de la escena.
 * Inicializa los objetos al render.
 */
function loadCallback(object) {
    scene = object;
    camera = object.getObjectByName("Camera");
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    initScene();
    initControls();
}

/**
 * Registra el progreso
 */
function progressCallback(req) {
    console.log((req.loaded * 100 / req.total) + "% descargado")
    status.total = req.total;
    status.loaded = req.loaded;
}

/**
 * Se llama en caso de un error en la carga
 */
function errorCallback(req) {
    console.err('Error al cargar modelo');
    alert('Error al inicializar la escena: No existe el modelo.');
}

/**
 * Carga la escena
 */
function loadScene(path, textpath) {
    var loader = new THREE.ObjectLoader();
    loader.setTexturePath(textpath);
    loader.load(path, loadCallback, progressCallback, errorCallback);
}