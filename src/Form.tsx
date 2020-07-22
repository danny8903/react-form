import React, { useMemo, useEffect } from 'react';
import { Subject, merge, of } from 'rxjs';
import { exhaustMap, catchError, tap, mapTo } from 'rxjs/operators';

import { FormProvider, FORM_INIT_STATE } from './FormContext';

import {
  FormActionTypes,
  FieldActionTypes,
  IFormAction,
  IFieldAction,
  IFormContextValue,
  TFormSubmitCallback,
  TUpdateFormValues,
  IFormState,
} from './interfaces';

import reducer from './reducer';
import { asyncTap } from './utils';
import { verifyForm } from './verificationHelpers';
import { createStore } from './store';

import './Form.css';

interface IRxFormProps {
  children: React.ReactNode;
  onSubmit: TFormSubmitCallback;
  success?: TFormSubmitCallback;
  failed?: TFormSubmitCallback;
  beforeSubmit?: TFormSubmitCallback;
  className?: string;
}

interface IMemoValue extends IFormContextValue {
  cleanup: () => void;
}

export function Form(props: IRxFormProps) {
  const { cleanup, ...formCtxValue } = useMemo<IMemoValue>(() => {
    const submitSubject = new Subject<IFormAction>();

    const store = createStore(FORM_INIT_STATE, reducer);

    const submit = (): void => {
      submitSubject.next({
        type: FormActionTypes.submit,
      });
    };

    const dispatch = (action: IFieldAction | IFormAction): void => {
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
                  formStateWithError.values,
                  formStateWithError.meta
                );
            })
          );
        }

        const loadingState: IFormState = {
          ...formState,
          meta: {
            ...formState.meta,
            submitting: true,
          },
        };
        const finalState: IFormState = {
          ...formState,
          meta: {
            ...formState.meta,
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
              await props.onSubmit(loadingState.values, loadingState.meta);
            }),
            mapTo(finalState),
            tap(() => {
              props.success &&
                props.success(finalState.values, finalState.meta);
            }),
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
                  props.failed && props.failed(state.values, state.meta);
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
