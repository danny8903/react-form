import { Observer } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';

type TErrorMsg = string | undefined;
export type TFieldValue = any;
export type TValidator = (value: TFieldValue) => TErrorMsg;

export interface IFormContextValue {
  dispatch: (fieldAction: IFieldAction | IFormAction) => void;
  subscribeFormAction: (observer: Observer<IFieldAction | IFormAction>) => void;
  subscribe: (observer: Observer<IFormState>) => void;
  actionState$: Observable<[IFieldAction | IFormAction, IFormState]>;
  fieldPrefix?: string;
}

// export interface IFormContextValue {
//   dispatch: (fieldAction: IFieldAction | IFormAction) => any;
//   subscribeFormAction: (observer: Observer<any>) => any;
//   subscribe: (observer: Observer<any>) => any;
//   updateFormValues: (formValues: IFormValues) => any;
//   updateFormState: (formState: IFormState) => any;
//   getFormValues: () => IFormValues;
//   getFormState: () => IFormState;
//   fieldPrefix?: string;
// }

/**
 *   +-------------------+
 *   |       Fields      |                   |
 *   +-------------------+
 *  */

export interface IFields {
  [fieldName: string]: IFieldMeta;
}

export interface IFieldMeta {
  dirty?: boolean;
  touched?: boolean;
  visited?: boolean;
  error?: TErrorMsg;
  warning?: string | undefined;
  required?: boolean;
  destroyValueOnUnmount?: boolean;
  defaultValue?: any;
}

export interface IFieldAction {
  name: string;
  type: FieldActionTypes;
  meta?: IFieldMeta; // & { destroyValueOnUnmount?: boolean };
  payload?: TFieldValue;
}

export enum FieldActionTypes {
  register = 'REGISTER',
  change = 'CHANGE',
  focus = 'FOCUS',
  blur = 'BLUR',
  destroy = 'DESTROY',
}

// Form
export interface IFormValues {
  [fieldName: string]: TFieldValue;
}

export interface IFormMeta {
  submitting: boolean;
  changed: boolean;
  errors: TErrorMsg[];
}

export interface IFormState {
  fields: IFields;
  values: IFormValues;
  meta: IFormMeta;
}

export interface IFormAction {
  type: FormActionTypes;
  meta?: any;
}

export enum FormActionTypes {
  startSubmit = 'FORM_START_SUBMIT',
  endSubmit = 'FORM_END_SUBMIT',
  reset = 'FORM_RESET',
  init = 'FORM_INIT',
  submit = 'SUBMIT',
}
