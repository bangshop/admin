import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

function DashboardLayout() {
  return (
    <Flex>
      <Sidebar />
      <Box ml="250px" p={8} w="full">
        <Outlet /> 
      </Box>
    </Flex>
  );
}

export default DashboardLayout;