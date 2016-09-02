/**
 * setColor: Cambia el color de un elemento dentro de la escena
 *
 * objectname: nombre del objeto a cambiar de color
 * color: objeto con las propiedades r (rojo), g (verde) y b (azul)
 */

function setColor(objectname, color) {
    var object = scene.getObjectByName(objectname);
    if (object === undefined || object.material === undefined)
        return;
    var objcolor = object.material.color;
    objcolor.r = color.r;
    objcolor.g = color.g;
    objcolor.b = color.b;
}

/**
 * setTexture: Cambia la textura de un elemento
 */
function setTexture(objectname, textureurl) {
    var object = scene.getObjectByName(objectname);
    if (object === undefined || object.material === undefined)
        return;
    var loader = new THREE.TextureLoader();
    loader.load(textureurl, function(t) {
        object.material.map = t;
        object.material.needsUpdate = true;
    });
}