import React, { useMemo, useEffect } from 'react';
import { BehaviorSubject, Subject, merge, of, partition } from 'rxjs';
import {
  withLatestFrom,
  exhaustMap,
  catchError,
  tap,
  map,
  mapTo,
} from 'rxjs/operators';

import { FormProvider, FORM_INIT_STATE, FORM_INIT_ACTION } from './FormContext';

import {
  FormActionTypes,
  FieldActionTypes,
  IFieldAction,
  IFormAction,
  IFormContextValue,
  TFormSubmitCallback,
  TUpdateFormValues,
  TStore,
} from './interfaces';

import reducer from './reducer';
import { asyncTap, logger } from './utils';
import { verifyForm } from './verificationHelpers';

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
    const storeSubject = new BehaviorSubject<TStore>({
      action: FORM_INIT_ACTION,
      state: FORM_INIT_STATE,
    });

    const actionSubject = new Subject<IFieldAction | IFormAction>();

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
      actionSubject.next(action);
    };

    const submit = (): void => {
      dispatch({
        type: FormActionTypes.submit,
      });
    };

    const prevStore$ = actionSubject.pipe(
      withLatestFrom(storeSubject),
      map(([action, { state }]) => ({ action, state }))
    );

    const [submit$, rest$] = partition(prevStore$, ({ action }) => {
      return action.type === FormActionTypes.submit;
    });

    const submitHandler$ = submit$.pipe(
      exhaustMap(({ action, state: formState }) => {
        const formStateWithError = verifyForm(formState);
        if (formStateWithError) {
          const enhanceAction: IFormAction = {
            ...(action as IFormAction),
            payload: formStateWithError,
          };
          return of<TStore>({ action: enhanceAction, state: formState }).pipe(
            tap(() => {
              props.failed &&
                props.failed(
                  formStateWithError.values,
                  formStateWithError.meta
                );
            })
          );
        }

        const loadingState = {
          ...formState,
          meta: {
            ...formState.meta,
            submitting: true,
          },
        };
        const finalState = {
          ...formState,
          meta: {
            ...formState.meta,
            submitting: false,
          },
        };

        const submittingStore = of<TStore>({
          action: {
            ...(action as IFormAction),
            payload: loadingState,
          },
          state: formState,
        });

        return merge(
          submittingStore,
          submittingStore.pipe(
            asyncTap(async () => {
              props.beforeSubmit &&
                (await props.beforeSubmit(
                  loadingState.values,
                  loadingState.meta
                ));
              await props.onSubmit(loadingState.values, loadingState.meta);
            }),
            mapTo<TStore, TStore>({
              action: {
                ...(action as IFormAction),
                payload: finalState,
              },
              state: formState,
            }),
            tap(() => {
              props.success &&
                props.success(finalState.values, finalState.meta);
            }),
            catchError((err) =>
              of<TStore>({
                action: {
                  ...(action as IFormAction),
                  payload: {
                    ...formState,
                    meta: {
                      ...formState.meta,
                      submitting: false,
                      errors: [err],
                    },
                  },
                },
                state: formState,
              }).pipe(
                tap(({ state }) => {
                  props.failed && props.failed(state.values, state.meta);
                })
              )
            )
          )
        );
      })
    );

    const store$ = merge(submitHandler$, rest$).pipe(
      map(({ action, state }) => {
        const nextState = logger(reducer)(action, state);
        return { action, state: nextState };
      })
    );

    const storeSubscription = store$.subscribe(storeSubject);

    const cleanup = () => {
      storeSubscription.unsubscribe();
    };

    const resetForm = (): void => {
      dispatch({
        type: FormActionTypes.reset,
      });
    };

    const updateFormValues: TUpdateFormValues = (changes) => {
      dispatch({
        type: FormActionTypes.update,
        payload: changes,
      });
    };

    return {
      subscribe: (observer) => storeSubject.subscribe(observer),
      dispatch,
      submit,
      resetForm,
      updateFormValues,
      cleanup,
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
