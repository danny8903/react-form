import omit from 'lodash.omit';
import set from 'lodash.set';

import { FORM_INIT_STATE } from './FormContext';

import {
  FieldActionTypes,
  FormActionTypes,
  IFormState,
  IFieldMeta,
  IFormValues,
  TUpdateFormValues,
  TReducer,
} from './interfaces';

const reducer: TReducer = (action, formState): IFormState => {
  switch (action.type) {
    case FieldActionTypes.register: {
      const { fields, values, meta: formMeta } = formState;
      const { payload, meta = {}, name } = action;

      return {
        fields: {
          ...fields,
          [name]: {
            ...meta,
            dirty: false,
          } as IFieldMeta,
        },
        meta: formMeta,
        values: set<IFormValues>({ ...values }, name, payload),
      };
    }
    case FieldActionTypes.change: {
      const { fields, values, meta: formMeta } = formState;
      const { payload, meta = {}, name } = action;

      const nextFeilds = {
        ...fields,
        [name]: {
          ...fields[name],
          ...meta,
          dirty: true,
        },
      };

      return {
        fields: nextFeilds,
        meta: formMeta,
        values: set<IFormValues>({ ...values }, name, payload),
      };
    }
    case FieldActionTypes.destroy: {
      const { meta = {}, name } = action;
      if (meta.destroyValueOnUnmount) {
        return {
          ...formState,
          fields: omit(formState.fields, name),
          values: omit(formState.values, name),
        };
      }

      return {
        ...formState,
        fields: omit(formState.fields, name),
      };
    }
    case FieldActionTypes.throwError: {
      const { fields } = formState;
      const { payload, name } = action;

      const nextFeilds = {
        ...fields,
        [name]: {
          ...fields[name],
          error: payload,
        },
      };

      return {
        ...formState,
        fields: nextFeilds,
      };
    }
    case FieldActionTypes.clearError: {
      const { fields } = formState;
      const { name } = action;

      const nextFeilds = {
        ...fields,
        [name]: {
          ...fields[name],
          error: undefined,
        },
      };

      return {
        ...formState,
        fields: nextFeilds,
      };
    }
    case FormActionTypes.update: {
      const { fields, values } = formState;
      const changes: Parameters<TUpdateFormValues>[0] = action.payload;
      if (!Array.isArray(changes)) {
        throw new Error(
          `updateFormValues should receive an array but get: ${JSON.stringify(
            changes
          )}`
        );
      }

      const nextValues = {
        ...values,
      };
      const nextFields = {
        ...fields,
      };
      changes.forEach(({ path, value }) => {
        if (fields.hasOwnProperty(path)) {
          set(nextValues, path, value);
          set(nextFields, `${path}.dirty`, true);
        }
      });

      return {
        ...formState,
        fields: nextFields,
        values: nextValues,
      };
    }
    case FormActionTypes.reset: {
      const { fields, values } = formState;

      const resetMeta = {
        submitting: false,
        errors: [],
      };

      const resetFields = Object.fromEntries(
        Object.entries(fields).map(([key, value]) => {
          return [
            key,
            {
              ...value,
              dirty: false,
              error: undefined,
            },
          ];
        })
      );

      const resetValues = {
        ...values,
      };
      Object.entries(fields).forEach(([path, meta]) => {
        set(resetValues, path, meta.defaultValue);
      });

      return {
        values: resetValues,
        fields: resetFields,
        meta: resetMeta,
      };
    }
    case FormActionTypes.submit: {
      const { payload } = action;
      return payload;
    }
    case FormActionTypes.init: {
      return { ...FORM_INIT_STATE };
    }
    default:
      return formState;
  }
};

export default reducer;
