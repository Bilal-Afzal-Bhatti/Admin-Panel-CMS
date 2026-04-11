import { Box, Typography } from '@mui/material';

export default function GenericPage({ title }) {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        This is a placeholder for the {title} module. It will contain tables, forms, and tools for managing {title.toLowerCase()}.
      </Typography>
    </Box>
  );
}
