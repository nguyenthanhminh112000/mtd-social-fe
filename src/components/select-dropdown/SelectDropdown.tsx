import PropTypes from 'prop-types';
import { useRef } from 'react';
import { useAppDispatch } from '@shared/hooks/use-app-dispatch';
import { updatePostItem } from '@shared/libs/redux-toolkit/reducers/post/post.reducer';
import '@components/select-dropdown/SelectDropdown.scss';

const SelectDropdown = ({ isActive, setSelectedItem, items = [] }) => {
  const dropdownRef = useRef(null);
  const dispatch = useAppDispatch();

  const selectItem = (item) => {
    setSelectedItem(item);
    dispatch(updatePostItem({ privacy: item.topText }));
  };

  return (
    <div className="menu-container" data-testid="menu-container">
      <nav ref={dropdownRef} className={`menu ${isActive ? 'active' : 'inactive'}`}>
        <ul>
          {items.map((item, index) => (
            <li data-testid="select-dropdown" key={index} onClick={() => selectItem(item)}>
              <div className="menu-icon">{item.icon}</div>
              <div className="menu-text">
                <div className="menu-text-header">{item.topText}</div>
                <div className="sub-header">{item.subText}</div>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

SelectDropdown.propTypes = {
  isActive: PropTypes.bool,
  setSelectedItem: PropTypes.func,
  items: PropTypes.array
};

export default SelectDropdown;
