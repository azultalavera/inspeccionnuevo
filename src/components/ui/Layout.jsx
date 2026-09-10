import React from 'react'
import { Box } from '@mui/material'

export default function Layout({ children }) {
  return (
    <Box
      sx={{
        width: '100%',
        minWidth: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        p: { xs: 1.5, sm: 3 },
      }}
    >
      {children}
    </Box>
  )
}
