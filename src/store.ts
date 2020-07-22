import { Subject, BehaviorSubject } from 'rxjs';
import { withLatestFrom, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { Observer } from 'rxjs/internal/types';

import { TReducer, IAction } from './interfaces';

const log = <S, A extends IAction>(
  preState: S,
  action: A,
  nextState: S
): void => {
  if (process.env.NODE_ENV === 'development') {
    console.groupCollapsed(`${action.type} ${new Date().toLocaleTimeString()}`);
    console.log('prevFormState', preState);
    console.log(`%cAction ${JSON.stringify(action)}`, 'color: red');
    console.log('nextState', nextState);
    console.groupEnd();
  }
};

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
    map(([action, state]) => {
      const nextState = reducer(action, state);
      log(state, action, nextState);
      return nextState;
    })
  );

  const actionSubscription = actionSubject.subscribe(actionCache);
  const stateSubscription = state$.subscribe(stateSubject);

  const cleanup = () => {
    stateSubscription.unsubscribe();
    actionSubscription.unsubscribe();
  };

  const dispatch = (action: A) => actionSubject.next(action);

  return {
    dispatch,
    observe: (action$: Observable<A>, stream$: Observable<T>) => {
      const actionSub = action$.subscribe(actionCache);
      const sub = stream$
        .pipe(
          tap((state) => {
            const currentState = stateSubject.getValue();
            const action = actionCache.getValue();
            log(currentState, action, state);
          })
        )
        .subscribe(stateSubject);

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
