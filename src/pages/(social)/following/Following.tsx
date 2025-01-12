import '@pages/(social)/following/Following.scss';

import Avatar from '@components/avatar/Avatar';
import CardElementButtons from '@components/card-element/CardElementButtons';
import CardElementStats from '@components/card-element/CardElementStats';
import useEffectOnce from '@shared/hooks/useEffectOnce';
import { followerService } from '@shared/services/api/followers/follower.service';
import { socketService } from '@shared/services/socket/socket.service';
import { FollowersUtils } from '@shared/services/utils/followers-utils.service';
import { ProfileUtils } from '@shared/services/utils/profile-utils.service';
import { Utils } from '@shared/services/utils/utils.service';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@shared/hooks/use-app-selector';
import { useAppDispatch } from '@shared/hooks/use-app-dispatch';
import { useNavigate } from 'react-router-dom';

const Following = () => {
  const { profile } = useAppSelector((state) => state.user);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const getUserFollowing = async () => {
    try {
      const response = await followerService.getUserFollowing();
      setFollowing(response.data.following);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Utils.dispatchNotification(error.response.data.message, 'error', dispatch);
    }
  };

  const followUser = async (user) => {
    try {
      FollowersUtils.followUser(user, dispatch);
    } catch (error) {
      Utils.dispatchNotification(error.response.data.message, 'error', dispatch);
    }
  };

  const unFollowUser = async (user) => {
    try {
      socketService?.socket?.emit('unfollow user', user);
      FollowersUtils.unFollowUser(user, profile, dispatch);
    } catch (error) {
      Utils.dispatchNotification(error.response.data.message, 'error', dispatch);
    }
  };

  useEffectOnce(() => {
    getUserFollowing();
  });

  useEffect(() => {
    FollowersUtils.socketIORemoveFollowing(following, setFollowing);
  }, [following]);

  return (
    <div className="card-container">
      <div className="people">Following</div>
      {following.length > 0 && (
        <div className="card-element">
          {following.map((data) => (
            <div className="card-element-item" key={Utils.generateString(10)} data-testid="card-element-item">
              <div className="card-element-header">
                <div className="card-element-header-bg"></div>
                <Avatar
                  name={data?.username}
                  bgColor={data?.avatarColor}
                  textColor="#ffffff"
                  size={120}
                  avatarSrc={data?.profilePicture}
                />
                <div className="card-element-header-text">
                  <span className="card-element-header-name">{data?.username}</span>
                </div>
              </div>
              <CardElementStats
                postsCount={data?.postsCount}
                followersCount={data?.followersCount}
                followingCount={data?.followingCount}
              />
              <CardElementButtons
                isChecked={Utils.checkIfUserIsFollowed(following, data?._id)}
                btnTextOne="Follow"
                btnTextTwo="Unfollow"
                onClickBtnOne={() => followUser(data)}
                onClickBtnTwo={() => unFollowUser(data)}
                onNavigateToProfile={() => ProfileUtils.navigateToProfile(data, navigate)}
              />
            </div>
          ))}
        </div>
      )}

      {loading && !following.length && <div className="card-element" style={{ height: '350px' }}></div>}

      {!loading && !following.length && (
        <div className="empty-page" data-testid="empty-page">
          You have no following
        </div>
      )}

      <div style={{ marginBottom: '80px', height: '50px' }}></div>
    </div>
  );
};
export default Following;
