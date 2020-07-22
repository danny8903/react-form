import { createContext } from 'react';
import { IFormContextValue, IFormState } from './interfaces';

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

export {
  Provider as FormProvider,
  Consumer as FormConsumer,
  FormContext,
  FORM_INIT_STATE,
};
