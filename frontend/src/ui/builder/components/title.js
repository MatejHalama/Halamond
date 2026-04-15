import { createElement } from "../createElement.js";


/**
 * @param {1|2|3|4|5|6} level - Úroveň nadpisu (1–6)
 * @param {string} text - Text uvnitř H tagu
 * @param {string} classes - CSS třídy
 * @returns {HTMLElement}
 */
export function createTitle(level, text, classes = '')
{
    return createElement('h' + level, {className: classes}, [text]);
}