import {ADD_USER} from './constants';

export function addUser(user: any) {
  return {
    type: ADD_USER,
    data: user,
  };
}
