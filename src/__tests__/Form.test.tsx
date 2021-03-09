import React from 'react';
import {
  render,
  waitFor,
  fireEvent,
  screen,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Form } from '../Form';
import { FormMeta } from '../FormMeta';

import { TextField } from './TextField';

import { sleep } from './utils';

describe('test form', () => {
  let onSubmit: any;
  let formMetaCallback: any;
  let success: any;
  let failed: any;
  let beforeSubmit: any;

  describe('test onSubmit', () => {
    beforeEach(() => {
      onSubmit = jest.fn().mockImplementation(() => sleep(200));
      formMetaCallback = jest.fn().mockImplementation((v) => null);
      success = jest.fn().mockImplementation((v) => null);
      failed = jest.fn().mockImplementation((v) => null);
      beforeSubmit = jest.fn().mockImplementation((v) => null);

      render(
        <Form
          onSubmit={onSubmit}
          success={success}
          failed={failed}
          beforeSubmit={beforeSubmit}
        >
          <div>
            <TextField name="fname" />
            <TextField name="lname" />
            <FormMeta>{formMetaCallback}</FormMeta>
            <button type="submit" data-testid="submit">
              submit
            </button>
          </div>
        </Form>
      );
    });

    test('onSubmit should be called with properly formValue', async () => {
      userEvent.click(screen.getByTestId('submit'));
      await waitFor(() => expect(onSubmit).toHaveBeenCalled());
      expect(onSubmit).toHaveBeenLastCalledWith(
        {
          fname: '',
          lname: '',
        },
        { errors: [], submitting: true }
      );
    });

    test('success should be called after onSubmit', async () => {
      userEvent.click(screen.getByTestId('submit'));

      expect(onSubmit).toHaveBeenCalledTimes(0);
      expect(success).toHaveBeenCalledTimes(0);
      await act(async () => {
        await sleep(300);
      });
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(success).toHaveBeenCalledTimes(1);
    });

    test('form should not submit twice if the first submit is not finished', async () => {
      userEvent.click(screen.getByTestId('submit'));
      userEvent.click(screen.getByTestId('submit'));

      expect(onSubmit).toHaveBeenCalledTimes(0);
      await act(async () => {
        await sleep(300);
      });
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    test('exhaustMap should not block form submit multi times', async () => {
      userEvent.click(screen.getByTestId('submit'));
      await act(async () => {
        await sleep(300);
      });
      expect(onSubmit).toHaveBeenCalledTimes(1);
      userEvent.click(screen.getByTestId('submit'));
      await act(async () => {
        await sleep(300);
      });
      expect(onSubmit).toHaveBeenCalledTimes(2);
    });
  });

  describe('test onsubmit failed', () => {
    beforeEach(() => {
      onSubmit = jest.fn().mockImplementation(async () => {
        await sleep(200);
        throw new Error('404');
      });
      formMetaCallback = jest.fn().mockImplementation((v) => null);
      success = jest.fn().mockImplementation((v) => null);
      failed = jest.fn().mockImplementation((v) => null);
      beforeSubmit = jest.fn().mockImplementation((v) => null);

      render(
        <Form
          onSubmit={onSubmit}
          success={success}
          failed={failed}
          beforeSubmit={beforeSubmit}
        >
          <div>
            <TextField name="fname" />
            <TextField name="lname" />
            <FormMeta>{formMetaCallback}</FormMeta>
            <button type="submit" data-testid="submit">
              submit
            </button>
          </div>
        </Form>
      );
    });
    test('failed submit should trigger error', async () => {
      expect(formMetaCallback).toHaveBeenCalledTimes(1);
      expect(formMetaCallback).toHaveBeenLastCalledWith({
        submitting: false,
        errors: [],
      });
      userEvent.click(screen.getByTestId('submit'));
      expect(formMetaCallback).toHaveBeenCalledTimes(2);
      expect(formMetaCallback).toHaveBeenLastCalledWith({
        submitting: true,
        errors: [],
      });
      expect(failed).toHaveBeenCalledTimes(0);
      await waitFor(() => expect(formMetaCallback).toHaveBeenCalledTimes(3));

      expect(formMetaCallback).toHaveBeenLastCalledWith({
        submitting: false,
        errors: [new Error('404')],
      });
      expect(failed).toHaveBeenCalledTimes(1);

      userEvent.click(screen.getByTestId('submit'));
      expect(formMetaCallback).toHaveBeenLastCalledWith({
        submitting: true,
        errors: [],
      });
      await waitFor(() => expect(formMetaCallback).toHaveBeenCalledTimes(5));
      expect(formMetaCallback).toHaveBeenLastCalledWith({
        submitting: false,
        errors: [new Error('404')],
      });
      expect(failed).toHaveBeenCalledTimes(2);
    });
  });

  describe('test beforeSubmit failed', () => {
    beforeEach(() => {
      onSubmit = jest.fn().mockImplementation(async () => {
        await sleep(200);
      });
      formMetaCallback = jest.fn().mockImplementation((v) => null);
      success = jest.fn().mockImplementation((v) => null);
      failed = jest.fn().mockImplementation((v) => null);
      beforeSubmit = jest.fn().mockImplementation(async (v) => {
        await sleep(200);
        throw new Error('failed before submit');
      });

      render(
        <Form
          onSubmit={onSubmit}
          success={success}
          failed={failed}
          beforeSubmit={beforeSubmit}
        >
          <div>
            <TextField name="fname" />
            <TextField name="lname" />
            <FormMeta>{formMetaCallback}</FormMeta>
            <button type="submit" data-testid="submit">
              submit
            </button>
          </div>
        </Form>
      );
    });
    test('failed before submit should trigger error', async () => {
      expect(formMetaCallback).toHaveBeenCalledTimes(1);
      expect(formMetaCallback).toHaveBeenLastCalledWith({
        submitting: false,
        errors: [],
      });
      userEvent.click(screen.getByTestId('submit'));
      expect(formMetaCallback).toHaveBeenCalledTimes(2);
      expect(formMetaCallback).toHaveBeenLastCalledWith({
        submitting: true,
        errors: [],
      });
      expect(failed).toHaveBeenCalledTimes(0);
      await waitFor(() => expect(formMetaCallback).toHaveBeenCalledTimes(3));

      expect(formMetaCallback).toHaveBeenLastCalledWith({
        submitting: false,
        errors: [new Error('failed before submit')],
      });
      expect(failed).toHaveBeenCalledTimes(1);
    });
  });
});
