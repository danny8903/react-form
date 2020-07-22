import { pipe, defer } from 'rxjs';
import { delayWhen } from 'rxjs/operators';

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
