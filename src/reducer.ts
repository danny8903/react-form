import { merge, defer, of } from 'rxjs';
import { exhaustMap, catchError, tap } from 'rxjs/operators';

import {
  IFieldAction,
  IFormAction,
  // FieldActionTypes,
  FormActionTypes,
  IFormState,
  TFormSubmitCallback,
  Observable,
  IFieldMeta,
  //   TErrors,
} from './interfaces';

import { asyncTap, isEmpty, isNil } from './utils';

export const validForm = (state: IFormState): IFormState | null => {
  const { meta, fields, values } = state;
  // check if error in form meta
  if (meta.errors.length !== 0) {
    return state;
  }

  // update field meta error
  const fieldPairs = Object.entries({ ...fields }).map<[string, IFieldMeta]>(
    ([key, field]) => {
      // if required, check value
      if (field.required && (isEmpty(values[key]) || isNil(values[key]))) {
        field.error = `${key} is required`;
      }
      // if validator run validator
      const validateError = field.validate && field.validate(values[key]);
      if (validateError) {
        field.error = validateError;
      }
      return [key, field];
    }
  );

  const errors = fieldPairs
    .map(([, field]) => field.error)
    .filter((err) => !!err);

  if (errors.length === 0) {
    return null;
  }

  const formStateWithError: IFormState = {
    fields: Object.fromEntries(fieldPairs),
    values,
    meta: {
      ...meta,
      errors,
    },
  };

  return formStateWithError;
};

const reducer = (
  formState: IFormState,
  action: IFieldAction | IFormAction,
  props: {
    onSubmit: TFormSubmitCallback;
    success?: TFormSubmitCallback;
    failed?: TFormSubmitCallback;
    beforeSubmit?: TFormSubmitCallback;
  }
): Observable<IFormState> => {
  switch (action.type) {
    // case FieldActionTypes.register: {
    //   const nextFormState = formRegister(formState, action as IFieldAction);
    //   return nextFormState;
    // }
    // case FieldActionTypes.change: {
    //   const nextFormState = formUpdateField(formState, action as IFieldAction);
    //   return nextFormState;
    // }
    // case FieldActionTypes.destroy: {
    //   const nextFormState = formRemoveField(formState, action as IFieldAction);
    //   return nextFormState;
    // }
    case FormActionTypes.submit: {
      const formStateWithError = validForm(formState);
      if (formStateWithError) {
        return of(formStateWithError);
      }

      return merge(
        of<IFormState>({
          ...formState,
          meta: {
            ...formState.meta,
            submitting: true,
          },
        }),
        of<IFormState>({
          ...formState,
          meta: {
            ...formState.meta,
            submitting: false,
          },
        }).pipe(
          asyncTap(async (state) => {
            props.beforeSubmit &&
              (await props.beforeSubmit(state.values, state.meta));
          }),
          exhaustMap((state) =>
            defer(async () => {
              await props.onSubmit(state.values, state.meta);
              return state;
            })
          ),
          asyncTap(async (state) => {
            props.success && (await props.success(state.values, state.meta));
          }),
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
    }

    // case FormActionTypes.reset: {
    //   const nextFormState = formReset(formState);
    //   return nextFormState;
    // }
    default:
      return of(formState);
  }
};

export default reducer;
