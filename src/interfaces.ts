import { Observer } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';

export { Observable };

type TErrorMsg = string | undefined;
type TError = any;
export type TFieldValue = any;
export type TFieldValidator = (value: TFieldValue) => TError | undefined;

export type TFormSubmitCallback = (
  values: IFormValues,
  meta: IFormMeta
) => void;

export interface IFormContextValue {
  dispatch: (fieldAction: IFieldAction | IFormAction) => void;
  subscribeFormAction: (observer: Observer<IFieldAction | IFormAction>) => void;
  subscribe: (observer: Observer<IFormState>) => void;
  fieldPrefix?: string;
}

/**
 *   +-------------------+
 *   |       Fields      |                   |
 *   +-------------------+
 *  */

export interface IFields {
  [fieldName: string]: IFieldMeta;
}

export interface IFieldMeta {
  dirty: boolean;
  validate?: TFieldValidator;
  error?: TError;
  warning?: string;
  required?: boolean;
  destroyValueOnUnmount?: boolean;
  defaultValue?: TFieldValue;
}

export interface IFieldAction {
  name: string;
  type: FieldActionTypes;
  meta?: IFieldMeta;
  payload?: TFieldValue;
}

export enum FieldActionTypes {
  register = 'REGISTER',
  change = 'CHANGE',
  focus = 'FOCUS',
  blur = 'BLUR',
  destroy = 'DESTROY',
}

/**
 *   +-------------------+
 *   |       Form        |                   |
 *   +-------------------+
 *  */
export interface IFormValues {
  [fieldName: string]: TFieldValue;
}

export interface IFormMeta {
  submitting: boolean;
  dirty: boolean;
  errors: any[];
}

export interface IFormState {
  fields: IFields;
  values: IFormValues;
  meta: IFormMeta;
}

export interface IFormAction {
  type: FormActionTypes;
}

export enum FormActionTypes {
  startSubmit = 'FORM_START_SUBMIT',
  endSubmit = 'FORM_END_SUBMIT',
  reset = 'FORM_RESET',
  init = 'FORM_INIT',
  submit = 'SUBMIT',
}
