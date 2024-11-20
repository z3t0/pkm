import React, { useState } from 'react';
import { User } from "./user.js";

import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
} from '@chakra-ui/react';

import { slogger } from "./slogger.js";
const l = slogger({tag: 'LoginClient' })

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  incrementCount = () => {
    this.setState(prevState => ({
      count: prevState.count + 1
    }));
  }

  handleLogin(e) {
    e.preventDefault()

    const username = e.target.elements.username.value
    const password = e.target.elements.password.value

    User.login(username, password)

    // Hack for updating the login state in App.js
    setTimeout(() => {
      window.location.reload()},
               2000)

  }

  render() {
    return (
      <Box>
      <Box as="h2">Login</Box>
      <form onSubmit={this.handleLogin}>
        <FormControl name="username" id="username">
          <FormLabel>Email:</FormLabel>
          <Input 
            type="text" 
          />
        </FormControl>

        <FormControl id="password" marginTop="4">
          <FormLabel>Password:</FormLabel>
          <Input 
            type="password" 
          />
        </FormControl>

        <Button type="submit" marginTop="4">
          Login
        </Button>
      </form>
    </Box>
    )
  }
}

export { LoginForm }
