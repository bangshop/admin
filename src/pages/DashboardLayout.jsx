import React from 'react';
import { Box, Flex, Drawer, DrawerContent, DrawerOverlay, useDisclosure, IconButton } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { FiMenu } from 'react-icons/fi'; // Hamburger menu icon

function DashboardLayout() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex>
      {/* 1. DESKTOP SIDEBAR: Hidden on small screens (base), visible on medium screens and up (md) */}
      <Box display={{ base: 'none', md: 'block' }} position="fixed">
        <Sidebar />
      </Box>

      {/* 2. MOBILE HEADER: Only visible on small screens */}
      <Flex
        as="header"
        display={{ base: 'flex', md: 'none' }}
        align="center"
        justify="space-between"
        p={4}
        bg="white"
        boxShadow="sm"
        w="full"
      >
        <Heading as="h2" size="md" color="teal.500">My Shop Admin</Heading>
        <IconButton
          aria-label="Open menu"
          icon={<FiMenu />}
          onClick={onOpen}
          variant="ghost"
        />
      </Flex>

      {/* 3. MOBILE DRAWER: The sidebar content for mobile */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <Sidebar onClose={onClose} />
        </DrawerContent>
      </Drawer>

      {/* 4. MAIN CONTENT: Margin is adjusted for mobile vs desktop */}
      <Box ml={{ base: 0, md: '250px' }} p={{ base: 4, md: 8 }} w="full" mt={{ base: '60px', md: 0 }}>
        <Outlet />
      </Box>
    </Flex>
  );
}

export default DashboardLayout;