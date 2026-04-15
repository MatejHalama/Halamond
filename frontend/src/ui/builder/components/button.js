import { createElement } from "../createElement.js";


/**
 * @param {string} classes
 * @param {string} buttonText
 * @param {...Object<string, any>} options
 * @returns {HTMLElement}
 */
export function createButton(classes, buttonText = '', options = {})
{
    return createElement('button', {className: "button " + classes, ...options}, [buttonText]);
}

export function canGoBack(canBackToList, onBackToList)
{
    if (canBackToList && onBackToList)
    {
        const btn = createButton('button--success', 'Back to list');
        btn.addEventListener('click', onBackToList);
        return btn;
    }
}

export function addActionButton(action, text, classes)
{
    const btn = createButton(classes, text);
    btn.addEventListener('click', action);
    return btn;
}

export function addButton(canCondition, onCondition, action, text, classes)
{
    if (canCondition && onCondition)
    {
        const btn = createButton(classes, text);
        btn.addEventListener('click', action);
        return btn;
    }
    return '';
}
export function submitButton(text, action)
{
    const btn = createButton('button--primary', text);
    btn.addEventListener('click', action);
    return btn;
}