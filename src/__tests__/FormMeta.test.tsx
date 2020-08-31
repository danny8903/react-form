import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Form } from '../Form';
import { FormMeta } from '../FormMeta';

import { TextField } from './TextField';
import { sleep } from './utils';

describe('test FormMeta', () => {
  let onSubmit: any;
  let formMetaCallback: any;

  beforeEach(() => {
    onSubmit = jest.fn().mockImplementation((v) => sleep(500));
    formMetaCallback = jest.fn().mockImplementation((v) => null);
  });

  test.only('form meta should be updated properly', async () => {
    render(
      <Form onSubmit={onSubmit}>
        <div>
          <TextField name="fname" defaultValue="first name" />
          <TextField name="lname" defaultValue="last name" />
          <FormMeta>{formMetaCallback}</FormMeta>
          <button type="submit" data-testid="submit">
            submit
          </button>
        </div>
      </Form>
    );

    expect(formMetaCallback).toHaveBeenLastCalledWith({
      dirty: false,
      submitting: false,
      errors: [],
    });
    expect(formMetaCallback).toHaveBeenCalledTimes(1);

    userEvent.click(screen.getByTestId('submit'));
    expect(formMetaCallback).toHaveBeenLastCalledWith({
      dirty: false,
      submitting: true,
      errors: [],
    });
    expect(formMetaCallback).toHaveBeenCalledTimes(2);

    await waitFor(() => expect(formMetaCallback).toHaveBeenCalledTimes(3));

    expect(formMetaCallback).toHaveBeenLastCalledWith({
      dirty: false,
      submitting: false,
      errors: [],
    });
  });
});
