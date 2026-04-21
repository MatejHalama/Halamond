import { createSection } from '../builder/components/section.js';
import { createTitle } from '../builder/components/title.js';
import { createText } from '../builder/components/text.js';
import { createInput } from '../builder/components/input.js';
import { submitButton } from '../builder/components/button.js';
import { createDiv } from '../builder/components/div.js';

export function LoginView({ viewState, handlers })
{
  const { onSubmitLogin, onEnterRegister } = handlers;

  const root = createSection('login-view');
  const card = createDiv('text-center w-25');

  card.appendChild(createTitle(1, 'Login'));
  //card.appendChild(createText('Zadejte uživatelské jméno. Heslo se v této variantě neřeší.'));

  const email = createInput('',
      {
        type: 'text',
        id: 'loginEmailInput',
        name: 'email_test',
        placeholder: 'např. example@example.com',
      }
  );

  const password = createInput('',
      {
          type: 'password',
          id: 'loginPasswordInput',
          name: 'password',
      })

  card.appendChild(email);
  card.appendChild(password);
  card.appendChild(submitButton('Login', () => onSubmitLogin(
      document.getElementById('loginEmailInput').value,
      document.getElementById('loginPasswordInput').value)));

  card.appendChild(submitButton('Register instead', () => onEnterRegister()));

  root.appendChild(card);
  return root;
}
