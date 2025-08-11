import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext'; // 1. Import useAuth
import { signOut } from 'firebase/auth'; // We only need signOut
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import axios from 'axios';
import {
  Box, Container, Heading, Button, Flex, VStack, Spinner, Center,
  Input, Textarea, Select, FormControl, FormLabel,
  Image, Text, useToast, HStack, Tag, TagLabel, TagCloseButton, SimpleGrid
} from '@chakra-ui/react';

function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser } = useAuth(); // 2. Get the current user from our context

  // Data State
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);

  // Product Form State
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [productCategory, setProductCategory] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);

  // Category Management State
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);

  // 3. The old onAuthStateChanged useEffect has been completely removed.
  // The ProtectedRoute component now handles this.

  // Fetch products
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);
  
  // Fetch orders
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Fetch Categories
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };
  
  const resetProductForm = () => {
    setProductName(''); setProductPrice(''); setProductDesc(''); 
    setProductImage(null); setProductCategory(''); setEditingProduct(null);
    if(document.getElementById('product-image-input')) {
      document.getElementById('product-image-input').value = null;
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productName || !productPrice || !productDesc || !productCategory) {
      toast({ title: "Please fill all product fields, including category.", status: 'error' });
      return;
    }
    
    let imageUrl = editingProduct?.imageUrl || '';
    if (productImage) {
        const formData = new FormData();
        formData.append('file', productImage);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        try {
            const res = await axios.post(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, formData);
            imageUrl = res.data.secure_url;
        } catch (error) {
            toast({ title: "Image upload failed.", status: 'error' });
            return;
        }
    }

    const productData = {
        name: productName,
        price: parseFloat(productPrice),
        description: productDesc,
        category: productCategory,
        imageUrl: imageUrl
    };

    if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        toast({ title: "Product updated!", status: 'success' });
    } else {
        await addDoc(collection(db, "products"), productData);
        toast({ title: "Product added!", status: 'success' });
    }
    resetProductForm();
  };
  
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductPrice(product.price);
    setProductDesc(product.description);
    setProductCategory(product.category);
  };

  const handleDeleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    toast({ title: 'Product deleted!', status: 'warning' });
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryName || !categoryImage) {
        toast({ title: "Please provide a category name and image.", status: 'error' });
        return;
    }

    const formData = new FormData();
    formData.append('file', categoryImage);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    let imageUrl = '';
    try {
        const res = await axios.post(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, formData);
        imageUrl = res.data.secure_url;
    } catch (error) {
        toast({ title: "Category image upload failed.", status: 'error' });
        return;
    }
    await addDoc(collection(db, "categories"), { name: categoryName, imageUrl });
    toast({ title: "Category added!", status: 'success' });
    setCategoryName('');
    setCategoryImage(null);
    document.getElementById('category-image-input').value = null;
  };
  
  const handleDeleteCategory = async (id) => {
      await deleteDoc(doc(db, "categories", id));
      toast({ title: 'Category deleted!', status: 'warning' });
  };
  
  // 4. Use a Spinner for a better loading experience while currentUser is being checked
  if (!currentUser) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box bg="gray.50" minH="100vh">
      <Container maxW="container.xl" py={8}>
        <Flex justify="space-between" align="center" mb={8}>
          <Heading as="h1">Admin Dashboard</Heading>
          <Button onClick={handleLogout} colorScheme="red">Logout</Button>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
          {/* Left Column: Product & Category Management */}
          <VStack spacing={8} align="stretch">
            <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
              <Heading as="h2" size="lg" mb={4}>Manage Categories</Heading>
              <form onSubmit={handleCategorySubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Category Name</FormLabel>
                    <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Category Image</FormLabel>
                    <Input id="category-image-input" type="file" onChange={(e) => setCategoryImage(e.target.files[0])} p={1} />
                  </FormControl>
                  <Button type="submit" colorScheme="purple" w="full">Add Category</Button>
                </VStack>
              </form>
              <HStack spacing={4} mt={6} wrap="wrap">
                {categories.map(cat => (
                  <Tag size="lg" key={cat.id} borderRadius="full" variant="solid" colorScheme="purple">
                    <TagLabel>{cat.name}</TagLabel>
                    <TagCloseButton onClick={() => handleDeleteCategory(cat.id)} />
                  </Tag>
                ))}
              </HStack>
            </Box>

            <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
              <Heading as="h2" size="lg" mb={4}>{editingProduct ? 'Edit Product' : 'Add Product'}</Heading>
              <form onSubmit={handleProductSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired><FormLabel>Product Name</FormLabel><Input value={productName} onChange={e => setProductName(e.target.value)}/></FormControl>
                  <FormControl isRequired><FormLabel>Product Price</FormLabel><Input type="number" value={productPrice} onChange={e => setProductPrice(e.target.value)}/></FormControl>
                  <FormControl isRequired><FormLabel>Product Description</FormLabel><Textarea value={productDesc} onChange={e => setProductDesc(e.target.value)}/></FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Category</FormLabel>
                    <Select placeholder="Select category" value={productCategory} onChange={e => setProductCategory(e.target.value)}>
                      {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </Select>
                  </FormControl>

                  <FormControl><FormLabel>Product Image</FormLabel><Input id="product-image-input" type="file" onChange={(e) => setProductImage(e.target.files[0])} p={1} /></FormControl>
                  <Button type="submit" colorScheme="teal" w="full">{editingProduct ? 'Update Product' : 'Add Product'}</Button>
                  {editingProduct && <Button w="full" onClick={resetProductForm}>Cancel Edit</Button>}
                </VStack>
              </form>
            </Box>
          </VStack>

          {/* Right Column: Products & Orders List */}
          <VStack spacing={8} align="stretch">
              <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
                  <Heading as="h2" size="lg" mb={4}>Product List</Heading>
                  <VStack divider={<Box border="1px solid #eee" w="100%"/>} spacing={4} align="stretch">
                      {products.map(product => (
                          <Flex key={product.id} align="center">
                              <Image src={product.imageUrl} boxSize="75px" objectFit="cover" borderRadius="md" mr={4}/>
                              <Box flex="1">
                                  <Text fontWeight="bold">{product.name}</Text>
                                  <Text fontSize="sm">₹{product.price} - <Text as="span" color="gray.500">{product.category}</Text></Text>
                              </Box>
                              <HStack>
                                  <Button size="sm" onClick={() => handleEditProduct(product)}>Edit</Button>
                                  <Button size="sm" colorScheme="red" variant="outline" onClick={() => handleDeleteProduct(product.id)}>Delete</Button>
                              </HStack>
                          </Flex>
                      ))}
                  </VStack>
              </Box>

              <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
                  <Heading as="h2" size="lg" mb={4}>Incoming Orders</Heading>
                  <VStack divider={<Box border="1px solid #eee" w="100%"/>} spacing={4} align="stretch">
                      {orders.length > 0 ? (
                          orders.map(order => (
                            <Box key={order.id} py={2}>
                                <Flex justify="space-between" fontWeight="bold">
                                    <Text>Order ID: {order.id.substring(0, 10)}...</Text>
                                    <Text>Total: ₹{order.totalPrice.toFixed(2)}</Text>
                                </Flex>
                                <Text fontSize="sm" color="gray.500">
                                    {new Date(order.createdAt?.toDate()).toLocaleString()}
                                </Text>
                        
                                <Box mt={2} p={2} bg="gray.100" borderRadius="md">
                                    <Text fontSize="sm" fontWeight="bold">{order.customerInfo?.name}</Text>
                                    <Text fontSize="sm">{order.customerInfo?.email}</Text>
                                    <Text fontSize="sm">{order.customerInfo?.phone}</Text>
                                    <Text fontSize="sm">{order.customerInfo?.address}</Text>
                                </Box>
                        
                                <VStack align="start" mt={2} pl={4} spacing={0}>
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
          </VStack>
        </SimpleGrid>
      </Container>
    </Box>
  );
}

export default Dashboard;