import photo from '@shared/assets/images/photo.png';
import gif from '@shared/assets/images/gif.png';
import feeling from '@shared/assets/images/feeling.png';
import video from '@shared/assets/images/video.png';
import { Input } from '@shared/components/input/input';
import useDetectOutsideClick from '@shared/hooks/useDetectOutsideClick';
import { useRef } from 'react';
import { useAppDispatch } from '@shared/hooks/use-app-dispatch';
import { useAppSelector } from '@shared/hooks/use-app-selector';
import Feelings from '@components/feelings/Feelings';
import { ImageUtils } from '@shared/services/utils/image-utils.service';
import PropTypes from 'prop-types';
import { toggleGifModal } from '@shared/libs/redux-toolkit/reducers/modal/modal.reducer';

const ModalBoxSelection = ({ setSelectedPostImage, setSelectedVideo }) => {
  const { feelingsIsOpen, gifModalIsOpen } = useAppSelector((state) => state.modal);
  const { post } = useAppSelector((state) => state.post);
  const feelingsRef = useRef(null);
  const fileInputRef = useRef();
  const videoInputRef = useRef();
  const [toggleFeelings, setToggleFeelings] = useDetectOutsideClick(feelingsRef, feelingsIsOpen);
  const dispatch = useAppDispatch();

  const fileInputClicked = () => {
    fileInputRef.current.click();
  };

  const videoInputClicked = () => {
    videoInputRef.current.click();
  };

  const handleFileChange = (event) => {
    ImageUtils.addFileToRedux(event, post, setSelectedPostImage, dispatch, 'image');
  };

  const handleVideoFileChange = (event) => {
    ImageUtils.addFileToRedux(event, post, setSelectedVideo, dispatch, 'video');
  };

  return (
    <>
      {toggleFeelings && (
        <div ref={feelingsRef}>
          <Feelings />
        </div>
      )}
      <div className="modal-box-selection" data-testid="modal-box-selection">
        <ul className="post-form-list" data-testid="list-item">
          <li className="post-form-list-item image-select" onClick={fileInputClicked}>
            <Input
              name="image"
              ref={fileInputRef}
              type="file"
              className="file-input"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = null;
                }
              }}
              handleChange={handleFileChange}
            />
            <img src={photo} alt="" /> Photo
          </li>
          <li className="post-form-list-item" onClick={() => dispatch(toggleGifModal(!gifModalIsOpen))}>
            <img src={gif} alt="" /> Gif
          </li>
          <li className="post-form-list-item" onClick={() => setToggleFeelings(!toggleFeelings)}>
            <img src={feeling} alt="" /> Feeling
          </li>
          <li className="post-form-list-item image-select" onClick={videoInputClicked}>
            <Input
              name="video"
              ref={videoInputRef}
              type="file"
              className="file-input"
              onClick={() => {
                if (videoInputRef.current) {
                  videoInputRef.current.value = null;
                }
              }}
              handleChange={handleVideoFileChange}
            />
            <img src={video} alt="" /> Video
          </li>
        </ul>
      </div>
    </>
  );
};
ModalBoxSelection.propTypes = {
  setSelectedPostImage: PropTypes.func,
  setSelectedVideo: PropTypes.func
};
export default ModalBoxSelection;
