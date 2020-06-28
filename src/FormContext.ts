import { createContext } from 'react';
import { IFormContextValue, IFormState } from './interfaces';

// const FormContext = createContext<IFormContextValue>({
//   subscribe: (_: any) => {},
//   dispatch: (_: any) => {},
//   subscribeFormAction: (_: any) => {},
//   updateFormValues: (_: any) => {},
//   updateFormState: (_: any) => {},
//   getFormValues: () => ({}),
//   getFormState: () => ({} as IFormState),
// });

const FormContext = createContext<IFormContextValue>({} as IFormContextValue);

const { Provider, Consumer } = FormContext;

const FORM_INIT_STATE: IFormState = {
  fields: {},
  values: {},
  meta: {
    submitting: false,
    changed: false,
    errors: [],
  },
};

export {
  Provider as FormProvider,
  Consumer as FormConsumer,
  FormContext,
  FORM_INIT_STATE,
};
