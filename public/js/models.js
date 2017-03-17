/**
 * Array con todo los modelos disponibles en el sistema.
 * Por el momento solo se maneja de forma estática, al igual
 * que el contenido.
 *
 * Su función es optimizar el manejo de los modelos para
 * editar la interfaz de acuerdo a las propiedades que se deseen
 * cambiar.
 */
var models = [];
var current_model;
var current_interface;

// Carga la lista de modelos a models. Llama a callback cuando finaliza.
function loadModelList(callback) {
    $.getJSON('/api/pinata/models/', function(data) {
        models = data;
        callback();
    });
}
// Carga el modelo con el identificador id. Llama al callback cuando finaliza.
function loadModel(id, callback) {
    $.getJSON('/api/pinata/models/' + id, function(data) {
        current_model = data;
        callback()
    });
}

// Carga la interfaz con el identificador id. Llama al callback cuando finaliza.
function loadInterface(id, callback) {
    $.getJSON('/api/pinata/interface/' + id, function(data) {
        current_interface = data;
        callback();
    });
}

function loadInterfaceByName(name, callback) {
    $.getJSON('/interfaces/' + name, function(data) {
        current_interface = data;
        callback();
    });
}