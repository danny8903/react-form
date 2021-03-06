import isEqual from 'lodash.isequal';
import { useContext, useLayoutEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import { FormContext } from './FormContext';
import { TStore, IFormValues, TChildrenRender } from './interfaces';

interface IFormValuesProps {
  children: TChildrenRender<IFormValues>;
  filter?: (next: IFormValues, prev: IFormValues) => boolean;
}

export function FormValues(props: IFormValuesProps) {
  const { subscribe } = useContext(FormContext);

  const [formValues, setFormValues] = useState<IFormValues>();
  useLayoutEffect(() => {
    const store$ = new Subject<TStore>();
    const formValues$ = store$.pipe(
      map(({ state }) => ({
        ...state.values,
      })),
      distinctUntilChanged((next, prev) => {
        if (!props.filter) {
          return isEqual(next, prev);
        }
        return !props.filter(next, prev);
      }),
      tap((values: IFormValues) => setFormValues(values))
    );

    const formStateSubscription = subscribe(store$);
    const formValueSubscription = formValues$.subscribe();
    return () => {
      formStateSubscription.unsubscribe();
      formValueSubscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!formValues) return null;

  return props.children(formValues);
}
