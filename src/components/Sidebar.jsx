import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { Box, VStack, Link, Heading, Icon, Text } from '@chakra-ui/react';
import { FiHome, FiBox, FiShoppingBag, FiTag } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ icon, children, to }) => {
  return (
    <Link
      as={RouterNavLink}
      to={to}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
      _activeLink={{
        bg: 'teal.500',
        color: 'white',
      }}
      w="full"
      p={3}
      borderRadius="md"
      display="flex"
      alignItems="center"
      fontWeight="medium"
    >
      <Icon as={icon} mr={3} />
      {children}
    </Link>
  );
};

function Sidebar() {
  const { currentUser } = useAuth();
  return (
    <Box
      bg="white"
      w="250px"
      p={5}
      h="100vh"
      borderRight="1px"
      borderColor="gray.200"
      position="fixed"
    >
      <VStack spacing={8} align="stretch">
        <Heading as="h2" size="md" color="teal.500">My Shop Admin</Heading>
        <VStack spacing={2} align="stretch">
          <NavItem icon={FiHome} to="/dashboard">Dashboard</NavItem>
          <NavItem icon={FiBox} to="/dashboard/products">Products</NavItem>
          <NavItem icon={FiTag} to="/dashboard/categories">Categories</NavItem>
          <NavItem icon={FiShoppingBag} to="/dashboard/orders">Orders</NavItem>
        </VStack>
      </VStack>
      <Box position="absolute" bottom="5" w="calc(100% - 40px)">
        <Text fontSize="sm" isTruncated>{currentUser?.email}</Text>
      </Box>
    </Box>
  );
}

export default Sidebar;