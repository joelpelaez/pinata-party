var controllers = {};
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
        // Jump non object nodes as "extra info"
        if (typeof(current_interface.model[name]) !== "object")
            continue;

        var objnode = current.model[name];
        var obj = undefined; // Object to attach
        var container = $("<div></div>");
        container.addClass('obj-config');
        container.css("display", "none");
        root_container.append(container);
        if (objnode["name"] !== undefined) {
            obj = scene.getObjectByName(objnode["name"]);
            $("<h2>" + objnode["name"] + "</h2>").appendTo(container);
        }
        if (objnode["color_editable"] !== undefined &&
            objnode["color_editable"] === true) {
            createColorPicker(obj, container);
        }
        if (objnode["texture_editable"] !== undefined &&
            objnode["texture_editable"] === true) {
            createTexturePicker(obj, container);
        }
        controllers[objnode.name] = container;
    }
}

function createColorPicker(obj, container) {
    var o = $("<input/>");
    o.attr('type', 'color');
    o.attr('name', 'picker-' + obj.name);
    o.on('input', function(event) {
        colorHelper(obj, o)
    });
    container.append("Color: <br>");
    container.append(o);
    container.append("<br>");
}

function createTexturePicker(obj, container) {
    var o = $("<div/>");
    o.attr('data-name', 'texture-' + obj.name);
    container.append(o);
    for (var texture in images) {
        if (images[texture].url === undefined)
            continue;
        var url = images[texture].url;
        var img = $('<img/>');
        img.attr('src', url);
        img.attr('width', '64');
        img.on('click', function(event) {
            textureHelper(obj, url);
        });
        o.append(img);
    }
}

function colorHelper(obj, picker) {
    var color = new THREE.Color(picker.val());
    obj.material.color = color;
}

function textureHelper(obj, texUrl) {
    console.log(obj.name)
    console.log(texUrl)
    setTexture(obj.name, texUrl);
}