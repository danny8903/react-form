import { FORM_INIT_STATE } from './FormContext';

import {
  IFieldAction,
  IFormAction,
  // FieldActionTypes,
  FormActionTypes,
  IFormState,
  TFormSubmitCallback,
  IFieldMeta,
  //   TErrors,
} from './interfaces';

const reducer = (
  formState: IFormState,
  action: IFieldAction | IFormAction
): IFormState => {
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

    // case FormActionTypes.reset: {
    //   const nextFormState = formReset(formState);
    //   return nextFormState;
    // }
    case FormActionTypes.init: {
      return { ...FORM_INIT_STATE };
    }
    default:
      return formState;
  }
};

export default reducer;
