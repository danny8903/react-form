## Introduction

This React Form component helps you:

- Maintain Form state
- Debounced field validation
- Validate field asynchronously
- Handle form submission
- prevent multiple form submission
- Reduce field re-render by detecting if field value changes
  <br><br>

## Installation

> npm install --save @danny-ui/react-form

<br><br>

## Usage

```jsx static
import { Form, useField } from '@danny-ui/react-form';

function TextField({ name = '', required = false, defaultValue = '' }) {
  const { value, onChange, meta } = useField({
    name,
    required,
    defaultValue,
  });

  return <input onChange={(ev) => onChange(ev.target.value)} value={value} />;
}

<Form
  onSubmit={(value) => {
    window.alert(JSON.stringify(value));
  }}
>
  <TextField required label="First Name" name="firstName" />
  <TextField required label="Last Name" name="lastName" />
  <button type="submit">Submit</button>
</Form>;
```

<br><br>

## Examples

Please check examples [here](http://danny-ui-form.surge.sh).

<br><br>

## API

### _Form Properties_

| Name           | Type   | Description                                                                                                                                                                                                    |
| -------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children\*     | node   | The content of the form, normally Field component with _useField_ hook.                                                                                                                                        |
| onSubmit\*     | func   | Callback fired when the form is submitted. <br> <br> **Signature:** <br> `function(value: object, meta: object) => Promise` <br> Return value of onSubmit function will be passed to success callback <br><br> |
| success        | func   | Callback fired when onSubmit function is resolved. <br> <br> **Signature:** <br> `function(submitReturn: any, value: object) => Promise`                                                                       |
| failed         | func   | Callback fired when onSubmit function is rejected. <br> <br> **Signature:** <br> `function(errors: [Error], value: object) => void`                                                                            |
| beforeSubmit   | func   | Callback fired before onSubmit function is called. <br> <br> **Signature:** <br> `function(values: object, meta: object) => Promise`                                                                           |
| extendFormMeta | func   | Callback fired after an action updated form state. The return object will be merged into form meta <br> <br> **Signature:** <br> `function(state: object) => object` <br>                                      |
| className      | string | css apply to form                                                                                                                                                                                              |

<br>

### _useField Properties_

| Name                  | Type   | Description                                                                                                 |
| --------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| name\*                | string | key to lookup form value                                                                                    |
| defaultValue\*        | any    | default field value                                                                                         |
| required              | bool   | if _true_, field onChange action and form onSubmit will check if this field value is empty                  |
| displayName           | string | use with required props, and display the error message as \``${displayName} is required`\`                  |
| destroyValueOnUnmount | bool   | When field unmount, determine whether to destroy the field value or not                                     |
| validate              | func   | Callback fired when field value changed. <br> <br> **Signature:** <br> `function(value: object) => Promise` |

<br>

### _FormValues Properties_

| Name       | Type | Description                                                                                                                                                                                                                  |
| ---------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children\* | func | It exposes the formValue and it is normally used for linked fields. <br> <br> **Signature:** <br> `function(value: object) => node`                                                                                          |
| filter     | func | It is used to improve performance. You can use it to control if the children function should be called. Similar to react _shouldComponentUpdate_ life circle <br> <br> **Signature:** <br> `function(value: object) => bool` |

<br>

### _FieldOnChange Properties_

| Name       | Type | Description                                                                                                                                                                                                                                                                      |
| ---------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children\* | func | It can detect field onChange action and you can use it to update associated fields. <br> <br> **Signature:** <br> `function(props: object) => void` <br> _props:_ an object type of {action, formValues, updateFormValues: (changes: {path: string, value: any}[]) => void} <br> |

<br>

### _FormMeta Properties_

| Name       | Type | Description                                                                                                                                                       |
| ---------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children\* | func | It exposes the form meta and provides the current form state. It is normally used for buttons. <br> <br> **Signature:** <br> `function(formMeta: object) => node` |

<br><br>

## License

[MIT License](http://opensource.org/licenses/mit-license.html).
<br><br>
