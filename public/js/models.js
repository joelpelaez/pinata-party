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


/**
 * Modelo base: piñata cilindrica de cinco picos
 */

function loadModelList(callback) {
    $.getJSON('/api/models/', function(data) {
        models = data;
        callback();
    });
}
// unused 
function loadModel(id, callback) {
    $.getJSON('/api/models/' + id, function(data) {
        current_model = data;
        callback()
    });
}

function loadInterface(id, callback) {
    $.getJSON('/api/models/' + id + '/interface', function(data) {
        current_interface = data;
        callback();
    });
}