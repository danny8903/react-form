import {
  IFieldAction,
  IFormAction,
  FieldActionTypes,
  FormActionTypes,
  IFieldMeta,
  IFields,
  IFormState,
  IFormValues,
  //   TErrors,
} from './interfaces';

const reducer = (
  formState: IFormState,
  action: IFieldAction | IFormAction
): IFormState => {
  switch (action.type) {
    case FieldActionTypes.register: {
      const nextFormState = formRegister(formState, action as IFieldAction);
      return nextFormState;
    }
    case FieldActionTypes.change: {
      const nextFormState = formUpdateField(formState, action as IFieldAction);
      return nextFormState;
    }
    case FieldActionTypes.destroy: {
      const nextFormState = formRemoveField(formState, action as IFieldAction);
      return nextFormState;
    }
    case FormActionTypes.submit: {
      const nextFormState = formOnSubmit(formState, action as IFormAction);

      return nextFormState;
    }
    case FormActionTypes.startSubmit: {
      const nextFormState = {
        values: formState.values,
        fields: formState.fields,
        meta: {
          ...formState.meta,
          submitting: true,
        },
      };
      return nextFormState;
    }
    case FormActionTypes.endSubmit: {
      const nextFormState = {
        values: formState.values,
        fields: formState.fields,
        meta: {
          ...formState.meta,
          submitting: false,
          changed: false,
        },
      };
      return nextFormState;
    }

    case FormActionTypes.reset: {
      const nextFormState = formReset(formState);
      return nextFormState;
    }
    default:
      return formState;
  }
};

export default reducer;
