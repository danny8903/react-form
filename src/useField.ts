import { useContext, useLayoutEffect, useState } from 'react';
import get from 'lodash.get';
import isEqual from 'lodash.isequal';
import { Subject } from 'rxjs/internal/Subject';
import {
  map,
  tap,
  filter,
  distinctUntilChanged,
  debounceTime,
  switchMap,
  catchError,
} from 'rxjs/operators';
import { asyncVerifyField } from './verificationHelpers';
import { FormContext } from './FormContext';
import {
  FieldActionTypes,
  FormActionTypes,
  IFieldMeta,
  TFieldValue,
  IFieldState,
  TFieldValidator,
  TStore,
} from './interfaces';
import useDeepCompare from './useDeepCompare';
import { defer, of } from 'rxjs';

type TFieldProps = Pick<
  IFieldMeta,
  'defaultValue' | 'destroyValueOnUnmount' | 'required'
> & {
  name: string;
  validate?: TFieldValidator;
};

export const useField = (props: TFieldProps) => {
  const { dispatch, subscribe, fieldPrefix } = useContext(FormContext);
  const prefixedName = `${fieldPrefix || ''}${props.name}`;

  const [fieldState, setFieldState] = useState<IFieldState>({
    value: props.defaultValue,
    meta: {
      required: !!props.required,
      defaultValue: props.defaultValue,
      dirty: false,
    },
  });

  const onChange = (value: TFieldValue, otherMeta?: IFieldMeta) => {
    const meta = {
      ...otherMeta,
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
    const store$ = new Subject<TStore>();

    const fieldState$ = store$.pipe(
      map((store) => store.state),
      filter(({ fields }) => Boolean(fields[prefixedName])),
      map(({ fields, values }) => ({
        meta: fields[prefixedName],
        value: get(values, prefixedName),
      })),
      distinctUntilChanged(isEqual),
      tap(({ meta, value }) => {
        setFieldState({
          value,
          meta,
        });
      })
    );

    const verifyField$ = store$.pipe(
      filter(({ action, state: formState }) => {
        return (
          ((action.type === FieldActionTypes.change &&
            action.name === prefixedName) ||
            (action.type === FormActionTypes.update &&
              Array.isArray(action.payload) &&
              action.payload.some((c) => c.path === prefixedName))) &&
          Boolean(formState.fields[prefixedName]) &&
          (Boolean(props.validate) || !!formState.fields[prefixedName].required)
        );
      }),
      debounceTime(200),
      map(({ state }) => ({
        meta: state.fields[prefixedName],
        value: get(state.values, prefixedName),
      })),
      switchMap(({ value, meta }) =>
        defer(async () => {
          const invalidFieldError = await asyncVerifyField(
            prefixedName,
            value,
            !!meta.required,
            props.validate
          );
          if (invalidFieldError) {
            throw invalidFieldError;
          }

          dispatch({
            name: prefixedName,
            type: FieldActionTypes.clearError,
          });
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

    const storeSubscription = subscribe(store$);
    const fieldStateSubscription = fieldState$.subscribe();
    const verifyFieldSubscription = verifyField$.subscribe();

    return () => {
      dispatch({
        name: prefixedName,
        type: FieldActionTypes.destroy,
        meta: {
          destroyValueOnUnmount: !!props.destroyValueOnUnmount,
        },
      });

      storeSubscription.unsubscribe();
      fieldStateSubscription.unsubscribe();
      verifyFieldSubscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...fieldState,
    onChange,
  };
};
