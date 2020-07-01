import React, { useMemo } from 'react';
import { BehaviorSubject, Subject, merge, of } from 'rxjs';
import {
  scan,
  shareReplay,
  withLatestFrom,
  exhaustMap,
  catchError,
  tap,
  map,
} from 'rxjs/operators';

import { FormProvider, FORM_INIT_STATE } from './FormContext';

import {
  FormActionTypes,
  FieldActionTypes,
  IFieldAction,
  IFormAction,
  ISubmitAction,
  IFormState,
  IFormContextValue,
  TFormSubmitCallback,
} from './interfaces';

import reducer from './reducer';
import { asyncTap } from './utils';
import { verifyForm } from './formHelpers';

interface IRxFormProps {
  children: React.ReactNode;
  onSubmit: TFormSubmitCallback;
  success?: TFormSubmitCallback;
  failed?: TFormSubmitCallback;
  beforeSubmit?: TFormSubmitCallback;
  className?: string;
  id?: string;
}

export function RxForm(props: IRxFormProps) {
  const formCtxValue = useMemo<IFormContextValue>(() => {
    const actionSubject = new BehaviorSubject<IFieldAction | IFormAction>({
      type: FormActionTypes.init,
    });

    const submitActionSubject = new Subject<ISubmitAction>();

    const action$ = merge(submitActionSubject, actionSubject);

    const dispatch = (action: IFieldAction | IFormAction): void => {
      if (
        !(action.type in FormActionTypes) &&
        !(action.type in FieldActionTypes)
      ) {
        throw new Error(`Invalid action: ${action.type} is invalid`);
      }
      actionSubject.next(action);
    };

    const submit = (action: ISubmitAction): void => {
      submitActionSubject.next(action);
    };

    const formStateBeforeSubmit$ = actionSubject.pipe(
      scan((formState, action) => reducer(formState, action), FORM_INIT_STATE),
      shareReplay(1)
    );

    const formStateAfterSubmit$ = submitActionSubject.pipe(
      withLatestFrom(formStateBeforeSubmit$),
      exhaustMap(([, formState]) => {
        const formStateWithError = verifyForm(formState);
        if (formStateWithError) {
          return of(formStateWithError).pipe(
            tap((state) => {
              props.failed && props.failed(state.values, state.meta);
            })
          );
        }

        const submittingState = of<IFormState>({
          ...formState,
          meta: {
            ...formState.meta,
            submitting: true,
          },
        });

        return merge(
          submittingState,
          submittingState.pipe(
            asyncTap(async (state) => {
              props.beforeSubmit &&
                (await props.beforeSubmit(state.values, state.meta));
            }),
            asyncTap(async (state) => {
              await props.onSubmit(state.values, state.meta);
            }),
            asyncTap(async (state) => {
              props.success && (await props.success(state.values, state.meta));
            }),
            map<IFormState, IFormState>((state) => ({
              ...state,
              meta: {
                ...state.meta,
                submitting: false,
              },
            })),
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

    const formState$ = merge(
      formStateBeforeSubmit$,
      formStateAfterSubmit$
    ).pipe(shareReplay(1));

    // formState$.subscribe((s) => console.log('current state', s));
    return {
      subscribe: (observer) => formState$.subscribe(observer),
      subscribeFormAction: (observer) => action$.subscribe(observer),
      dispatch,
      submit,
    };
  }, [props.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();
    formCtxValue.submit({
      type: 'SUBMIT',
    });
  };

  return (
    <FormProvider value={formCtxValue}>
      <form className={props.className} onSubmit={handleSubmit}>
        {props.children}
      </form>
    </FormProvider>
  );
}
