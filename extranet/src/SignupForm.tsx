import { Box, Button, Container, Grid, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useForm } from 'react-hook-form';
import React, { useState } from 'react';

// TO-DO : react-query
interface FormData {
  username: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  gender: string;
  password: string;
  passwordConfirmation: string;
  phoneNumber: string;
  bloodGroup: string;
  lastDonationDate: string;
  donationType: string;
}

const useStyles = makeStyles({
  formWrapper: {
    background: '#EDE4FF', 
    borderRadius: '20px',
    padding: '20px',
    marginTop: '20px',
    width: '70%'
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  imageContainer: {
    flexBasis: '100%',
  },
  image: {
    width: '100%',
    height: 'auto',
  },
   formContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }, 
  bar: {
    height: '4px',
    width: '55px',
    display: 'block',
    margin: '8px auto 0',
    backgroundColor: '#6528F7',
  },
  button: {
    background: 'linear-gradient(90deg, rgba(118,5,186,1) 29%, rgba(159,7,204,1) 61%)',
    borderRadius: '10px',
    padding: '10px 20px',
    fontSize: '16px',
    border: 'none',
    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
});
  

const SignupForm: React.FC = () => {
  const { container, imageContainer, image, formContainer, bar, button, formWrapper } = useStyles();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>();

  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const onChange = (e) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setPhoneNumber(e.target.value);
    }
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || "Please enter a valid email address.";
  };

  const validatePasswordConfirmation = (value) => {
    const password = getValues('password'); // Get the value of the password field
    return password === value || 'Passwords do not match'; // Compare with the confirmation password field
  };

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
        setIsFormSubmitted(true);
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
    <Container maxWidth="md" className={container}>
      <div className={imageContainer}>
        <img
          src="your_image_url.jpg"
          alt="logo"
          className={image}
        />
      </div>
      <div className={formContainer}>
      <Box className={formWrapper}>
        <Typography variant="h3" align="center" gutterBottom>
            Sign Up
            <span className={bar}></span>
        </Typography>
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
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                {...register('firstName', { required: true })}
                error={Boolean(errors.firstName)}
                helperText={errors.firstName ? 'First Name is required' : ''}
              />
            </Grid>
            <Grid item xs={6}>
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
                label="Email"
                {...register('email', {
                  required: 'Email is required',
                  validate: validateEmail
                })}
                error={Boolean(errors.email)}
                helperText={errors.email?.message || ''}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="password"
                label="Password"
                {...register('password', { required: true})}
                error={Boolean(errors.password)}
                helperText={errors.password ? 'Password is required' : ''}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="password"
                label="Password Confirmation"
                {...register('passwordConfirmation', { 
                  required: true, 
                  validate: validatePasswordConfirmation
                })}
                error={Boolean(errors.passwordConfirmation)}
                helperText={errors.passwordConfirmation ? errors.passwordConfirmation.message : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                {...register('phoneNumber', { required: true })}
                value={phoneNumber}
                onChange={onChange}
                error={Boolean(errors.phoneNumber)}
                helperText={errors.phoneNumber ? 'Please enter a valid phone number' : ''}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Blood Group"
                {...register('bloodGroup', { required: true })}
                error={Boolean(errors.bloodGroup)}
                helperText={errors.bloodGroup ? 'Blood Group is required' : ''}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                select
                label="Donation Type"
                {...register('donationType', { required: true })}
                error={Boolean(errors.donationType)}
                helperText={errors.donationType ? 'Donation Type is required' : ''}
              >
                <option value="">Select a donation type</option>
                <option value="wholeBlood">Whole Blood Donation</option>
                <option value="powerRed">Power Red Donation</option>
                <option value="platelet">Platelet Donation</option>
                <option value="plasma">Plasma Donation</option>
              </TextField>
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
              <Button type="submit" color="primary" style={{ color: 'white' }} className={button}>
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </div>
  </Container>
  );
};

export default SignupForm;