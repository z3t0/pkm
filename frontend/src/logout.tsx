import React from "react";

import {Button} from '@chakra-ui/react';
import { Session } from "./session.ts";

function logout() {
  const session = Session.getSessionSingleton()

  if (session) {
    session.logout()
  }
}

function LogoutButton() {

  return (
    <Button marginTop="4" onClick={logout}>
          Logout
        </Button>
  )
}

export { LogoutButton } 