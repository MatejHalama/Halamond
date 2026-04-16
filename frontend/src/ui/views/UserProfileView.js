import { createSection } from "../builder/components/section.js";
import { createUserProfile } from "../builder/layout/user.js";
import { canGoBack, addActionButton } from "../builder/components/button.js";

export function UserProfileView({ viewState, handlers })
{
    const { user, capabilities } = viewState;
    const { canBackToList, canLogout } = capabilities;
    const { onBackToList, onLogout } = handlers;

    const container = createSection();
    container.appendChild(canGoBack(canBackToList, onBackToList));

    if (canLogout && onLogout)
    {
        container.appendChild(addActionButton(onLogout, 'Logout', 'button--danger'));
    }

    container.appendChild(createUserProfile(
            {
                name: user.name ?? user.userId,
                permission: user.role,
            }
        )
    );

    return container
}