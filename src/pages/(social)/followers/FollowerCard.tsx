import Avatar from '@components/avatar/Avatar';
import { Button } from '@shared/components/button/button';
import '@pages/(social)/followers/Followers.scss';
import { FaUserPlus } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@shared/hooks/use-app-selector';
import { useAppDispatch } from '@shared/hooks/use-app-dispatch';
import { useParams, useSearchParams } from 'react-router-dom';
import { followerService } from '@shared/services/api/followers/follower.service';
import { Utils } from '@shared/services/utils/utils.service';
import { userService } from '@shared/services/api/user/user.service';
import { FollowersUtils } from '@shared/services/utils/followers-utils.service';
import { socketService } from '@shared/services/socket/socket.service';
import useEffectOnce from '@shared/hooks/useEffectOnce';

const FollowerCard = ({ userData }) => {
  const { profile } = useAppSelector((state) => state.user);
  const [followers, setFollowers] = useState([]);
  const [user, setUser] = useState(userData);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { username } = useParams();

  const getUserFollowers = async () => {
    try {
      const response = await followerService.getUserFollowers(searchParams.get('id'));
      setFollowers(response.data.followers);
      setLoading(false);
    } catch (error) {
      Utils.dispatchNotification(error.response.data.message, 'error', dispatch);
    }
  };

  const getUserProfileByUsername = async () => {
    try {
      const response = await userService.getUserProfileByUsername(
        username,
        searchParams.get('id'),
        searchParams.get('uId')
      );
      setUser(response.data.user);
    } catch (error) {
      Utils.dispatchNotification(error.response.data.message, 'error', dispatch);
    }
  };

  const blockUser = (userInfo) => {
    try {
      socketService?.socket?.emit('block user', { blockedUser: userInfo._id, blockedBy: user?._id });
      FollowersUtils.blockUser(userInfo, dispatch);
    } catch (error) {
      Utils.dispatchNotification(error.response.data.message, 'error', dispatch);
    }
  };

  const unblockUser = (userInfo) => {
    try {
      socketService?.socket?.emit('unblock user', { blockedUser: userInfo._id, blockedBy: user?._id });
      FollowersUtils.unblockUser(userInfo, dispatch);
    } catch (error) {
      Utils.dispatchNotification(error.response.data.message, 'error', dispatch);
    }
  };

  useEffectOnce(() => {
    getUserProfileByUsername();
    getUserFollowers();
  });

  useEffect(() => {
    FollowersUtils.socketIOBlockAndUnblockCard(user, setUser);
  }, [user]);

  return (
    <div data-testid="followers-card">
      {followers.length > 0 && (
        <div className="follower-card-container">
          {followers.map((data) => (
            <div className="follower-card-container-elements" key={data?._id} data-testid="card-element-item">
              <div className="follower-card-container-elements-content">
                <div className="card-avatar">
                  <Avatar
                    name={data?.username}
                    bgColor={data?.avatarColor}
                    textColor="#ffffff"
                    size={60}
                    avatarSrc={data?.profilePicture}
                  />
                </div>
                <div className="card-user">
                  <span className="name">{data?.username}</span>
                  <p className="count">
                    <FaUserPlus className="heart" />{' '}
                    <span data-testid="count">{Utils.shortenLargeNumbers(data?.followingCount)}</span>
                  </p>
                </div>
                {username === profile?.username && (
                  <div className="card-following-button" data-testid="card-following-button">
                    {!Utils.checkIfUserIsBlocked(user?.blocked, data?._id) && (
                      <Button
                        label="Block"
                        className="following-button"
                        disabled={false}
                        handleClick={() => blockUser(data)}
                      />
                    )}
                    {Utils.checkIfUserIsBlocked(user?.blocked, data?._id) && (
                      <Button
                        label="Unblock"
                        className="following-button isUserFollowed"
                        disabled={false}
                        handleClick={() => unblockUser(data)}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && !followers.length && <div className="empty-page">There are no followers to display</div>}
    </div>
  );
};

FollowerCard.propTypes = {
  userData: PropTypes.object
};
export default FollowerCard;
