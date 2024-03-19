
import { AntDesign } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import { SearchBar } from 'react-native-elements';
import * as FileSystem from 'expo-file-system';
import BottomNavigationBar from '../components/BottomNavigationBar';
import CameraScreen from '../components/CameraScreen'; // Importing the CameraScreen component
import ChatBot from './ChatBot';

export default function HomeScreen({navigation}) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [caption, setCaption] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
      fetchMediaFromLibrary();
    })();
  }, []);

  const fetchMediaFromLibrary = async () => {
    try {
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        first: 102,
      });

      // Fetch captions for all media assets
      const mediaWithCaptions = await Promise.all(assets.map(async asset => {
        try {
          const info = await MediaLibrary.getAssetInfoAsync(asset);
          const caption = info?.localUri; // Assuming the caption is stored in the localUri field
          return { ...asset, caption };
        } catch (error) {
          console.error('Error fetching caption:', error);
          return { ...asset, caption: 'Caption not available' };
        }
      }));

      setMedia(mediaWithCaptions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching media:', error);
      setLoading(false);
    }
  };

  const handleImagePress = async (item) => {
    setSelectedMedia(item);
    setShowModal(true);
    await generateCaption(item); // Automatically generate caption upon image press
  };

  const generateCaption = async (selectedItem) => {
    setCaption(''); // Reset caption state
    try {
      const imageData = await FileSystem.readAsStringAsync(selectedItem.uri, { encoding: FileSystem.EncodingType.Base64 });

      const response = await fetch('https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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',
        },
        body: JSON.stringify({ inputs: { image: imageData } }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Caption result:', result);
        if (result[0] && result[0].generated_text) {
          setCaption(result[0].generated_text);
        } else {
          setCaption('Caption not available');
        }
      } else {
        console.error('Error:', result);
        setCaption('Caption generation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setCaption('Caption generation failed');
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Log the search process
  useEffect(() => {
    // console.log('Search query:', searchQuery);
    // console.log('Filtered media:', media.filter(item => !searchQuery || (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase()))));
  }, [searchQuery, media]);

  return (
    <View style={{ flex: 1 }}>
      <SearchBar
        placeholder="Type Here..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        lightTheme
        round
        containerStyle={{ backgroundColor: 'transparent', borderTopWidth: 0, borderBottomWidth: 0 }}
        inputContainerStyle={{ backgroundColor: 'white' }}
        inputStyle={{ color: 'black' }}
        leftIconContainerStyle={{ marginLeft: 10 }}
        leftIcon={
          <AntDesign name="search1" size={20} color="black" />
        }
      />
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <FlatList
            data={media.filter(item => !searchQuery || (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase())))}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleImagePress(item)}>
                <Image
                  source={{ uri: item.uri }}
                  style={{ width: screenWidth / 3, height: screenWidth / 3, margin: 2 }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 56 }}
          />
        )}
      </View>
      <Modal visible={showModal} transparent={true} onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity style={{ position: 'absolute', top: 20, right: 20, zIndex: 1 }} onPress={() => setShowModal(false)}>
            <AntDesign name="closecircle" size={24} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: selectedMedia?.uri }}
            style={{ width: screenWidth, height: screenHeight * 0.8 }}
            resizeMode="contain"
          />
          <Text style={{ color: 'white', fontSize: 18, position: 'absolute', bottom: 20 }}>{caption}</Text>
        </View>
      </Modal>
      {isCameraOpen && <CameraScreen onClose={() => setIsCameraOpen(false)} />}
      <BottomNavigationBar onCameraPress={() => setIsCameraOpen(true)} />
      <BottomNavigationBar onSettingsPress={() =>  navigation.navigate("ChatBot")} />
    </View>
  );
}
