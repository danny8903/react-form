import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';

import { Form } from '../Form';
import { FormValues } from '../FormValues';

import { TextField } from './TextField';

describe('test FormValues', () => {
  let onSubmit: any;
  let formValuesCallback: any;

  beforeEach(() => {
    onSubmit = jest.fn();
    formValuesCallback = jest.fn().mockImplementation((v) => null);
  });

  describe('without filter', () => {
    test('form value should be registered properly', () => {
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
      expect(formValuesCallback).toHaveBeenCalledTimes(1);

      fireEvent.change(screen.getByTestId('fname'), {
        target: { value: 'first' },
      });
      expect(formValuesCallback).toHaveBeenLastCalledWith({
        fname: 'first',
        lname: 'last name',
      });
      expect(formValuesCallback).toHaveBeenCalledTimes(2);

      fireEvent.change(screen.getByTestId('lname'), {
        target: { value: 'last' },
      });
      expect(formValuesCallback).toHaveBeenLastCalledWith({
        fname: 'first',
        lname: 'last',
      });
      expect(formValuesCallback).toHaveBeenCalledTimes(3);
    });
  });

  describe('with filter', () => {
    test('form value should be registered properly', () => {
      render(
        <Form onSubmit={onSubmit}>
          <div>
            <TextField name="fname" defaultValue="first name" />
            <TextField name="lname" defaultValue="last name" />
            <FormValues filter={(next, prev) => next.fname !== prev.fname}>
              {formValuesCallback}
            </FormValues>
            <button type="submit" data-testid="submit">
              submit
            </button>
          </div>
        </Form>
      );
      // register of last name should be ignore
      expect(formValuesCallback).toHaveBeenLastCalledWith({
        fname: 'first name',
      });
      expect(formValuesCallback).toHaveBeenCalledTimes(1);

      fireEvent.change(screen.getByTestId('fname'), {
        target: { value: 'first' },
      });
      expect(formValuesCallback).toHaveBeenLastCalledWith({
        fname: 'first',
        lname: 'last name',
      });
      expect(formValuesCallback).toHaveBeenCalledTimes(2);

      // change of last name should be ignore
      fireEvent.change(screen.getByTestId('lname'), {
        target: { value: 'last' },
      });
      expect(formValuesCallback).toHaveBeenLastCalledWith({
        fname: 'first',
        lname: 'last name',
      });
      expect(formValuesCallback).toHaveBeenCalledTimes(2);
    });
  });
});
