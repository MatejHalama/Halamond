import * as UI_MODE from '../../constants/uiMode.js';
import * as UI_STATUS from '../../statuses/uiStatus.js';

export async function enterUserProfile({ store })
{
    store.setState((state) =>
        {
            return {
                ...state,
                ui: {
                    ...state.ui,
                    mode: UI_MODE.PROFILE,
                    selectedExamId: null,
                    status: UI_STATUS.RDY,
                    errorMessage: null,
                },
            }
        }
    );
}
