import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";

const OTPLogin = () => {
  const [email, setEmail] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setError("Invalid Email Address");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setShowOtpInput(true);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to send OTP");
      }
    } catch (error) {
      setError("Failed to send OTP");
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleEmailSubmit(e);
  };

  const onOtpSubmit = async (otp) => {
    try {
      const response = await fetch("http://localhost:4000/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        console.log("Login Successful");
        alert("Login Successful");
      } else {
        setError("Invalid OTP");
      }
    } catch (error) {
      setError("Failed to verify OTP");
    }
  };

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  return (
    <Container maxWidth="sm">
      <Box mt={4} p={3} boxShadow={3} borderRadius={2}>
        {!showOtpInput ? (
          <form onSubmit={handleEmailSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onKeyDown={handleKeyDown}
                  inputRef={inputRef}
                  placeholder="Enter Email Address"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                        >
                          Get OTP
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  error={!!error}
                  helperText={error}
                />
              </Grid>
            </Grid>
          </form>
        ) : (
          <Box>
            <Typography variant="body1">Enter OTP sent to {email}</Typography>
            <OtpInput onOtpSubmit={onOtpSubmit} />
          </Box>
        )}
      </Box>
    </Container>
  );
};

const OtpInput = ({ length = 4, onOtpSubmit }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const [verificationMessage, setVerificationMessage] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleOnChange = (e, index) => {
    const newOtp = [...otp];
    newOtp[index] = e.target.value.slice(-1);

    setOtp(newOtp);

    // Move to the next input if the current field is filled
    if (e.target.value && index < length - 1 && inputRefs.current[index + 1]) {
      let nextIndex = index + 1;
      while (nextIndex < length && newOtp[nextIndex]) {
        nextIndex++;
      }

      if (nextIndex < length && inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move focus to the previous input field on backspace
      e.preventDefault();
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOnClick = (index) => {
    // Select the text inside the input
    inputRefs.current[index].select();

    // Focus on the previous empty field (if any)
    if (index > 0 && !otp[index - 1]) {
      inputRefs.current[otp.indexOf("")].focus();
    }
  };

  const handleVerifyOtp = () => {
    const combinedOtp = otp.join("");
    onOtpSubmit(combinedOtp)
      .then((message) => setVerificationMessage(message))
      .catch((error) => setVerificationMessage(error.message));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="center" mb={2}>
        {otp.map((value, index) => (
          <React.Fragment key={index}>
            <TextField
              type="text"
              value={value}
              inputRef={(input) => (inputRefs.current[index] = input)}
              onChange={(e) => handleOnChange(e, index)}
              onClick={() => handleOnClick(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              inputProps={{ maxLength: 1, style: { textAlign: "center" } }}
              variant="outlined"
              margin="normal"
            />
          </React.Fragment>
        ))}
      </Box>
      <Button variant="contained" color="primary" onClick={handleVerifyOtp}>
        Verify OTP
      </Button>
      {verificationMessage && (
        <Typography variant="body1" color="textSecondary" mt={2}>
          {verificationMessage}
        </Typography>
      )}
    </Box>
  );
};

// Define prop types for OtpInput component
OtpInput.propTypes = {
  length: PropTypes.number,
  onOtpSubmit: PropTypes.func.isRequired,
};

export default OTPLogin;
