import React, { useMemo, useEffect } from 'react';
import { Subject, merge, of } from 'rxjs';
import { exhaustMap, catchError, tap, mapTo, map } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

import { FormProvider, FORM_INIT_STATE } from './FormContext';

import {
  FormActionTypes,
  FieldActionTypes,
  TFormAction,
  TFieldAction,
  IFormContextValue,
  TUpdateFormValues,
  IFormState,
  IFormValues,
  IFormMeta,
} from './interfaces';

import reducer from './reducer';
import { asyncTap } from './utils';
import { verifyForm } from './verificationHelpers';
import { createStore } from './store';

import './Form.css';

interface IRxFormProps {
  children: React.ReactNode;
  onSubmit: (values: IFormValues, meta: IFormMeta) => Promise<any>;
  extendFormMeta?: (
    state: IFormState
  ) => {
    [extraProps: string]: any;
  };
  success?: (submitReturn: any, value: IFormValues) => Promise<void>;
  failed?: (errors: Error[], value: IFormValues) => void;
  beforeSubmit?: (values: IFormValues, meta: IFormMeta) => Promise<void>;
  className?: string;
}

interface IMemoValue extends IFormContextValue {
  cleanup: () => void;
}

export function Form(props: IRxFormProps) {
  const { cleanup, ...formCtxValue } = useMemo<IMemoValue>(() => {
    const submitSubject = new Subject<TFormAction>();

    const postUpdate = (state$: Observable<IFormState>) =>
      state$.pipe(
        map((state) => {
          const { fields, meta } = state;
          const fieldMetaList = Object.entries(fields).map(
            (fieldPair) => fieldPair[1]
          );

          const dirty = fieldMetaList.some((meta) => meta.dirty);

          // TODO: current fix will cause form meta error is not sync with errors from fields.
          // Can try create custom error to distinguish field error and form error,
          // and then concat them.
          const { errors } = meta;

          const tempState: IFormState = {
            ...state,
            meta: {
              ...meta,
              dirty,
              errors,
            },
          };

          const extraMeta = props.extendFormMeta
            ? props.extendFormMeta(tempState)
            : undefined;

          return {
            ...state,
            meta: {
              ...meta,
              ...extraMeta,
              dirty,
              errors,
            },
          };
        })
      );

    const store = createStore(FORM_INIT_STATE, reducer, postUpdate);

    const submit = (): void => {
      submitSubject.next({
        type: FormActionTypes.submit,
      });
    };

    const dispatch = (action: TFieldAction | TFormAction): void => {
      if (
        !Object.values(FormActionTypes).includes(
          action.type as FormActionTypes
        ) &&
        !Object.values(FieldActionTypes).includes(
          action.type as FieldActionTypes
        )
      ) {
        throw new Error(`Invalid action: ${action.type} is invalid`);
      }
      store.dispatch(action);
    };

    const submitHandler$ = submitSubject.pipe(
      exhaustMap(() => {
        const formState = store.getState();
        const formStateWithError = verifyForm(formState);
        if (formStateWithError) {
          return of(formStateWithError).pipe(
            tap(() => {
              props.failed &&
                props.failed(
                  formStateWithError.meta.errors,
                  formStateWithError.values
                );
            })
          );
        }

        const loadingState: IFormState = {
          ...formState,
          meta: {
            ...formState.meta,
            errors: [],
            submitting: true,
          },
        };
        const finalState: IFormState = {
          ...formState,
          meta: {
            ...formState.meta,
            errors: [],
            submitting: false,
          },
        };

        return merge(
          of(loadingState),
          of(loadingState).pipe(
            asyncTap(async () => {
              props.beforeSubmit &&
                (await props.beforeSubmit(
                  loadingState.values,
                  loadingState.meta
                ));
              const returnValue = await props.onSubmit(
                loadingState.values,
                loadingState.meta
              );
              props.success && props.success(returnValue, finalState.values);
            }),
            mapTo(finalState),
            catchError((err) =>
              of<IFormState>({
                ...formState,
                meta: {
                  ...formState.meta,
                  submitting: false,
                  errors: [err],
                },
              }).pipe(
                tap((state) => {
                  props.failed && props.failed(state.meta.errors, state.values);
                })
              )
            )
          )
        );
      })
    );

    store.observe(submitSubject, submitHandler$);

    const resetForm = (): void => {
      store.dispatch({
        type: FormActionTypes.reset,
      });
    };

    const updateFormValues: TUpdateFormValues = (changes) => {
      store.dispatch({
        type: FormActionTypes.update,
        payload: changes,
      });
    };

    return {
      subscribe: store.subscribe,
      dispatch,
      submit,
      resetForm,
      updateFormValues,
      cleanup: store.cleanup,
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();
    formCtxValue.submit();
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <FormProvider value={formCtxValue}>
      <form
        className={props.className || 'DQ-form-container'}
        onSubmit={handleSubmit}
      >
        {props.children}
      </form>
    </FormProvider>
  );
}
