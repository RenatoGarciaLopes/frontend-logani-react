import { Box, Stack, Typography } from '@mui/material';

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
};

const SectionTitle = ({ title, subtitle, align = 'center' }: SectionTitleProps) => {
  return (
    <Stack
      spacing={2}
      alignItems={align === 'center' ? 'center' : 'flex-start'}
      sx={{ width: '100%' }}
    >
      {subtitle && (
        <Typography variant="subtitle1" color="text.secondary" textAlign={align}>
          {subtitle}
        </Typography>
      )}
      <Stack
        direction="row"
        alignItems="center"
        spacing={3}
        sx={{
          width: '100%',
          maxWidth: 720,
          alignSelf: align === 'center' ? 'center' : 'flex-start',
        }}
        justifyContent="center"
      >
        <Box
          sx={{
            height: 2,
            bgcolor: 'text.secondary',
            borderRadius: 999,
            flex: align === 'left' ? 0 : 1,
            minWidth: align === 'left' ? 48 : '20%',
          }}
        />
        <Typography
          variant="h2"
          color="text.secondary"
          sx={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            height: 2,
            bgcolor: 'text.secondary',
            borderRadius: 999,
            flex: 1,
            display: align === 'left' ? 'none' : 'block',
            minWidth: '20%',
          }}
        />
      </Stack>
    </Stack>
  );
};

export default SectionTitle;
