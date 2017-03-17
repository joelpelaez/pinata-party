// Lista de controles
var controllers = {};
// Control activo
var active_controller = undefined;

/**
 * Inicializa el manejo de los controles del modelo, solo puede llamarse si
 * la escena ha sido cargada completamente (sin contar texturas).
 *
 * En esta implementación solo crea elementos DOM para la modificación de los
 * atributos de los materiales que tiene el modelo (texturas y colores)
 * dependiendo de los detalles que se especifican en el formato.
 */
function initControls() {
    root_container = $("#dynamic-controls");
    for (var name in current_interface.model) {
        // Skip non-object nodes as "extra info"
        if (typeof(current_interface.model[name]) !== "object")
            continue;
        console.log(name);
        var objnode = current_interface.model[name];
        var obj = undefined; // Object to attach
        var container = $("<div></div>");
        container.addClass('obj-config');
        container.css("display", "none");
        root_container.append(container);
        if (objnode["name"] !== undefined) {
            obj = scene.getObjectByName(objnode["name"]);
            console.log(objnode["name"]);
            $("<h2>" + objnode["show_name"] + "</h2>").appendTo(container);
        }
        // Crear un color picker si el objeto permite cambio de color.
        if (objnode["color_editable"] !== undefined &&
            objnode["color_editable"] === true) {
            createColorPicker(obj, container);
            container.addClass('color-picker');
        }
        // Crear una selección de personajes si el objeto permite cambio de textura.
        if (objnode["texture_editable"] !== undefined &&
            objnode["texture_editable"] === true) {
            createTexturePicker(obj, container);
            container.addClass('character-picker');
        }
        // Añadir el elemento a la lista.
        controllers[objnode.name] = container;
    }
}

/*
 * Crear un nuevo selecionador de color. Por defecto crea un input color.
 * Se enlazará con el objeto utilizando un evento.
 */
function createColorPicker(obj, container) {
    var o = $("<input/>");
    o.attr('type', 'color');
    o.attr('name', 'picker-' + obj.name);
    o.on('input', function(obj, o) {
        return function(event) {
            colorHelper(obj, o);
        }
    }(obj, o));
    container.append("Color: <br>");
    container.append(o);
    container.append("<br>");
}

/*
 * Crear un nuevo selecionador de textura. Por defecto crea un img.
 * Se enlazará con el objeto utilizando un evento.
 */
function createTexturePicker(obj, container) {
    var o = $("<div/>");
    o.attr('data-name', 'texture-' + obj.name);
    container.append(o);
    $.getJSON('/api/pinata/emblems', function(data) {
        for (var texture in data) {
            var figure = $('<figure>');
            figure.addClass('texture-container');

            var name = data[texture].name;
            var title = $('<figcaption>');
            title.text(name);
            title.addClass('texture-title');

            var url = data[texture].filename;
            var img = $('<img>');
            img.attr('src', url);
            img.addClass('texture-image');
            img.on('click', (function(obj, url) {
                return function(event) {
                    textureHelper(obj, url);
                }
            }(obj, url)));
            img.on('dragstart', (function(url, img) {
                return function(event) {
                    event.originalEvent.dataTransfer.setData("text", url);
                }
            }(url, img)));
            figure.append(img);
            figure.append(title);
            o.append(figure);
        }
    });
}

/*
 * Cambia el color de un objeto a partir del elemento input color.
 */
function colorHelper(obj, picker) {
    var color = new THREE.Color(picker.val());
    obj.material.color = color;
    animate();
}

/*
 * Cambia la textura de un objeto por la imagen ubicada en texUrl.
 */
function textureHelper(obj, texUrl) {
    setTexture(obj.name, texUrl);
}

/* selection menus */
function showPinatas() {
}

/*
 * Muestra los controles de selección de personajes y oculta los demas.
 * No se recomienda, es mejor mostrar solo aquel que se seleccione.
 */
function showCharacterSelection() {
    for (var name in controllers) {
        if (controllers[name].hasClass('character-picker')) {
            controllers[name].css('display', 'block');
        } else {
            controllers[name].css('display', 'none');
        }
    }
}

/*
 * Muestra los controles de selección de personajes y oculta los demas.
 * No se recomienda, es mejor mostrar solo aquel que se seleccione.
 */
function showColorSelection() {
    for (var name in controllers) {
        if (controllers[name].hasClass('color-picker')) {
            controllers[name].css('display', 'block');
        } else {
            controllers[name].css('display', 'none');
        }
    }
}