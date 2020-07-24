import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import MuiTextField from '@material-ui/core/TextField';

import { Form, useField } from '@danny-qu/form';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function TextField({
  name = '',
  required = false,
  validate,
  defaultValue = '',
  destroyValueOnUnmount = false,
  label = '',
  type,
}) {
  const { value, onChange, meta } = useField({
    name,
    required,
    defaultValue,
    validate,
    destroyValueOnUnmount,
  });

  return (
    <MuiTextField
      label={label}
      type={type}
      name={name}
      fullWidth
      variant="outlined"
      error={Boolean(meta.error)}
      helperText={meta.error ? meta.error.message : ''}
      value={value}
      onChange={(ev) => onChange(ev.target.value)}
    />
  );
}

export function SignUpForm() {
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}></Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>

        <Form
          className={classes.form}
          onSubmit={(value) => {
            window.alert(JSON.stringify(value));
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField name="firstName" required label="First Name" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField required label="Last Name" name="lastName" />
            </Grid>
            <Grid item xs={12}>
              <TextField required label="Email Address" name="email" />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                name="password"
                label="Password"
                type="password"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox value="termsAndConditions" color="primary" />
                }
                label="Please confirm that you agree our our terms & conditions"
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign Up
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link href="#" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Form>
      </div>
    </Container>
  );
}
