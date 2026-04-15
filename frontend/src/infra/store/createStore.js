export function createStore(initialState) {
    let state = initialState;
    const listeners = [];

    function getState() {
        return state;
    }

    function setState(updateFunction) {
        state = updateFunction(state);
        listeners.forEach((l) => l(state));
    }

    function subscribe(listener) {
        listeners.push(listener);
    }

    return {
        getState,
        setState,
        subscribe,
    };
}
