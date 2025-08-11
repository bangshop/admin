import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

function DashboardHomePage() {
  const { currentUser } = useAuth();
  return (
    <Box>
      <Heading as="h1" size="xl" mb={4}>Welcome, Admin!</Heading>
      <Text>Use the sidebar to manage your products, categories, and orders.</Text>
      <Text mt={4}>Signed in as: <Text as="span" fontWeight="bold">{currentUser.email}</Text></Text>
    </Box>
  );
}

export default DashboardHomePage;