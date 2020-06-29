import React, { useMemo } from 'react';
import { BehaviorSubject } from 'rxjs';
import { mergeScan, shareReplay } from 'rxjs/operators';

import { FormProvider, FORM_INIT_STATE } from './FormContext';

import {
  FormActionTypes,
  IFieldAction,
  IFormAction,
  IFormContextValue,
  TFormSubmitCallback,
} from './interfaces';

import reducer from './reducer';

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

    const dispatch = (action: IFieldAction | IFormAction): void => {
      actionSubject.next(action);
    };

    const formState$ = actionSubject.pipe(
      mergeScan((formState, action) => {
        const nextFormState = reducer(formState, action, {
          onSubmit: props.onSubmit,
          success: props.success,
          failed: props.failed,
          beforeSubmit: props.beforeSubmit,
        });
        // log

        return nextFormState;
      }, FORM_INIT_STATE),
      shareReplay(1)
    );

    return {
      subscribe: (observer) => formState$.subscribe(observer),
      subscribeFormAction: (observer) => actionSubject.subscribe(observer),
      dispatch,
    };
  }, [props.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
