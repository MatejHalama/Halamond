import { createInitialState } from './state.js';
import { createStore } from '../infra/store/createStore.js';
import { createDispatcher } from './dispatch.js';
import { render } from '../ui/render.js';
import { createApi } from '../api/api.js';
import { urlToAction } from '../infra/router/router.js';

import * as ACTION_TYPE from '../constants/actionType.js';

// 1. inicializace infrastruktury aplikace
const api = createApi();
const store = createStore(createInitialState());
const dispatch = createDispatcher(store, api);

// 2. napojení výstupu aplikace
const root = document.getElementById('app');

// přihlášení renderu ke změnám
store.subscribe((state) => render(root, state, dispatch));

// 3. aplikační incializace stavu
dispatch({type: ACTION_TYPE.INIT})
    .catch(err => {
        console.error("Dispatch error (popstate):", err);
    });

// 4. naslouchání změnám v řádku s adresou
window.addEventListener('popstate', () => {
    const action = urlToAction(window.location.href);
    dispatch({
        ...action,
        meta: {
            ...(action.meta ?? {}),
            syncUrl: false,
        },
    }).catch(err => {
        console.error("Dispatch error (popstate):", err);
    });
});
