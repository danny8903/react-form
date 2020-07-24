import reducer from '../reducer';

import {
  TFieldAction,
  TFormAction,
  FieldActionTypes,
  FormActionTypes,
  IFormState,
} from '../interfaces';
import { FORM_INIT_STATE } from '../FormContext';

test('field register action should update properly', () => {
  const action: TFieldAction = {
    type: FieldActionTypes.register,
    name: 'firstName',
    payload: 'Danny',
    meta: {
      defaultValue: 'Danny',
      required: true,
    },
  };

  const expectedResult: IFormState = {
    fields: {
      firstName: {
        dirty: false,
        defaultValue: 'Danny',
        required: true,
      },
    },
    values: {
      firstName: 'Danny',
    },
    meta: {
      submitting: false,
      errors: [],
    },
  };

  expect(reducer(action, FORM_INIT_STATE)).toEqual(expectedResult);
});

test('field onChange action should update properly', () => {
  const onChangeAction: TFieldAction = {
    type: FieldActionTypes.change,
    name: 'firstName',
    payload: '123',
  };

  const initState: IFormState = {
    fields: {
      firstName: {
        dirty: false,
        defaultValue: 'Danny',
      },
    },
    values: {
      firstName: 'Danny',
    },
    meta: {
      submitting: false,
      errors: [],
    },
  };

  const expectedResult: IFormState = {
    fields: {
      firstName: {
        dirty: true,
        defaultValue: 'Danny',
      },
    },
    values: {
      firstName: '123',
    },
    meta: {
      submitting: false,
      errors: [],
    },
  };

  expect(reducer(onChangeAction, initState)).toEqual(expectedResult);
});

test('field destroy action should remove form value, if destroyValueOnUnmount', () => {
  const action: TFieldAction = {
    type: FieldActionTypes.destroy,
    name: 'firstName',
    meta: {
      destroyValueOnUnmount: true,
    },
  };

  const initState: IFormState = {
    fields: {
      firstName: {
        dirty: false,
        defaultValue: 'Danny',
      },
    },
    values: {
      firstName: 'Danny',
    },
    meta: {
      submitting: false,
      errors: [],
    },
  };

  const expectedResult: IFormState = {
    fields: {},
    values: {},
    meta: {
      submitting: false,
      errors: [],
    },
  };

  expect(reducer(action, initState)).toEqual(expectedResult);
});

test('field destroy action should keep form value, if destroyValueOnUnmount is false', () => {
  const action: TFieldAction = {
    type: FieldActionTypes.destroy,
    name: 'firstName',
    meta: {
      destroyValueOnUnmount: false,
    },
  };

  const initState: IFormState = {
    fields: {
      firstName: {
        dirty: false,
        defaultValue: 'Danny',
      },
    },
    values: {
      firstName: 'Danny',
    },
    meta: {
      submitting: false,
      errors: [],
    },
  };

  const expectedResult: IFormState = {
    fields: {},
    values: {
      firstName: 'Danny',
    },
    meta: {
      submitting: false,
      errors: [],
    },
  };

  expect(reducer(action, initState)).toEqual(expectedResult);
});

test('field throwError action should update meta error', () => {
  const action: TFieldAction = {
    type: FieldActionTypes.throwError,
    name: 'firstName',
    payload: new Error('invalid name'),
  };

  const initState: IFormState = {
    fields: {
      firstName: {
        dirty: true,
        defaultValue: 'Danny',
      },
    },
    values: {
      firstName: '123',
    },
    meta: {
      submitting: false,
      errors: [],
    },
  };

  const expectedResult: IFormState = {
    fields: {
      firstName: {
        dirty: true,
        defaultValue: 'Danny',
        error: new Error('invalid name'),
      },
    },
    values: {
      firstName: '123',
    },
    meta: {
      submitting: false,
      errors: [],
    },
  };

  expect(reducer(action, initState)).toEqual(expectedResult);
});

test('form reset action should reset to default value', () => {
  const action: TFormAction = {
    type: FormActionTypes.reset,
  };

  const initState: IFormState = {
    fields: {
      firstName: {
        dirty: true,
        defaultValue: 'Danny',
        error: new Error('invalid name'),
      },
    },
    values: {
      firstName: '123',
    },
    meta: {
      submitting: false,
      errors: [],
    },
  };

  const expectedResult: IFormState = {
    fields: {
      firstName: {
        dirty: false,
        defaultValue: 'Danny',
      },
    },
    values: {
      firstName: 'Danny',
    },
    meta: {
      submitting: false,
      errors: [],
    },
  };

  expect(reducer(action, initState)).toEqual(expectedResult);
});
