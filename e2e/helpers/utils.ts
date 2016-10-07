import * as _ from 'lodash'; 

export const deepEqual = (obj1, obj2): boolean => {
  return _.isEqual(obj1, obj2);
};
