import { Button } from '@shared/components/button/button';
import '@components/notification-settings/NotificationSettings.scss';
import Toggle from '@components/toggle/Toggle';
import { updateUserProfile } from '@shared/libs/redux-toolkit/reducers/user/user.reducer';
import { userService } from '@shared/services/api/user/user.service';
import { notificationItems } from '@shared/services/utils/static.data';
import { Utils } from '@shared/services/utils/utils.service';
import { cloneDeep } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '@shared/hooks/use-app-dispatch';
import { useAppSelector } from '@shared/hooks/use-app-selector';

const NotificationSettings = () => {
  let { profile } = useAppSelector((state) => state.user);
  const [notificationTypes, setNotificationTypes] = useState([]);
  let [notificationSettings, setNotificationSettings] = useState(profile?.notifications);
  const dispatch = useAppDispatch();

  const mapNotificationTypesToggle = useCallback(
    (notifications) => {
      for (const notification of notifications) {
        const toggled = notificationSettings[notification.type];
        notification.toggle = toggled;
      }
      setNotificationTypes(notifications);
    },
    [notificationSettings]
  );

  const updateNotificationTypesToggle = (itemIndex) => {
    const updatedData = notificationTypes.map((item, index) => {
      if (index === itemIndex) {
        return {
          ...item,
          toggle: !item.toggle
        };
      }
      return item;
    });
    setNotificationTypes(updatedData);
  };

  const sendNotificationSettings = async () => {
    try {
      const response = await userService.updateNotificationSettings(notificationSettings);
      profile = cloneDeep(profile);
      profile.notifications = response.data.settings;
      dispatch(updateUserProfile(profile));
      Utils.dispatchNotification(response.data.message, 'success', dispatch);
    } catch (error) {
      Utils.dispatchNotification(error.response.data.message, 'error', dispatch);
    }
  };

  useEffect(() => {
    mapNotificationTypesToggle(notificationItems);
  }, [notificationTypes, mapNotificationTypesToggle]);

  return (
    <>
      <div className="notification-settings">
        {notificationTypes.map((data, index) => (
          <div
            className="notification-settings-container"
            key={Utils.generateString(10)}
            data-testid="notification-settings-item"
          >
            <div className="notification-settings-container-sub-card">
              <div className="notification-settings-container-sub-card-body">
                <h6 className="title">{`${data.title}`}</h6>
                <div className="subtitle-body">
                  <p className="subtext">{data.description}</p>
                </div>
              </div>
              <div className="toggle" data-testid="toggle-container">
                <Toggle
                  toggle={data.toggle}
                  onClick={() => {
                    updateNotificationTypesToggle(index);
                    notificationSettings = cloneDeep(notificationSettings);
                    notificationSettings[data.type] = !notificationSettings[data.type];
                    setNotificationSettings(notificationSettings);
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        <div className="btn-group">
          <Button label="Update" className="update" disabled={false} handleClick={sendNotificationSettings} />
        </div>
      </div>
      <div style={{ height: '1px' }}></div>
    </>
  );
};
export default NotificationSettings;
