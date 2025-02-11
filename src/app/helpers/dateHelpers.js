const date = new Date();
/**
 * @returns Retorna uma string contendo a data e hora em formato: "DD/MM/YYYY HH:MM:SS"
 */
module.exports.getDayAndTime = () => {
    return date.getDate().toString().concat("/", date.getMonth(), "/", date.getFullYear(), " ", date.getHours(), ":", date.getMinutes(), ":", date.getSeconds());
}