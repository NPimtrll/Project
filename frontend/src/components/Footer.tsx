import React from 'react';
import { Container, Typography, Link, Box, TextField, Button } from '@mui/material';
import { Facebook, Twitter, Instagram, YouTube } from '@mui/icons-material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      id="footer"
      sx={{
        backgroundColor: '#1E2128',
        padding: '40px 0',
        color: '#fff',
        borderTop: '1px solid #444',
        marginTop: 'auto',
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Container>
        {/* Upper Section */}
        <Box
          sx={{
            paddingBottom: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            alignItems: 'center',
          }}
        >
          {/* Newsletter Subscription */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Subscribe to our newsletter
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#1A1A1A',
                borderRadius: '50px',
                overflow: 'hidden',
                border: '1px solid #fff',
            
              }}
            >
              <TextField
                variant="outlined"
                placeholder="Input your email"
                size="small"
                sx={{
                  input: { color: '#fff' },
                  backgroundColor: 'transparent',
                  borderColor: 'transparent',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover fieldset': {
                      border: 'none',
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                sx={{
                    backgroundColor: '#6A0DAD',
                    color: '#fff',
                    borderRadius: '50px',
                    padding: '8px 24px',
                    textTransform: 'none',
                    marginLeft: '8px',
                    height: '100%', // Ensures the button height matches the TextField height
                  }}
              >
                Subscribe
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Middle Section */}
        <Box
          sx={{
            borderBottom: '1px solid #fff',
            paddingBottom: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <img src="/logo1.png" alt="Logo" style={{ height: '40px', marginLeft: '10px' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              PDFtoAudio
            </Typography>
          </Box>

          {/* Main Menu on the right */}
          <Box sx={{ display: 'flex', gap: 3, marginLeft: 'auto' }}>
            <Link href="/about-us" color="inherit" variant="body2">About us</Link>
            <Link href="/features" color="inherit" variant="body2">Features</Link>
            <Link href="/help-center" color="inherit" variant="body2">Help Center</Link>
            <Link href="/contact-us" color="inherit" variant="body2">Contact us</Link>
            <Link href="/faqs" color="inherit" variant="body2">FAQs</Link>
            <Link href="/careers" color="inherit" variant="body2">Careers</Link>
          </Box>
        </Box>

        {/* Lower Section */}
        <Box
          sx={{
            paddingTop: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Language Menu */}
          <Box>
            <Typography variant="body2">Language: English</Typography>
          </Box>

          {/* Copyright, Policies, and Social Media Icons */}
          <Box
            sx={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              &copy; 2024 PDFtoAudio
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Link href="/privacy-policy" color="inherit" variant="body2">Privacy Policy</Link>
              <Link href="/terms-of-service" color="inherit" variant="body2">Terms of Service</Link>
              <Link href="/sitemap" color="inherit" variant="body2">Sitemap</Link>
            </Box>
          </Box>

          {/* Social Media Icons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook sx={{ color: '#fff' }} />
            </Link>
            <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <Twitter sx={{ color: '#fff' }} />
            </Link>
            <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram sx={{ color: '#fff' }} />
            </Link>
            <Link href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <YouTube sx={{ color: '#fff' }} />
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
