import { pipe, defer } from 'rxjs';
import { delayWhen } from 'rxjs/operators';

import { TReducer } from './interfaces';

export const asyncTap = <T>(fn: (x: T) => Promise<void>) =>
  pipe(
    delayWhen((params: T) =>
      defer(async () => {
        await fn(params);
      })
    )
  );

export const isNil = (value: any) => [null, undefined, ''].includes(value);
export const isEmpty = (value: any) => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (value.constructor === Object) {
    return Object.keys(value).length === 0;
  }

  return false;
};

type TLogger = (reducer: TReducer) => TReducer;
export const logger: TLogger = (reducer) => (action, formState) => {
  let nextFormState;
  let error;
  try {
    nextFormState = reducer(action, formState);
  } catch (err) {
    nextFormState = formState;
    error = err;
  }

  if (process.env.NODE_ENV === 'development') {
    if (error) {
      console.error(error);
    } else {
      console.groupCollapsed(
        `${action.type} ${new Date().toLocaleTimeString()}`
      );
      console.log('prevFormState', formState);
      console.log(`%cAction ${JSON.stringify(action)}`, 'color: red');
      console.log('nextState', nextFormState);
      console.groupEnd();
    }
  }
  return nextFormState;
};
