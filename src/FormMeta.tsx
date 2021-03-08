import { isEqual } from 'lodash';
import { useContext, useLayoutEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import { FormContext } from './FormContext';
import { TStore, TChildrenRender, IFormMeta } from './interfaces';

interface IFormValuesProps {
  children: TChildrenRender<IFormMeta>;
}
export function FormMeta(props: IFormValuesProps) {
  const { subscribe } = useContext(FormContext);

  const [formMeta, setFormMeta] = useState<IFormMeta>();
  useLayoutEffect(() => {
    const store$ = new Subject<TStore>();
    const formMeta$ = store$.pipe(
      map(({ state }) => {
        return {
          ...state.meta,
        };
      }),
      distinctUntilChanged(isEqual),
      tap((meta: IFormMeta) => setFormMeta(meta))
    );

    const formStateSubscription = subscribe(store$);
    const formMetaSubscription = formMeta$.subscribe();
    return () => {
      formStateSubscription.unsubscribe();
      formMetaSubscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!formMeta) return null;

  return props.children(formMeta);
}
