import { createElement } from "../createElement.js";


/**
 * @param {string} src - Zdroj
 * @param {string} alt - Text alternativní
 * @param {string} classes - CSS třídy
 * @returns {HTMLElement}
 */
export function createImage(src, alt, classes = '')
{
    let options = {
        className: classes,
        src: './images/' + src,
        alt: alt,
    }
    return createElement('img', options, []);
}