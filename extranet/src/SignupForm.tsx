import { Button, Container, Grid, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { useForm } from 'react-hook-form';


interface FormData {
  username: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  gender: string;
  password: string;
  phoneNumber: string;
  bloodGroup: string;
  lastDonationDate: string;
  donationType: string;
}

const useStyles = makeStyles({
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
    },
    imageContainer: {
      flexBasis: '50%',
    },
    image: {
      width: '100%',
      height: 'auto',
    },
    formContainer: {
      flexBasis: '50%',
      padding: '20px',
    },
  });
  

const SignupForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const classes = useStyles();
  
  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('API_ENDPOINT_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Handle successful form submission
        console.log('Form submitted successfully!');
      } else {
        // Handle error response
        console.error('Failed to submit the form.');
      }
    } catch (error) {
      // Handle network or other errors
      console.error('An error occurred while submitting the form:', error);
    }
  };

  return (
    <Container maxWidth="md" className={classes.container}>
    <div className={classes.imageContainer}>
      <img
        src="your_image_url.jpg"
        alt="logo"
        className={classes.image}
      />
    </div>
    <div className={classes.formContainer}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Username"
              {...register('username', { required: true })}
              error={Boolean(errors.username)}
              helperText={errors.username ? 'Username is required' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="First Name"
              {...register('firstName', { required: true })}
              error={Boolean(errors.firstName)}
              helperText={errors.firstName ? 'First Name is required' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Last Name"
              {...register('lastName', { required: true })}
              error={Boolean(errors.lastName)}
              helperText={errors.lastName ? 'Last Name is required' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="date"
              label="Birth Date"
              {...register('birthDate', { required: true })}
              error={Boolean(errors.birthDate)}
              helperText={errors.birthDate ? 'Birth Date is required' : ''}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              {...register('email', { required: true })}
              error={Boolean(errors.email)}
              helperText={errors.email ? 'Email is required' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Gender"
              {...register('gender', { required: true })}
              error={Boolean(errors.gender)}
              helperText={errors.gender ? 'Gender is required' : ''}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="password"
              label="Password"
              {...register('password', { required: true })}
              error={Boolean(errors.password)}
              helperText={errors.password ? 'Password is required' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone Number"
              {...register('phoneNumber', { required: true })}
              error={Boolean(errors.phoneNumber)}
              helperText={errors.phoneNumber ? 'Phone Number is required' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Blood Group"
              {...register('bloodGroup', { required: true })}
              error={Boolean(errors.bloodGroup)}
              helperText={errors.bloodGroup ? 'Blood Group is required' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="date"
              label="Last Donation Date"
              {...register('lastDonationDate', { required: true })}
              error={Boolean(errors.lastDonationDate)}
              helperText={
                errors.lastDonationDate
                  ? 'Last Donation Date is required'
                  : ''
              }
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Donation Type"
              {...register('donationType', { required: true })}
              error={Boolean(errors.donationType)}
              helperText={
                errors.donationType ? 'Donation Type is required' : ''
              }
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
      </div>
    </Container>
  );
};

export default SignupForm;
