import { createContext } from 'react';
import {
  IFormContextValue,
  IFormState,
  IFormAction,
  FormActionTypes,
} from './interfaces';

const FormContext = createContext<IFormContextValue>({} as IFormContextValue);

const { Provider, Consumer } = FormContext;

const FORM_INIT_STATE: IFormState = {
  fields: {},
  values: {},
  meta: {
    submitting: false,
    errors: [],
  },
};

const FORM_INIT_ACTION: IFormAction = {
  type: FormActionTypes.init,
};

export {
  Provider as FormProvider,
  Consumer as FormConsumer,
  FormContext,
  FORM_INIT_STATE,
  FORM_INIT_ACTION,
};
