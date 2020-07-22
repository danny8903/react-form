import { Observer } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';

export { Observable, Subscription };

export type TChildrenRender<TProps> = (props: TProps) => JSX.Element | null;

export type TUpdateFormValues = (
  changes: {
    path: string;
    value: TFieldValue;
  }[]
) => void;

export interface IAction<T = string> {
  type: T;
}
interface AnyAction extends IAction {
  [extraProps: string]: any;
}
export type TReducer<A extends IAction = AnyAction, S = any> = (
  action: A,
  state: S
) => S;

export type TError = Error;
export type TFieldValue = any;
export type TFieldValidator = (
  value: TFieldValue
) => Promise<TError | undefined>;

export type TFormSubmitCallback = (
  values: IFormValues,
  meta: IFormMeta
) => void;

export type TStore = {
  action: IFieldAction | IFormAction;
  state: IFormState;
};

export interface IFormContextValue {
  dispatch: (fieldAction: IFieldAction | IFormAction) => void;
  submit: () => void;
  resetForm: () => void;
  updateFormValues: TUpdateFormValues;
  subscribe: (observer: Observer<TStore>) => Subscription;
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
  // name: string;
  dirty: boolean;
  // validate?: TFieldValidator;
  error?: TError;
  required?: boolean;
  destroyValueOnUnmount?: boolean;
  defaultValue: TFieldValue;
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
  clearError = 'CLEAR_ERROR',
}

export interface IFieldState {
  value: TFieldValue;
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
  errors: TError[];
}

export interface IFormState {
  fields: IFields;
  values: IFormValues;
  meta: IFormMeta;
}

export interface IFormAction {
  type: FormActionTypes;
  payload?: any;
}

export enum FormActionTypes {
  reset = 'FORM_RESET',
  init = 'FORM_INIT',
  update = 'FORM_UPDATE',
  submit = 'FORM_SUBMIT',
}
