import React from 'react';
// 1. ADD 'Heading' TO THE LIST OF IMPORTS HERE
import { Box, Flex, Drawer, DrawerContent, DrawerOverlay, useDisclosure, IconButton, Heading } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FiMenu } from 'react-icons/fi';

function DashboardLayout() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex>
      {/* DESKTOP SIDEBAR */}
      <Box display={{ base: 'none', md: 'block' }} position="fixed">
        <Sidebar />
      </Box>

      {/* MOBILE HEADER */}
      <Flex
        as="header"
        display={{ base: 'flex', md: 'none' }}
        align="center"
        justify="space-between"
        p={4}
        bg="white"
        boxShadow="sm"
        w="full"
        position="fixed" // Keep header at the top
        top="0"
        zIndex="banner"
      >
        <Heading as="h2" size="md" color="teal.500">My Shop Admin</Heading>
        <IconButton
          aria-label="Open menu"
          icon={<FiMenu />}
          onClick={onOpen}
          variant="ghost"
        />
      </Flex>

      {/* MOBILE DRAWER */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <Sidebar onClose={onClose} />
        </DrawerContent>
      </Drawer>

      {/* MAIN CONTENT */}
      <Box ml={{ base: 0, md: '250px' }} p={{ base: 4, md: 8 }} w="full" mt={{ base: '60px', md: 0 }}>
        <Outlet />
      </Box>
    </Flex>
  );
}

export default DashboardLayout;