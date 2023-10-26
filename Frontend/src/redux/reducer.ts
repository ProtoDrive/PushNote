import {Reducer} from 'redux';
import {ADD_USER} from './constants';

const initialState = {};

export const reducer: Reducer<any> = (state = initialState, action) => {
  switch (action.type) {
    case ADD_USER:
      return {
        ...state,
        data: action.data,
      };
    default:
      return state;
  }
};
