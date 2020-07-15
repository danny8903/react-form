import {
  asyncVerifyField,
  verifyRequiredField,
  verifyForm,
} from '../verificationHelpers';
import { IFormState } from '../interfaces';

import { sleep } from './utils';

test('asyncVerifyField should return error', async () => {
  const wordRegx = /[a-zA-Z]+/g;
  const validator = async (v: string) => {
    await sleep(200);
    if (!wordRegx.test(v)) return new Error('invalid input');
  };

  expect(await asyncVerifyField('name', '123')).toBeUndefined();
  expect(await asyncVerifyField('name', '123', true)).toBeUndefined();
  expect(await asyncVerifyField('name', '123', true, validator)).toEqual(
    new Error('invalid input')
  );
  expect(await asyncVerifyField('name', '123', false, validator)).toEqual(
    new Error('invalid input')
  );
});

test('verifyRequiredField should return error', async () => {
  expect(verifyRequiredField('name', '123')).toBeUndefined();
  expect(verifyRequiredField('name', '', false)).toBeUndefined();
  expect(verifyRequiredField('name', '123', true)).toBeUndefined();
  expect(verifyRequiredField('name', '', true)).toEqual(
    new Error('name is required')
  );
});

test('verifyForm should should update meta error', async () => {
  const initState: IFormState = {
    fields: {
      firstName: {
        dirty: false,
        defaultValue: '',
        required: true,
      },
      lastName: {
        dirty: false,
        defaultValue: '',
        required: false,
      },
    },
    values: {
      firstName: '',
      lastName: '',
    },
    meta: {
      submitting: false,
      dirty: false,
      errors: [],
    },
  };

  const expectedResult = {
    fields: {
      firstName: {
        dirty: false,
        defaultValue: '',
        required: true,
        error: new Error('firstName is required'),
      },
      lastName: {
        dirty: false,
        defaultValue: '',
        required: false,
      },
    },
    values: {
      firstName: '',
      lastName: '',
    },
    meta: {
      submitting: false,
      dirty: false,
      errors: [new Error('firstName is required')],
    },
  };

  expect(verifyForm(initState)).toEqual(expectedResult);
});
