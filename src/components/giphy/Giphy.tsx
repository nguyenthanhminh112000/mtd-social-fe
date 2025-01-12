import { Input } from '@shared/components/input/input';
import { GiphyUtils } from '@shared/services/utils/giphy-utils.service';
import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

import '@components/giphy/Giphy.scss';
import { useAppDispatch } from '@shared/hooks/use-app-dispatch';
import { useAppSelector } from '@shared/hooks/use-app-selector';
import { updatePostItem } from '@shared/libs/redux-toolkit/reducers/post/post.reducer';
import { toggleGifModal } from '@shared/libs/redux-toolkit/reducers/modal/modal.reducer';
import Spinner from '@components/spinner/Spinner';
import { Utils } from '@shared/services/utils/utils.service';

const Giphy = () => {
  const { gifModalIsOpen } = useAppSelector((state) => state.modal);
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const selectGif = (gif) => {
    dispatch(updatePostItem({ gifUrl: gif, image: '', video: '' }));
    dispatch(toggleGifModal(!gifModalIsOpen));
  };

  useEffect(() => {
    GiphyUtils.getTrendingGifs(setGifs, setLoading);
  }, []);

  return (
    <>
      <div className="giphy-container" id="editable" data-testid="giphy-container">
        <div className="giphy-container-picker" style={{ height: '500px' }}>
          <div className="giphy-container-picker-form">
            <FaSearch className="search" />
            <Input
              id="gif"
              name="gif"
              type="text"
              labelText=""
              placeholder="Search Gif"
              className="giphy-container-picker-form-input"
              handleChange={(e) => GiphyUtils.searchGifs(e.target.value, setGifs, setLoading)}
            />
          </div>

          {loading && <Spinner />}

          <ul className="giphy-container-picker-list" data-testid="unorderedList">
            {gifs.map((gif) => (
              <li
                className="giphy-container-picker-list-item"
                data-testid="list-item"
                key={Utils.generateString(10)}
                onClick={() => selectGif(gif.images.original.url)}
              >
                <img style={{ width: '470px' }} src={`${gif.images.original.url}`} alt="" />
              </li>
            ))}
          </ul>

          {!gifs && !loading && (
            <ul className="giphy-container-picker-list">
              <li className="giphy-container-picker-list-no-item">No GIF found</li>
            </ul>
          )}
        </div>
      </div>
    </>
  );
};
export default Giphy;
