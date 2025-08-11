import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { 
    Box, Heading, VStack, Flex, Text, Select, useToast,
    Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge
} from '@chakra-ui/react';

const orderStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const toast = useToast();
    // 1. NEW STATE to track which order row is expanded
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
            const sortedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first
            setOrders(sortedOrders);
        });
        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        // ... (this function remains the same)
    };
    
    // 2. NEW HANDLER to toggle the expanded row
    const handleRowClick = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null); // Collapse if it's already open
        } else {
            setExpandedOrderId(orderId); // Expand the clicked row
        }
    };

    const getStatusColorScheme = (status) => { /* ... (this function remains the same) ... */ };

    return (
        <Box>
            <Heading as="h1" size="xl" mb={8}>Manage Orders</Heading>
            <TableContainer bg="white" borderRadius="lg" boxShadow="md">
                <Table variant='simple'>
                    <Thead>
                        <Tr>
                            <Th>Order ID</Th>
                            <Th>Customer</Th>
                            <Th>Date</Th>
                            <Th>Total</Th>
                            <Th>Status</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {orders.map(order => (
                            // 3. Use a React Fragment to group the main row and the details row
                            <React.Fragment key={order.id}>
                                <Tr 
                                    onClick={() => handleRowClick(order.id)}
                                    _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                                >
                                    <Td><Text fontSize="xs">{order.id}</Text></Td>
                                    <Td>
                                        <Text fontWeight="bold">{order.customerInfo?.name}</Text>
                                        <Text fontSize="sm" color="gray.500">{order.customerInfo?.email}</Text>
                                    </Td>
                                    <Td><Text fontSize="sm">{new Date(order.createdAt?.toDate()).toLocaleDateString()}</Text></Td>
                                    <Td>₹{order.totalPrice.toFixed(2)}</Td>
                                    <Td>
                                        <Select 
                                            size="sm"
                                            value={order.status} 
                                            onClick={(e) => e.stopPropagation()} // Prevents row from collapsing when changing status
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            bg={getStatusColorScheme(order.status) + ".100"}
                                            borderColor={getStatusColorScheme(order.status) + ".200"}
                                        >
                                            {orderStatuses.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </Select>
                                    </Td>
                                </Tr>
                                
                                {/* 4. THE EXPANDABLE DETAILS ROW */}
                                {expandedOrderId === order.id && (
                                    <Tr>
                                        <Td colSpan={5} bg="gray.50">
                                            <Box p={4}>
                                                <Heading size="sm" mb={2}>Order Details</Heading>
                                                <VStack align="start" spacing={1}>
                                                    {order.items.map(item => (
                                                        <Flex key={item.id} w="full" justify="space-between">
                                                            <Text fontSize="sm">{item.quantity} x {item.name}</Text>
                                                            <Text fontSize="sm" color="gray.600">₹{(item.price * item.quantity).toFixed(2)}</Text>
                                                        </Flex>
                                                    ))}
                                                </VStack>
                                                <Box mt={3} pt={3} borderTop="1px solid #ddd">
                                                     <Text fontWeight="bold" fontSize="sm">Shipping Address:</Text>
                                                     <Text fontSize="sm">{order.customerInfo?.address}</Text>
                                                     <Text fontSize="sm">Phone: {order.customerInfo?.phone}</Text>
                                                </Box>
                                            </Box>
                                        </Td>
                                    </Tr>
                                )}
                            </React.Fragment>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default OrdersPage;