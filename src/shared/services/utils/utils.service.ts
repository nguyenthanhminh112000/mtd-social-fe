import {
  addNotification,
  clearNotification
} from '@shared/libs/redux-toolkit/reducers/notifications/notification.reducer';
import { addUser, clearUser } from '@shared/libs/redux-toolkit/reducers/user/user.reducer';
import { avatarColors } from '@shared/services/utils/static.data';
import { floor, random, some, findIndex } from 'lodash';
import millify from 'millify';
import { StoreDispatch } from 'shared/types/store';

const APP_ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT as 'local' | 'development' | 'staging' | 'production';
if (!APP_ENVIRONMENT) throw new Error('APP_ENVIRONMENT is not set');

type DispatchClearNotificationParams = {
  dispatch: StoreDispatch;
};

export class Utils {
  static avatarColor() {
    return avatarColors[floor(random(0.9) * avatarColors.length)];
  }

  static generateAvatar(text, backgroundColor, foregroundColor = 'white') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = 200;
    canvas.height = 200;

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.font = 'normal 80px sans-serif';
    context.fillStyle = foregroundColor;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL('image/png');
  }

  static dispatchUser(result, pageReload, dispatch, setUser) {
    pageReload(true);
    dispatch(addUser({ token: result.data.token, profile: result.data.user }));
    setUser(result.data.user);
  }

  static clearStore({ dispatch, deleteStorageUsername, deleteSessionPageReload, setLoggedIn }) {
    dispatch(clearUser());
    dispatch(clearNotification());
    deleteStorageUsername();
    deleteSessionPageReload();
    setLoggedIn(false);
  }

  static dispatchNotification(message, type, dispatch) {
    dispatch(addNotification({ message, type }));
  }

  static dispatchClearNotification({ dispatch }: DispatchClearNotificationParams) {
    dispatch(clearNotification());
  }

  static appEnvironment() {
    switch (APP_ENVIRONMENT) {
      case 'local':
        return 'LOCAL';
      case 'development':
        return 'DEV';
      case 'staging':
        return 'STG';
      default:
        return 'LOCAL';
    }
  }

  static mapSettingsDropdownItems(setSettings) {
    const items = [];
    const item = {
      topText: 'My Profile',
      subText: 'View personal profile.'
    };
    items.push(item);
    setSettings(items);
    return items;
  }

  static appImageUrl(version, id) {
    if (typeof version === 'string' && typeof id === 'string') {
      version = version.replace(/['"]+/g, '');
      id = id.replace(/['"]+/g, '');
    }
    return `https://res.cloudinary.com/ds1aylnvs/image/upload/v${version}/${id}`;
  }

  static generateString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  static checkIfUserIsBlocked(blocked, userId) {
    return some(blocked, (id) => id === userId);
  }

  static checkIfUserIsFollowed(userFollowers, postCreatorId, userId) {
    return some(userFollowers, (user) => user._id === postCreatorId || postCreatorId === userId);
  }

  static checkIfUserIsOnline(username, onlineUsers) {
    return some(onlineUsers, (user) => user === username?.toLowerCase());
  }

  static firstLetterUpperCase(word) {
    if (!word) return '';
    return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
  }

  static formattedReactions(reactions) {
    const postReactions = [];
    for (const [key, value] of Object.entries(reactions)) {
      if (value > 0) {
        const reactionObject = {
          type: key,
          value
        };
        postReactions.push(reactionObject);
      }
    }
    return postReactions;
  }

  static shortenLargeNumbers(data) {
    if (data === undefined) {
      return 0;
    } else {
      return millify(data);
    }
  }

  static getImage(imageId, imageVersion) {
    return imageId && imageVersion ? this.appImageUrl(imageVersion, imageId) : '';
  }

  static getVideo(videoId, videoVersion) {
    return videoId && videoVersion
      ? `https://res.cloudinary.com/ds1aylnvs/video/upload/v${videoVersion}/${videoId}`
      : '';
  }

  static removeUserFromList(list, userId) {
    const index = findIndex(list, (id) => id === userId);
    list.splice(index, 1);
    return list;
  }

  static checkUrl(url, word) {
    return url.includes(word);
  }

  static renameFile(element) {
    const fileName = element.name.split('.').slice(0, -1).join('.');
    const blob = element.slice(0, element.size, '/image/png');
    const newFile = new File([blob], `${fileName}.png`, { type: '/image/png' });
    return newFile;
  }
}
