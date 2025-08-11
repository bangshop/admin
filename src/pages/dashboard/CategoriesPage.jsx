import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import axios from 'axios';
import {
  Box, Heading, Button, VStack,
  Input, FormControl, FormLabel,
  useToast, HStack, Tag, TagLabel, TagCloseButton
} from '@chakra-ui/react';

function CategoriesPage() {
    const toast = useToast();
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [categoryImage, setCategoryImage] = useState(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
            setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

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

    return (
        <Box>
            <Heading as="h1" size="xl" mb={8}>Manage Categories</Heading>
            <Box p={6} bg="white" borderRadius="lg" boxShadow="md" maxW="lg">
              <Heading as="h2" size="lg" mb={4}>Add New Category</Heading>
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
              <Heading as="h3" size="md" mt={8} mb={4}>Existing Categories</Heading>
              <HStack spacing={4} mt={6} wrap="wrap">
                {categories.map(cat => (
                  <Tag size="lg" key={cat.id} borderRadius="full" variant="solid" colorScheme="purple">
                    <TagLabel>{cat.name}</TagLabel>
                    <TagCloseButton onClick={() => handleDeleteCategory(cat.id)} />
                  </Tag>
                ))}
              </HStack>
            </Box>
        </Box>
    );
}

export default CategoriesPage;