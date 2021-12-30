import { Observer, Observable, Subscription } from 'rxjs';

export { Observable, Subscription };

export type TChildrenRender<TProps> = (props: TProps) => JSX.Element | null;

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

export type TStore = {
  action: TFieldAction | TFormAction;
  state: IFormState;
};

export interface IFormContextValue {
  dispatch: (fieldAction: TFieldAction | TFormAction) => void;
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
  dirty: boolean;
  displayName?: string;
  error?: TError;
  required?: boolean;
  destroyValueOnUnmount?: boolean;
  defaultValue: TFieldValue;
}

export interface IFieldState {
  value: TFieldValue;
  meta: IFieldMeta;
}

export enum FieldActionTypes {
  register = 'REGISTER',
  change = 'CHANGE',
  destroy = 'DESTROY',
  throwError = 'THROW_ERROR',
  clearError = 'CLEAR_ERROR',
}

interface FieldRegisterAction {
  name: string;
  type: typeof FieldActionTypes.register;
  meta: {
    displayName?: string;
    required: boolean;
    defaultValue: TFieldValue;
  };
  payload: TFieldValue;
}

export interface FieldChangeAction {
  name: string;
  type: typeof FieldActionTypes.change;
  meta?: IFieldMeta;
  payload: TFieldValue;
}

interface FieldDestroyAction {
  name: string;
  type: typeof FieldActionTypes.destroy;
  meta: {
    destroyValueOnUnmount: boolean;
  };
}

interface FieldThrowErrorAction {
  name: string;
  type: typeof FieldActionTypes.throwError;
  payload: Error;
}

interface FieldClearErrorAction {
  name: string;
  type: typeof FieldActionTypes.clearError;
}

export type TFieldAction =
  | FieldClearErrorAction
  | FieldThrowErrorAction
  | FieldDestroyAction
  | FieldChangeAction
  | FieldRegisterAction;

/**
 *   +-------------------+
 *   |       Form        |                   |
 *   +-------------------+
 *  */
export interface IFormValues {
  [fieldName: string]: TFieldValue;
}

interface ExtraMeta {
  [extraMeta: string]: any;
}
export interface IFormMeta extends ExtraMeta {
  submitting: boolean;
  dirty?: boolean;
  errors: TError[];
}

export interface IFormState {
  fields: IFields;
  values: IFormValues;
  meta: IFormMeta;
}

export enum FormActionTypes {
  reset = 'FORM_RESET',
  update = 'FORM_UPDATE',
  submit = 'FORM_SUBMIT',
}

interface FormResetAction {
  type: typeof FormActionTypes.reset;
}

interface FormSubmitAction {
  type: typeof FormActionTypes.submit;
}

type Change = {
  path: string;
  value: TFieldValue;
};
interface FormUpdateAction {
  type: typeof FormActionTypes.update;
  payload: Change[];
}

export type TFormAction = FormResetAction | FormUpdateAction | FormSubmitAction;

export type TUpdateFormValues = (changes: Change[]) => void;
