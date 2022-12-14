// @flow
import {
  OPEN_MODAL,
  CLOSE_MODAL,
  CLOSE_ALL_MODALS,
} from "./actionTypes";

const INIT_STATE = {
  data: null,
  isStoryFlow: false,
  isConfirmPublish: false,
  isConfirmRemove: false,
  isConfirmRemoveImage: false
};

const getModalStateName = (name) => {
  switch (name) {
    case 'storyFlow':
      return 'isStoryFlow';
    case 'confirmPublish':
      return 'isConfirmPublish';
    case 'confirmRemove':
      return 'isConfirmRemove';
    case 'confirmRemoveImage':
      return 'isConfirmRemoveImage';
  }
}

const Modals = (state = INIT_STATE, action) => {
  switch (action.type) {
    case OPEN_MODAL:
      return {
        ...state,
        data: action.payload.data ? action.payload.data : null,
        [getModalStateName(action.payload.name)]: true,
      };
    case CLOSE_MODAL:
      return {
        ...state,
        data: null,
        [getModalStateName(action.payload.name)]: false,
      };
    case CLOSE_ALL_MODALS:
      return {
        ...state,
        ...INIT_STATE
      };
    default:
      return state;
  }
};

export default Modals;
