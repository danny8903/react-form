import React, { useState } from 'react';
import {
  render,
  waitFor,
  fireEvent,
  screen,
  cleanup,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Form } from '../Form';
import { FormValues } from '../FormValues';

import { TextField } from './TextField';

import { sleep } from './utils';

describe('test use filed', () => {
  let onSubmit: any;
  let formValuesCallback: any;

  beforeEach(() => {
    onSubmit = jest.fn().mockImplementation(() => sleep(500));
    formValuesCallback = jest.fn().mockImplementation((v) => null);
  });

  afterEach(cleanup);

  test('field default value', () => {
    render(
      <Form onSubmit={onSubmit}>
        <div>
          <TextField name="fname" defaultValue="first name" />
          <TextField name="lname" defaultValue="last name" />
          <FormValues>{formValuesCallback}</FormValues>
          <button type="submit" data-testid="submit">
            submit
          </button>
        </div>
      </Form>
    );
    expect(formValuesCallback).toHaveBeenLastCalledWith({
      fname: 'first name',
      lname: 'last name',
    });
  });

  test('onChange should trigger field require check', async () => {
    const fnameMetaCallback = jest.fn().mockImplementation((m) => {});
    const lnameMetaCallback = jest.fn().mockImplementation((m) => {});
    render(
      <Form onSubmit={onSubmit}>
        <div>
          <TextField
            name="fname"
            metaCallback={fnameMetaCallback}
            defaultValue="first"
          />
          <TextField
            name="lname"
            metaCallback={lnameMetaCallback}
            required
            defaultValue="last"
          />
          <FormValues>{formValuesCallback}</FormValues>
          <button type="submit" data-testid="submit">
            submit
          </button>
        </div>
      </Form>
    );

    // first render from default setState
    // second render from rxjs
    expect(lnameMetaCallback).toHaveBeenCalledTimes(2);
    expect(fnameMetaCallback).toHaveBeenCalledTimes(2);
    expect(formValuesCallback).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByTestId('lname'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByTestId('fname'), {
      target: { value: '' },
    });

    expect(lnameMetaCallback).toHaveBeenCalledTimes(3);
    expect(fnameMetaCallback).toHaveBeenCalledTimes(3);
    expect(formValuesCallback).toHaveBeenCalledTimes(3);

    await waitFor(() => {
      expect(lnameMetaCallback).toHaveBeenCalledTimes(4);
    });
    expect(fnameMetaCallback).toHaveBeenLastCalledWith({
      required: false,
      defaultValue: 'first',
      dirty: true,
    });
    expect(lnameMetaCallback).toHaveBeenLastCalledWith({
      required: true,
      defaultValue: 'last',
      dirty: true,
      error: new Error('lname is required'),
    });
    expect(formValuesCallback).toHaveBeenCalledTimes(3);
  });

  test('onSubmit should trigger field require check', async () => {
    const fnameMetaCallback = jest.fn().mockImplementation((m) => {});
    const lnameMetaCallback = jest.fn().mockImplementation((m) => {});
    render(
      <Form onSubmit={onSubmit}>
        <div>
          <TextField
            name="fname"
            metaCallback={fnameMetaCallback}
            defaultValue=""
          />
          <TextField
            name="lname"
            metaCallback={lnameMetaCallback}
            required
            defaultValue=""
          />
          <FormValues>{formValuesCallback}</FormValues>
          <button type="submit" data-testid="submit">
            submit
          </button>
        </div>
      </Form>
    );

    // first render from default setState
    // second render from rxjs
    expect(lnameMetaCallback).toHaveBeenCalledTimes(2);
    expect(fnameMetaCallback).toHaveBeenCalledTimes(2);
    expect(formValuesCallback).toHaveBeenCalledTimes(1);

    userEvent.click(screen.getByTestId('submit'));

    await waitFor(() => {
      expect(lnameMetaCallback).toHaveBeenCalledTimes(3);
    });
    expect(fnameMetaCallback).toHaveBeenLastCalledWith({
      required: false,
      defaultValue: '',
      dirty: false,
    });
    expect(lnameMetaCallback).toHaveBeenLastCalledWith({
      required: true,
      defaultValue: '',
      dirty: false,
      error: new Error('lname is required'),
    });
    expect(formValuesCallback).toHaveBeenCalledTimes(1);
    await sleep(3000);
  });

  test('field destroyValueOnUnmount should destroy value', () => {
    const fnameMetaCallback = jest.fn().mockImplementation((m) => {});
    const lnameMetaCallback = jest.fn().mockImplementation((m) => {});
    const StepForm = () => {
      const [step, setStep] = useState(0);
      return (
        <Form onSubmit={onSubmit}>
          {step === 0 && (
            <TextField
              name="fname"
              metaCallback={fnameMetaCallback}
              destroyValueOnUnmount
              defaultValue=""
            />
          )}
          {step === 1 && (
            <TextField
              name="lname"
              metaCallback={lnameMetaCallback}
              required
              defaultValue=""
            />
          )}
          <div>
            <FormValues>{formValuesCallback}</FormValues>
            <button
              type="button"
              data-testid="next"
              onClick={() => {
                setStep((step + 1) % 2);
              }}
            >
              next
            </button>
          </div>
        </Form>
      );
    };

    render(<StepForm />);

    expect(lnameMetaCallback).toHaveBeenCalledTimes(0);
    expect(fnameMetaCallback).toHaveBeenCalledTimes(2);
    expect(formValuesCallback).toHaveBeenCalledTimes(1);

    expect(fnameMetaCallback).toHaveBeenLastCalledWith({
      required: false,
      defaultValue: '',
      dirty: false,
    });
    expect(formValuesCallback).toHaveBeenLastCalledWith({
      fname: '',
    });
    fireEvent.click(screen.getByTestId('next'));
    expect(lnameMetaCallback).toHaveBeenCalledTimes(2);
    expect(fnameMetaCallback).toHaveBeenCalledTimes(2);
    expect(formValuesCallback).toHaveBeenLastCalledWith({
      lname: '',
    });

    fireEvent.click(screen.getByTestId('next'));
    expect(formValuesCallback).toHaveBeenLastCalledWith({
      lname: '',
      fname: '',
    });
  });

  test('field validator should raise error', async () => {
    const fnameMetaCallback = jest.fn().mockImplementation((m) => {});
    const lnameMetaCallback = jest.fn().mockImplementation((m) => {});
    const validate = jest.fn().mockImplementation(async (v) => {
      await sleep(500);
      const pass = /[a-zA-Z]+/.test(v);
      if (!pass) return new Error('invalid character');
    });
    render(
      <Form onSubmit={onSubmit}>
        <div>
          <TextField
            name="fname"
            metaCallback={fnameMetaCallback}
            validate={validate}
            defaultValue=""
          />
          <TextField
            name="lname"
            metaCallback={lnameMetaCallback}
            required
            validate={validate}
            defaultValue=""
          />
          <FormValues>{formValuesCallback}</FormValues>
          <button type="submit" data-testid="submit">
            submit
          </button>
        </div>
      </Form>
    );

    expect(fnameMetaCallback).toHaveBeenCalledTimes(2);
    expect(lnameMetaCallback).toHaveBeenCalledTimes(2);
    expect(fnameMetaCallback).toHaveBeenLastCalledWith({
      required: false,
      defaultValue: '',
      dirty: false,
    });
    expect(lnameMetaCallback).toHaveBeenLastCalledWith({
      required: true,
      defaultValue: '',
      dirty: false,
    });

    fireEvent.change(screen.getByTestId('fname'), {
      target: { value: '123' },
    });

    expect(fnameMetaCallback).toHaveBeenCalledTimes(3);
    expect(fnameMetaCallback).toHaveBeenLastCalledWith({
      required: false,
      defaultValue: '',
      dirty: true,
    });
    expect(formValuesCallback).toHaveBeenLastCalledWith({
      fname: '123',
      lname: '',
    });

    await waitFor(() => {
      expect(fnameMetaCallback).toHaveBeenCalledTimes(4);
    });

    expect(fnameMetaCallback).toHaveBeenLastCalledWith({
      required: false,
      defaultValue: '',
      dirty: true,
      error: new Error('invalid character'),
    });
    expect(formValuesCallback).toHaveBeenLastCalledWith({
      fname: '123',
      lname: '',
    });
  });
});
