import React from 'react';
import MuiSelect from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormHelperText from '@material-ui/core/FormHelperText';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import { Form, useField, FormValues } from '@danny-ui/react-form';

function SelectField({
  name = '',
  required = false,
  validate,
  defaultValue = '',
  destroyValueOnUnmount = false,
  label = '',
  options = [],
}) {
  const { value, onChange, path, meta } = useField({
    name,
    displayName: label,
    required,
    defaultValue,
    validate,
    destroyValueOnUnmount,
  });

  return (
    <FormControl
      variant="outlined"
      error={!!meta.error}
      style={{ minWidth: 120, width: '100%' }}
    >
      <InputLabel id={path}>{label}</InputLabel>
      <MuiSelect
        value={value}
        fullWidth
        onChange={(ev) => onChange(ev.target.value)}
        labelId={path}
        label={label}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {meta.error && <FormHelperText>{meta.error.message}</FormHelperText>}
    </FormControl>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export function FormValuesExample() {
  const classes = useStyles();

  const MOCK_COUNTRIES = [
    { value: 'nz', label: 'New Zealand' },
    { value: 'japan', label: 'Japan' },
  ];

  const MOCK_CITIES = [
    { value: 'auckland', label: 'Auckland', country: 'nz' },
    { value: 'wellington', label: 'Wellington', country: 'nz' },
    { value: 'tokyo', label: 'Tokyo', country: 'japan' },
    { value: 'osaka', label: 'Osaka', country: 'japan' },
  ];

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />

      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Search Products From
        </Typography>

        <Form
          className={classes.form}
          onSubmit={async (value) => {
            await new Promise((res) => setTimeout(res, 100));
            window.alert(JSON.stringify(value));
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <SelectField
                name="country"
                options={MOCK_COUNTRIES}
                required
                label="Country"
              />
            </Grid>
            <FormValues>
              {(values) => {
                const cityOptions = MOCK_CITIES.filter(
                  (city) => city.country === values.country
                );

                return (
                  <Grid item xs={12} sm={6}>
                    <SelectField
                      options={cityOptions}
                      required
                      label="City"
                      name="city"
                    />
                  </Grid>
                );
              }}
            </FormValues>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Search
          </Button>
        </Form>
      </div>
    </Container>
  );
}
