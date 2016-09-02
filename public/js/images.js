/**
 * Se define todas las imagenes que pueden tomar los emblemas o decorados
 * de las imagenes de las piñatas.  Por defecto se maneja la textura básica
 * pero es posible usar otras imagenes, sin embargo, se debe seguir una
 * estructura y mapeo UV uniforme para la reutilización de las imagenes.
 */
var images = [];

/**
 * Añadir método de búsqueda de imagenes por palabra clave. Mejora la
 * efectividad de búsqueda, en vez de usar índices, a parte que evita
 * el manejo de URL de imágenes estáticas. Retorna el URL, en vez del objeto.
 */
images.__proto__.getImageByName = function(name) {
    for (var field in this) {
        if (this[field].nombre == name)
            return this[field].url;
    }
    return undefined;
}

/**
 * Imagen base: 
 */
images.push({
    nombre: "Jeanne",
    url: "textures/jeanne.png"
});