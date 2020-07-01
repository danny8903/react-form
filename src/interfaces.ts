import { Observer } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';

export { Observable, Subscription };

type TErrorMsg = string | undefined;
export type TError = any;
export type TFieldValue = any;
export type TFieldValidator = (value: TFieldValue) => TError | undefined;

export type TFormSubmitCallback = (
  values: IFormValues,
  meta: IFormMeta
) => void;

export interface IFormContextValue {
  dispatch: (fieldAction: IFieldAction | IFormAction) => void;
  submit: (fieldAction: ISubmitAction) => void;
  subscribeFormAction: (
    observer: Observer<IFieldAction | IFormAction | ISubmitAction>
  ) => Subscription;
  subscribe: (observer: Observer<IFormState>) => Subscription;
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
  name: string;
  dirty: boolean;
  // validate?: TFieldValidator;
  error?: TError;
  customProps?: any;
  required?: boolean;
  destroyValueOnUnmount?: boolean;
  defaultValue?: TFieldValue;
}

export interface IFieldAction {
  name: string;
  type: FieldActionTypes;
  meta?: Partial<IFieldMeta>;
  payload?: TFieldValue;
}

export enum FieldActionTypes {
  register = 'REGISTER',
  change = 'CHANGE',
  focus = 'FOCUS',
  blur = 'BLUR',
  destroy = 'DESTROY',
  throwError = 'THROW_ERROR',
}

export interface IFieldState {
  value?: TFieldValue;
  meta: IFieldMeta;
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
  reset = 'FORM_RESET',
  init = 'FORM_INIT',
  submit = 'SUBMIT',
}

export interface ISubmitAction {
  type: 'SUBMIT';
}
