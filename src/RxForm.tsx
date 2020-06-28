import React, { useMemo, useEffect } from 'react';
import { BehaviorSubject, zip, defer } from 'rxjs';
import {
  scan,
  mergeScan,
  shareReplay,
  filter,
  exhaustMap,
} from 'rxjs/operators';

import { FormProvider, FORM_INIT_STATE } from './FormContext';

import {
  FormActionTypes,
  IFieldAction,
  IFormAction,
  IFormValues,
  IFormMeta,
  IFormContextValue,
  IFormState,
} from './interfaces';

import reducer from './reducer';

interface IRxFormProps {
  children: React.ReactNode;
  onSubmit: (values: IFormValues, meta: IFormMeta) => void;
  success?: (value: IFormValues, meta: IFormMeta) => void;
  failed?: (value: IFormValues, meta: IFormMeta) => void;
  className?: string;
}

export function RxForm(props: IRxFormProps) {
  const formCtxValue = useMemo<IFormContextValue>(() => {
    const actionSubject = new BehaviorSubject<IFieldAction | IFormAction>({
      type: FormActionTypes.init,
    });

    const dispatch = (action: IFieldAction | IFormAction): void => {
      actionSubject.next(action);
    };

    const formState$ = actionSubject.pipe(
      scan((formState, action) => {
        const nextFormState = reducer(formState, action);
        // log
        return nextFormState;
      }, FORM_INIT_STATE),
      shareReplay(1)
    );

    // const formState$ = actionSubject.pipe(
    //   mergeScan((formState, action) => {
    //     const nextFormState = reducer(formState, action);
    //     // log
    //     return nextFormState;
    //   }, FORM_INIT_STATE),
    //   shareReplay(1)
    // );

    const actionState$ = zip(actionSubject, formState$);

    const resetForm = () => {
      dispatch({
        type: FormActionTypes.reset,
      });
    };

    return {
      subscribe: (observer) => formState$.subscribe(observer),
      subscribeFormAction: (observer) => actionSubject.subscribe(observer),
      dispatch,
      resetForm,
      actionState$,
    };
  }, []);

  const submitForm = async (formState: IFormState): Promise<void> => {
    const formErrors = isFormValid(formState);
    if (formErrors.length !== 0) {
      formCtxValue.dispatch({
        type: FormActionTypes.error,
      });
      return;
    }

    if (props.beforeSubmit) {
      await Promise.resolve(formState).then((s) =>
        props.beforeSubmit(s.values, s.meta)
      );
    }

    formCtxValue.dispatch({
      type: FormActionTypes.startSubmit,
    });

    try {
      await props.onSubmit(formState.values, formState.meta);
      props.success && props.success(formState.values, formState.meta);
    } catch (err) {
      formCtxValue.dispatch({
        type: FormActionTypes.error,
        payload: err,
      });

      props.failed && props.failed(formState.values, formState.meta);
    } finally {
      formCtxValue.dispatch({
        type: FormActionTypes.endSubmit,
      });
    }
  };

  useEffect(() => {
    const submitFormSubscription = formCtxValue.actionState$
      .pipe(
        filter(([action]) => action.type === FormActionTypes.submit),
        exhaustMap(([, state]) =>
          defer(() => {
            submitForm(state);
          })
        )
      )
      .subscribe();

    return () => {
      submitFormSubscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();
    formCtxValue.dispatch({
      type: FormActionTypes.submit,
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
