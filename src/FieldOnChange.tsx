import { useContext, useLayoutEffect } from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import isEqual from 'lodash.isequal';

import { FormContext } from './FormContext';
import {
  TStore,
  TFieldAction,
  FieldActionTypes,
  IFormValues,
  TUpdateFormValues,
  FieldChangeAction,
} from './interfaces';

interface IFormValuesInnerProps {
  action: TFieldAction;
  formValues: IFormValues;
  updateFormValues: TUpdateFormValues;
}

type Props = {
  children: (props: IFormValuesInnerProps) => void;
};

export const FieldOnChange: React.FC<Props> = (props) => {
  const { updateFormValues, subscribe } = useContext(FormContext);

  useLayoutEffect(() => {
    const store$ = new Subject<TStore>();
    const localSubscription = store$
      .pipe(
        filter(({ action }) => {
          return action.type === FieldActionTypes.change;
        }),
        map<TStore, [FieldChangeAction, IFormValues]>(({ action, state }) => {
          return [
            action as FieldChangeAction,
            {
              ...state.values,
            },
          ];
        }),
        distinctUntilChanged((next, prev) => isEqual(next[0], prev[0]))
      )
      .subscribe(([action, formValues]) => {
        props.children({
          action,
          formValues,
          updateFormValues,
        });
      });

    const actionSubscription = subscribe(store$);

    return () => {
      localSubscription.unsubscribe();
      actionSubscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};
