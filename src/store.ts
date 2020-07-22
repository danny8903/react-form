import { Subject, BehaviorSubject } from 'rxjs';
import { withLatestFrom, map, tap, pairwise } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { Observer } from 'rxjs/internal/types';

import { TReducer, IAction } from './interfaces';

export const createStore = <T, A extends IAction>(
  initState: T,
  reducer: TReducer<A, T>
) => {
  const actionSubject = new Subject<A>();
  const stateSubject = new BehaviorSubject<T>(initState);
  const actionCache = new BehaviorSubject({
    type: '@@INIT',
  } as A);

  const state$ = actionSubject.pipe(
    withLatestFrom(stateSubject),
    map(([action, state]) => reducer(action, state))
  );

  const actionSubscription = actionSubject.subscribe(actionCache);
  const stateSubscription = state$.subscribe(stateSubject);

  if (process.env.NODE_ENV === 'development') {
    const logSubscription = stateSubject
      .pipe(
        pairwise(),
        tap(([pre, next]) => {
          const action = actionCache.getValue();
          console.groupCollapsed(
            `${action.type} ${new Date().toLocaleTimeString()}`
          );
          console.log('prevFormState', pre);
          console.log(`%cAction ${JSON.stringify(action)}`, 'color: red');
          console.log('nextState', next);
          console.groupEnd();
        })
      )
      .subscribe();
    stateSubscription.add(logSubscription);
  }

  const cleanup = () => {
    stateSubscription.unsubscribe();
    actionSubscription.unsubscribe();
  };

  const dispatch = (action: A) => actionSubject.next(action);

  return {
    dispatch,
    observe: (action$: Observable<A>, stream$: Observable<T>) => {
      const actionSub = action$.subscribe(actionCache);
      const sub = stream$.subscribe(stateSubject);

      stateSubscription.add(sub);
      actionSubscription.add(actionSub);
    },
    getState: () => stateSubject.getValue(),
    subscribe: (observer: Observer<{ action: A; state: T }>) => {
      return stateSubject
        .pipe(
          map((state) => {
            const action = actionCache.getValue();
            return { action, state };
          })
        )
        .subscribe(observer);
    },
    cleanup,
  };
};
