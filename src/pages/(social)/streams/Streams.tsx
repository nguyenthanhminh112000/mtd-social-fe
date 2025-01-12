import { useRef, useState, useEffect } from 'react';
import { useAppSelector } from '@shared/hooks/use-app-selector';
import { useAppDispatch } from '@shared/hooks/use-app-dispatch';
import '@pages/(social)/streams/Streams.scss';
import Suggestions from '@components/suggestions/Suggestions';
import { getUserSuggestions } from '@shared/libs/redux-toolkit/api/suggestion';
import useEffectOnce from '@shared/hooks/useEffectOnce';
import PostForm from '@components/posts/post-form/PostForm';
import Posts from '@components/posts/Posts';
import { Utils } from '@shared/services/utils/utils.service';
import { postService } from '@shared/services/api/post/post.service';
import { getPosts } from '@shared/libs/redux-toolkit/api/posts';
import { orderBy, uniqBy } from 'lodash';
import useInfiniteScroll from '@shared/hooks/useInfiniteScroll';
import { PostUtils } from '@shared/services/utils/post-utils.service';
import { useLocalStorage } from '@shared/hooks/useLocalStorage';
import { addReactions } from '@shared/libs/redux-toolkit/reducers/post/user-post-reaction.reducer';
import { followerService } from '@shared/services/api/followers/follower.service';

const Streams = () => {
  const { allPosts } = useAppSelector((state) => state);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPostsCount, setTotalPostsCount] = useState(0);
  const bodyRef = useRef(null);
  const bottomLineRef = useRef();
  let appPosts = useRef([]);
  const dispatch = useAppDispatch();
  const storedUsername = useLocalStorage('username', 'get');
  const [deleteSelectedPostId] = useLocalStorage('selectedPostId', 'delete');
  useInfiniteScroll(bodyRef, bottomLineRef, fetchPostData);
  const PAGE_SIZE = 8;

  function fetchPostData() {
    let pageNum = currentPage;
    if (currentPage <= Math.round(totalPostsCount / PAGE_SIZE)) {
      pageNum += 1;
      setCurrentPage(pageNum);
      getAllPosts();
    }
  }

  const getAllPosts = async () => {
    try {
      const response = await postService.getAllPosts(currentPage);
      if (response.data.posts.length > 0) {
        appPosts = [...posts, ...response.data.posts];
        const allPosts = uniqBy(appPosts, '_id');
        const orderedPosts = orderBy(allPosts, ['createdAt'], ['desc']);
        setPosts(orderedPosts);
      }
      setLoading(false);
    } catch (error) {
      Utils.dispatchNotification(error.response.data.message, 'error', dispatch);
    }
  };

  const getUserFollowing = async () => {
    try {
      const response = await followerService.getUserFollowing();
      setFollowing(response.data.following);
    } catch (error) {
      Utils.dispatchNotification(error.response.data.message, 'error', dispatch);
    }
  };

  const getReactionsByUsername = async () => {
    try {
      const response = await postService.getReactionsByUsername(storedUsername);
      dispatch(addReactions(response.data.reactions));
    } catch (error) {
      Utils.dispatchNotification(error.response.data.message, 'error', dispatch);
    }
  };

  useEffectOnce(() => {
    getUserFollowing();
    getReactionsByUsername();
    deleteSelectedPostId();
    dispatch(getPosts());
    dispatch(getUserSuggestions());
  });

  useEffect(() => {
    setLoading(allPosts?.isLoading);
    const orderedPosts = orderBy(allPosts?.posts, ['createdAt'], ['desc']);
    setPosts(orderedPosts);
    setTotalPostsCount(allPosts?.totalPostsCount);
  }, [allPosts]);

  useEffect(() => {
    PostUtils.socketIOPost(posts, setPosts);
  }, [posts]);

  return (
    <div className="streams" data-testid="streams">
      <div className="streams-content">
        <div className="streams-post" ref={bodyRef}>
          <PostForm />
          <Posts allPosts={posts} postsLoading={loading} userFollowing={following} />
          <div ref={bottomLineRef} style={{ marginBottom: '50px', height: '50px' }}></div>
        </div>
        <div className="streams-suggestions">
          <Suggestions />
        </div>
      </div>
    </div>
  );
};

export default Streams;
