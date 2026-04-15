import { createDiv } from "../components/div.js";
import { createIcon } from "../components/icon.js";
import { addActionButton } from "../components/button.js";
import { createImage } from "../components/image.js";
import {createTitle} from "../components/title.js";
import {createText} from "../components/text.js";

export function createUserIcon(action)
{
    const icon = createIcon( 'fa fa-user');
    return createDiv('profile-icon', [addActionButton(action, icon, 'round button--primary')]);
}

export function createUserProfile({ name, permission })
{
    const img = createImage('img_avatar.png','avatar');
    const nameTitle = createTitle(1, name)
    const permissionText = createText(['Your permission level is: ' + permission], 'permission');

    return createDiv('profile', [img, nameTitle, permissionText]);
}