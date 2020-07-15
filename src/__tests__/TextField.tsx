import React from 'react';
import { useField } from '../useField';
import { IFieldMeta, TFieldValidator } from '../interfaces';

type props = {
  name: string;
  required?: boolean;
  defaultValue?: any;
  destroyValueOnUnmount?: boolean;
  validate?: TFieldValidator;
  metaCallback?: (m: IFieldMeta, v?: any) => void;
};

export const TextField = ({
  name = '',
  required = false,
  validate,
  defaultValue = '',
  metaCallback,
  destroyValueOnUnmount = false,
}: props) => {
  const { value, onChange, meta } = useField({
    name,
    required,
    defaultValue,
    validate,
    destroyValueOnUnmount,
  });
  if (metaCallback) {
    metaCallback(meta);
  }
  return (
    <label>
      {name}
      <input
        type="text"
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        data-testid={name}
      ></input>
    </label>
  );
};
