import { createElement } from "../createElement.js";


/**
 * @param {string} classes
 * @param {...Object<string, any>} options
 * @returns {HTMLElement}
 */
export function createInput(classes = '',  options = {})
{
    return createElement('label', '', [
            createElement('input', {className: classes, ...options}, [])
        ]
    );
}