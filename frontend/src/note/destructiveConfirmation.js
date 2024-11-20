import React from 'react';
import { Box, Heading, Text, Button, Flex } from '@chakra-ui/react';

const DestructiveConfirmation = (props) => {
  const { title, message, destructiveText, safeText, destructiveCallback, safeCallback }
        = props

    return (
        <Box>
            <Heading size="sm">{title}</Heading>
            <Text data-private>{message}</Text>
            <Flex justifyContent="space-between">
              <Button colorScheme="red" onClick={ async () => {
                        await destructiveCallback()
                        props.closeWindow()
                      }}>{destructiveText}</Button>
              <Button colorScheme="blue" onClick={async () => {
                        await safeCallback()
                        props.closeWindow()
                      }}>{safeText}</Button>
            </Flex>
        </Box>
    );
};

export { DestructiveConfirmation }
