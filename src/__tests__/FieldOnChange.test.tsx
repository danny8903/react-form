import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Form } from '../Form';
import { FieldOnChange } from '../FieldOnChange';
import { FieldActionTypes } from '../interfaces';
import { FormValues } from '../FormValues';

import { TextField } from './TextField';
import { sleep } from './utils';

describe('test FieldOnChange', () => {
  let onSubmit: any;
  let FieldOnChangeCallback: any;
  let formValuesCallback: any;

  beforeEach(() => {
    onSubmit = jest.fn().mockImplementation((v) => sleep(500));
    FieldOnChangeCallback = jest.fn().mockImplementation((props) => null);
    formValuesCallback = jest.fn().mockImplementation((v) => null);
  });

  describe('test action and form value', () => {
    test('form action and value should be dispatched properly', async () => {
      render(
        <Form onSubmit={onSubmit}>
          <div>
            <TextField name="fname" defaultValue="first name" />
            <TextField name="lname" defaultValue="last name" />
            <FieldOnChange>{FieldOnChangeCallback}</FieldOnChange>
            <button type="submit" data-testid="submit">
              submit
            </button>
          </div>
        </Form>
      );

      fireEvent.change(screen.getByTestId('fname'), {
        target: { value: 'first' },
      });
      expect(FieldOnChangeCallback).toHaveBeenLastCalledWith({
        action: {
          name: 'fname',
          meta: {},
          type: FieldActionTypes.change,
          payload: 'first',
        },
        formValues: {
          fname: 'first',
          lname: 'last name',
        },
        updateFormValues: expect.anything(),
      });
      expect(FieldOnChangeCallback).toHaveBeenCalledTimes(1);

      fireEvent.change(screen.getByTestId('lname'), {
        target: { value: 'last' },
      });
      expect(FieldOnChangeCallback).toHaveBeenLastCalledWith({
        action: {
          name: 'lname',
          type: FieldActionTypes.change,
          payload: 'last',
          meta: {},
        },
        formValues: {
          fname: 'first',
          lname: 'last',
        },
        updateFormValues: expect.anything(),
      });
      expect(FieldOnChangeCallback).toHaveBeenCalledTimes(2);

      userEvent.click(screen.getByTestId('submit'));
      expect(FieldOnChangeCallback).toHaveBeenCalledTimes(2);
    });
  });

  describe('test formUpdate function', () => {
    test('formUpdate should update form values', async () => {
      render(
        <Form onSubmit={onSubmit}>
          <div>
            <TextField name="fname" defaultValue="first name" />
            <TextField name="lname" defaultValue="last name" />
            <FormValues>{formValuesCallback}</FormValues>
            <FieldOnChange>
              {({ action, formValues, updateFormValues }) => {
                FieldOnChangeCallback(action, formValues);
                if (action.name === 'lname') {
                  updateFormValues([{ path: 'fname', value: 'last' }]);
                }
              }}
            </FieldOnChange>
            <button type="submit" data-testid="submit">
              submit
            </button>
          </div>
        </Form>
      );

      fireEvent.change(screen.getByTestId('fname'), {
        target: { value: 'first' },
      });
      expect(formValuesCallback).toHaveBeenLastCalledWith({
        fname: 'first',
        lname: 'last name',
      });
      expect(FieldOnChangeCallback).toHaveBeenCalledTimes(1);

      fireEvent.change(screen.getByTestId('lname'), {
        target: { value: 'last' },
      });
      expect(formValuesCallback).toHaveBeenLastCalledWith({
        fname: 'last',
        lname: 'last',
      });
      expect(FieldOnChangeCallback).toHaveBeenCalledTimes(2);
    });

    test('formUpdate should trigger validate', async () => {
      const fnameMetaCallback = jest.fn().mockImplementation((m) => {});

      render(
        <Form onSubmit={onSubmit}>
          <div>
            <TextField
              name="fname"
              metaCallback={fnameMetaCallback}
              defaultValue="first name"
              required
            />
            <TextField name="lname" defaultValue="last name" required />
            <FormValues>{formValuesCallback}</FormValues>
            <FieldOnChange>
              {({ action, formValues, updateFormValues }) => {
                FieldOnChangeCallback(action, formValues);
                if (action.name === 'lname') {
                  updateFormValues([{ path: 'fname', value: '' }]);
                }
              }}
            </FieldOnChange>
            <button type="submit" data-testid="submit">
              submit
            </button>
          </div>
        </Form>
      );

      expect(fnameMetaCallback).toHaveBeenCalledTimes(2);
      expect(fnameMetaCallback).toHaveBeenLastCalledWith({
        required: true,
        dirty: false,
        defaultValue: 'first name',
      });
      fireEvent.change(screen.getByTestId('lname'), {
        target: { value: 'last' },
      });
      expect(formValuesCallback).toHaveBeenLastCalledWith({
        fname: '',
        lname: 'last',
      });
      expect(fnameMetaCallback).toHaveBeenCalledTimes(3);
      expect(FieldOnChangeCallback).toHaveBeenCalledTimes(1);
      expect(fnameMetaCallback).toHaveBeenLastCalledWith({
        required: true,
        dirty: true,
        defaultValue: 'first name',
      });

      await waitFor(() => {
        expect(fnameMetaCallback).toHaveBeenCalledTimes(4);
      });
      expect(fnameMetaCallback).toHaveBeenLastCalledWith({
        required: true,
        dirty: true,
        defaultValue: 'first name',
        error: new Error('fname is required'),
      });
    });
  });
});
