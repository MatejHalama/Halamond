import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createInput } from '../builder/components/input.js';
import { submitButton } from '../builder/components/button.js';
import { createDiv } from '../builder/components/div.js';

export function RegisterView({ viewState, handlers })
{
    const { onSubmitRegister, onEnterLogin } = handlers;

    const root = createSection('login-view');
    const card = createDiv('text-center w-25');

    card.appendChild(createTitle(1, 'Register'));

    const email = createInput('',
        {
            type: 'text',
            id: 'registerEmailInput',
            name: 'email_',
            placeholder: 'např. example@example.com',
        }
    );

    const password = createInput('',
        {
            type: 'password',
            id: 'registerPasswordInput',
            name: 'password',
        })

    const username = createInput('',
        {
            type: 'text',
            id: 'registerUsernameInput',
            name: 'username_',
            placeholder: 'SkvělýStudent',
        }
    );

    card.appendChild(email);
    card.appendChild(password);
    card.appendChild(username);
    card.appendChild(submitButton('Register', () => onSubmitRegister(
        document.getElementById('registerEmailInput').value,
        document.getElementById('registerPasswordInput').value,
        document.getElementById('registerUsernameInput').value)));

    card.appendChild(submitButton('Login instead', () => onEnterLogin()));

    root.appendChild(card);
    return root;
}
