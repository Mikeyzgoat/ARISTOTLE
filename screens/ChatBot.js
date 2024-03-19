// //'AIzaSyCdJoZQBX9iiNJOA5wLvPg6JYJLNiDl2qc'


import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Image, Platform, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Hardcoded API key
const API_KEY = 'AIzaSyCdJoZQBX9iiNJOA5wLvPg6JYJLNiDl2qc';

// Access your API key directly
const genAI = new GoogleGenerativeAI(API_KEY);

const ChatBotScreen = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const handlePromptChange = (text) => {
    setPrompt(text);
  };

 
  const handleImagePicker = async () => {
    try {
      let permissionResult;
      if (Platform.OS === 'ios') {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
  
      if (Platform.OS === 'android') {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
  
      if (permissionResult && permissionResult.status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access media library is required!');
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
  
      console.log('Image Picker Result:', result);
  
      if (!result.cancelled && result.assets.length > 0 && result.assets[0].uri) {
        setSelectedImage(result.assets[0].uri);
        console.log('Selected Image URI:', result.assets[0].uri);
      } else {
        console.log('Image picking cancelled or URI is undefined');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again later.');
    }
  };
    

  const handleGenerateResponse = async () => {
    try {
      const base64ImageData = await imageToBase64(selectedImage);

      // For text-and-image input (multimodal), use the gemini-pro-vision model
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

      const imageParts = [
        { inlineData: { data: base64ImageData, mimeType: "image/jpeg" } }
      ];

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = await response.text();

      setResponse(text);
    } catch (error) {
      console.error('Error generating response:', error);
      Alert.alert('Error', 'Failed to generate response. Please try again later.');
    }
  };

  const imageToBase64 = async (imageUri) => {
    try {
      const base64ImageData = await fetch(imageUri)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }))
        .then(dataUrl => dataUrl.replace(/^data:image\/\w+;base64,/, ''));
      
      return base64ImageData;
    } catch (error) {
      console.error('Error converting image to Base64:', error);
      throw error;
    }
  };

  return (
    <View style={styles.container}>
      {selectedImage && (
        <Image
          source={{ uri: selectedImage }}
          style={styles.image}
        />
      )}
      <Button
        title="Pick Image"
        onPress={handleImagePicker}
      />
      <TextInput
        placeholder="Enter your prompt"
        style={styles.input}
        onChangeText={handlePromptChange}
        value={prompt}
      />
      <Button
        title="Generate Response"
        onPress={handleGenerateResponse}
        disabled={!selectedImage || !prompt} // Disable button if image or prompt is not selected
      />
      {response !== '' && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseTitle}>Response:</Text>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'cover',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    width: '80%',
  },
  responseContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  responseTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  responseText: {
    fontSize: 16,
  },
});

export default ChatBotScreen;

 
