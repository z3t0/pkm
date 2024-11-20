import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  fonts: {
    heading: 'Roboto, sans-serif',
    body: 'Roboto, sans-serif'
  },
  styles: {
    global: {
      body: { margin: "1rem" }
    }
  }
})

export { theme }