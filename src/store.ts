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
            '%c action',
            'color: #9E9E9E;',
            `${action.type}`,
            `@ ${new Date().toLocaleTimeString()}`
          );
          console.log(
            '%c prev state',
            'color: #9E9E9E; font-weight: bold',
            pre
          );
          console.log('%c action', 'color: #03A9F4; font-weight: bold', action);
          console.log(
            '%c next state',
            'color: #4CAF50; font-weight: bold',
            next
          );
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
