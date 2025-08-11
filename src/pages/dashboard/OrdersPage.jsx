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

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
            setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        const orderRef = doc(db, "orders", orderId);
        try {
            await updateDoc(orderRef, { status: newStatus });
            toast({
                title: "Order status updated.",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Error updating status.",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const getStatusColorScheme = (status) => {
        switch (status) {
            case "Pending": return "yellow";
            case "Processing": return "blue";
            case "Shipped": return "purple";
            case "Delivered": return "green";
            case "Cancelled": return "red";
            default: return "gray";
        }
    };

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
                            <Tr key={order.id}>
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
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default OrdersPage;