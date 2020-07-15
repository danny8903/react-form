import get from 'lodash.get';

import { isEmpty, isNil } from './utils';
import {
  IFormState,
  IFieldMeta,
  TFieldValue,
  TError,
  TFieldValidator,
} from './interfaces';

export const asyncVerifyField = async (
  name: string,
  value: TFieldValue,
  required?: boolean,
  validate?: TFieldValidator
): Promise<TError | void> => {
  // if required, check value
  const fieldIsRequiredErrorMsg = verifyRequiredField(name, value, required);
  if (fieldIsRequiredErrorMsg) {
    return fieldIsRequiredErrorMsg;
  }
  // if validator run validator
  if (validate) {
    const validError = await validate(value);
    return validError;
  }
};

export const verifyRequiredField = (
  name: string,
  value: TFieldValue,
  required?: boolean
): TError | void => {
  // if required, check value
  if (required && (isEmpty(value) || isNil(value))) {
    return new Error(`${name} is required`);
  }
};

export const verifyForm = (state: IFormState): IFormState | null => {
  const { meta, fields, values } = state;

  // check if required field is empty and update field meta error
  const fieldPairs = Object.entries({ ...fields }).map<[string, IFieldMeta]>(
    ([key, field]) => {
      const error = verifyRequiredField(key, get(values, key), field.required);

      const nextField = error ? { ...field, error } : field;

      return [key, nextField];
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
