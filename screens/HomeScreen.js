
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Platform, View } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import BottomNavigationBar from '../components/BottomNavigationBar';
import CameraScreen from '../components/CameraScreen';

export default function HomeScreen() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false); // State to track whether the camera screen is shown

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
          return;
        }
      }
      fetchImagesFromGallery();
    })();
  }, []);

  const fetchImagesFromGallery = async () => {
    try {
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 50,
      });
      const imageUris = assets.map(asset => asset.uri);
      setImages(imageUris);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching images:', error);
      setLoading(false);
    }
  };

  const handleCameraPress = () => {
    setShowCamera(true); // Set showCamera state to true to display the camera screen
  };

  const handleCloseCamera = () => {
    setShowCamera(false); // Set showCamera state to false to hide the camera screen
  };

  const handleCapture = async (photo) => {
    console.log('Captured photo:', photo);
    // Do something with the captured photo, e.g., save it or display it
  };

  const renderItem = ({ item }) => (
    <Image source={{ uri: item }} style={{ width: imageWidth, height: imageWidth, margin: 5 }} />
  );

  const screenWidth = Dimensions.get('window').width;
  const imageWidth = (screenWidth - 20) / 2;

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : showCamera ? ( // Conditionally render the camera screen if showCamera is true
        <CameraScreen onClose={handleCloseCamera} onCapture={handleCapture} />
      ) : (
        <FlatList
          data={images}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
        />
      )}

      {showCamera ? null : <BottomNavigationBar onCameraPress={handleCameraPress} />}
    </View>
  );
}

