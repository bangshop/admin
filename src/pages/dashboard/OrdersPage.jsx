import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { Box, Heading, VStack, Flex, Text } from '@chakra-ui/react';

function OrdersPage() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
            setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    return (
        <Box>
            <Heading as="h1" size="xl" mb={8}>Incoming Orders</Heading>
            <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
                <VStack divider={<Box border="1px solid #eee" w="100%"/>} spacing={6} align="stretch">
                    {orders.length > 0 ? (
                        orders.map(order => (
                            <Box key={order.id}>
                                <Flex justify="space-between" fontWeight="bold">
                                    <Text>Order ID: {order.id.substring(0, 10)}...</Text>
                                    <Text>Total: ₹{order.totalPrice.toFixed(2)}</Text>
                                </Flex>
                                <Text fontSize="sm" color="gray.500">
                                    {new Date(order.createdAt?.toDate()).toLocaleString()}
                                </Text>
                                <Box mt={3} p={3} bg="gray.50" borderRadius="md">
                                    <Text fontSize="sm" fontWeight="bold">{order.customerInfo?.name}</Text>
                                    <Text fontSize="sm">{order.customerInfo?.email}</Text>
                                    <Text fontSize="sm">{order.customerInfo?.phone}</Text>
                                    <Text fontSize="sm">{order.customerInfo?.address}</Text>
                                </Box>
                                <VStack align="start" mt={3} pl={4} spacing={1}>
                                    <Text fontWeight="bold" fontSize="sm">Items:</Text>
                                    {order.items.map(item => (
                                        <Text key={item.id} fontSize="sm">
                                            {item.quantity} x {item.name}
                                        </Text>
                                    ))}
                                </VStack>
                            </Box>
                        ))
                    ) : (
                        <Text color="gray.500">No new orders.</Text>
                    )}
                </VStack>
            </Box>
        </Box>
    );
}

export default OrdersPage;