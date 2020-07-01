import { useContext, useLayoutEffect, useState } from 'react';
import get from 'lodash.get';
import isEqual from 'lodash.isequal';
import { Subject } from 'rxjs/internal/Subject';
import {
  distinctUntilChanged,
  map,
  tap,
  filter,
  debounceTime,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { asyncVerifyField } from './formHelpers';
import { FormContext } from './FormContext';
import {
  FieldActionTypes,
  IFieldMeta,
  IFormState,
  TFieldValue,
} from './interfaces';
import useDeepCompare from './useDeepCompare';
import { defer, of } from 'rxjs';

type TFieldProps = Pick<
  IFieldMeta,
  'name' | 'defaultValue' | 'destroyValueOnUnmount' | 'required'
> & {
  customProps?: (value: TFieldValue) => any;
  validate?: (value: TFieldValue) => any;
};

export const useField = (props: TFieldProps) => {
  const { dispatch, subscribe, fieldPrefix } = useContext(FormContext);
  const prefixedName = `${fieldPrefix || ''}${props.name}`;

  const [fieldValue, setFieldValue] = useState(props.defaultValue);
  const [fieldMeta, setFieldMeta] = useState<IFieldMeta>({
    name: prefixedName,
    dirty: false,
    required: !!props.required,
    defaultValue: props.defaultValue,
  });

  const onChange = (value: TFieldValue, otherMeta?: IFieldMeta) => {
    const meta = {
      ...otherMeta,
      dirty: true,
    } as IFieldMeta;

    dispatch({
      name: prefixedName,
      type: FieldActionTypes.change,
      meta,
      payload: value,
    });
  };

  useDeepCompare(
    () => {
      dispatch({
        name: prefixedName,
        type: FieldActionTypes.register,
        meta: {
          required: !!props.required,
          defaultValue: props.defaultValue,
        },
        payload: props.defaultValue,
      });
    },
    { defaultValue: props.defaultValue, required: !!props.required }
  );

  useLayoutEffect(() => {
    const formStateSubject = new Subject<IFormState>();

    const fieldState$ = formStateSubject.pipe(
      map(({ fields, values }) => ({
        meta: fields[prefixedName],
        value: get(values, prefixedName),
      })),
      distinctUntilChanged(
        (next, prev) =>
          isEqual(next.meta, prev.meta) && isEqual(prev.value, next.value)
      ),
      tap(({ meta, value }) => {
        setFieldValue(value);
        setFieldMeta(meta);
      })
    );

    const verifyField$ = fieldState$.pipe(
      filter(() => Boolean(props.validate)),
      debounceTime(200),
      switchMap(({ value }) =>
        defer(async () => {
          const invalidFieldMsg = await asyncVerifyField(
            prefixedName,
            value,
            !!props.required,
            props.validate
          );
          if (invalidFieldMsg) {
            throw new Error(invalidFieldMsg);
          }
        })
      ),
      catchError((err) => {
        dispatch({
          name: prefixedName,
          type: FieldActionTypes.throwError,
          payload: err,
        });
        return of(err);
      })
    );

    const formStateSubscription = subscribe(formStateSubject);
    const fieldStateSubscription = fieldState$.subscribe();
    const verifyFieldSubscription = verifyField$.subscribe();

    return () => {
      dispatch({
        name: prefixedName,
        type: FieldActionTypes.destroy,
        meta: {
          destroyValueOnUnmount: props.destroyValueOnUnmount,
        },
      });

      formStateSubscription.unsubscribe();
      fieldStateSubscription.unsubscribe();
      verifyFieldSubscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    value: fieldValue,
    meta: fieldMeta,
    name: prefixedName,
    onChange,
  };
};
