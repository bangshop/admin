import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import axios from 'axios';
import {
  Box, Heading, Button, Flex, VStack, SimpleGrid,
  Input, Textarea, Select, FormControl, FormLabel,
  Image, Text, useToast, HStack, NumberInput, NumberInputField
} from '@chakra-ui/react';

function ProductsPage() {
    const toast = useToast();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // Form State
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productDesc, setProductDesc] = useState('');
    const [productStock, setProductStock] = useState(''); // <-- NEW STATE FOR STOCK
    const [productCategory, setProductCategory] = useState('');
    const [productImage, setProductImage] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
            setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => {
            unsubProducts();
            unsubCategories();
        };
    }, []);

    const resetProductForm = () => {
      setProductName(''); setProductPrice(''); setProductDesc('');
      setProductStock(''); setProductCategory(''); setEditingProduct(null);
      setProductImage(null);
      if(document.getElementById('product-image-input')) {
        document.getElementById('product-image-input').value = null;
      }
    };
  
    const handleProductSubmit = async (e) => {
      e.preventDefault();
      if (!productName || !productPrice || !productDesc || !productCategory || productStock === '') {
        toast({ title: "Please fill all fields, including stock.", status: 'error' });
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
          imageUrl: imageUrl,
          stock_quantity: parseInt(productStock, 10) // <-- ADD STOCK TO DATA
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
      setProductStock(product.stock_quantity || 0); // <-- SET STOCK FOR EDITING
    };
  
    const handleDeleteProduct = async (id) => {
      await deleteDoc(doc(db, "products", id));
      toast({ title: 'Product deleted!', status: 'warning' });
    };

    return (
      <Box>
        <Heading as="h1" size="xl" mb={8}>Manage Products</Heading>
        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={10}>
            <Box p={6} bg="white" borderRadius="lg" boxShadow="md" h="fit-content">
              <Heading as="h2" size="lg" mb={4}>{editingProduct ? 'Edit Product' : 'Add Product'}</Heading>
              <form onSubmit={handleProductSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired><FormLabel>Product Name</FormLabel><Input value={productName} onChange={e => setProductName(e.target.value)}/></FormControl>
                  <HStack w="full">
                    <FormControl isRequired>
                      <FormLabel>Price</FormLabel>
                      <NumberInput value={productPrice} onChange={(val) => setProductPrice(val)}>
                        <NumberInputField />
                      </NumberInput>
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Stock Quantity</FormLabel> {/* <-- NEW STOCK INPUT */}
                      <NumberInput value={productStock} onChange={(val) => setProductStock(val)}>
                        <NumberInputField />
                      </NumberInput>
                    </FormControl>
                  </HStack>
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
            <Box p={6} bg="white" borderRadius="lg" boxShadow="md">
                <Heading as="h2" size="lg" mb={4}>Product List</Heading>
                <VStack divider={<Box border="1px solid #eee" w="100%"/>} spacing={4} align="stretch">
                    {products.map(product => (
                        <Flex key={product.id} align="center">
                            <Image src={product.imageUrl} boxSize="75px" objectFit="cover" borderRadius="md" mr={4}/>
                            <Box flex="1">
                                <Text fontWeight="bold">{product.name}</Text>
                                <Text fontSize="sm">₹{product.price} - <Text as="span" color="gray.500">{product.category}</Text></Text>
                                <Text fontSize="sm" fontWeight="bold">Stock: {product.stock_quantity ?? 'N/A'}</Text> {/* <-- DISPLAY STOCK */}
                            </Box>
                            <HStack>
                                <Button size="sm" onClick={() => handleEditProduct(product)}>Edit</Button>
                                <Button size="sm" colorScheme="red" variant="outline" onClick={() => handleDeleteProduct(product.id)}>Delete</Button>
                            </HStack>
                        </Flex>
                    ))}
                </VStack>
            </Box>
        </SimpleGrid>
      </Box>
    );
}

export default ProductsPage;