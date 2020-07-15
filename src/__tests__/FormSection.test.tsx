import React, { useContext } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';

import { useField } from '../useField';
import { Form } from '../Form';
import { FormValues } from '../FormValues';
import { FormSection } from '../FormSection';
import { FormContext } from '../FormContext';

import { TextField } from './TextField';

const ResetButton = () => {
  const { resetForm } = useContext(FormContext);
  return (
    <button data-testid="reset" onClick={resetForm}>
      reset
    </button>
  );
};

describe('test FormSection', () => {
  let onSubmit: any;
  let formValuesCallback: any;
  beforeEach(() => {
    onSubmit = jest.fn();
    formValuesCallback = jest.fn().mockImplementation((v) => null);

    render(
      <Form onSubmit={onSubmit}>
        <div>
          <FormSection name="user">
            <TextField name="fname" />
            <TextField name="lname" />
          </FormSection>

          <FormValues>{formValuesCallback}</FormValues>
          <button type="submit" data-testid="submit">
            submit
          </button>

          <ResetButton />
        </div>
      </Form>
    );
  });

  test('FormSection should create correct structure', () => {
    expect(formValuesCallback).toHaveBeenLastCalledWith({
      user: {
        fname: '',
        lname: '',
      },
    });
  });

  test('FormSection should reset to correct structure', () => {
    expect(formValuesCallback).toHaveBeenLastCalledWith({
      user: {
        fname: '',
        lname: '',
      },
    });

    fireEvent.change(screen.getByTestId('fname'), {
      target: { value: 'first name' },
    });
    fireEvent.change(screen.getByTestId('lname'), {
      target: { value: 'last name' },
    });

    expect(formValuesCallback).toHaveBeenLastCalledWith({
      user: {
        fname: 'first name',
        lname: 'last name',
      },
    });
    fireEvent.click(screen.getByTestId('reset'));
    expect(formValuesCallback).toHaveBeenLastCalledWith({
      user: {
        fname: '',
        lname: '',
      },
    });
  });
});
