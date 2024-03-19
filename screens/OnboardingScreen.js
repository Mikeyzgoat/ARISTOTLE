import React from 'react';
import { View,Image, StyleSheet,TouchableOpacity,Text } from 'react-native';

import Onboarding from 'react-native-onboarding-swiper';

const Dots = ({selected}) => {
    let backgroundColor;

    backgroundColor = selected ? '#a9a9a9' : '#f0f8ff';

    return (
        <View
            style={{
                width:6,
                height: 6,
                marginHorizontal: 3,
                backgroundColor
            }}
        />
    );
}

const Skip = ({...props}) => (
    <TouchableOpacity
        style={{marginHorizontal:10}}
        {...props}
    >
        <Text style={{fontSize:16,color:'#f0f8ff'}}>Skip</Text>
    </TouchableOpacity>
);

const Next = ({...props}) => (
    <TouchableOpacity
        style={{marginHorizontal:10}}
        {...props}
    >
        <Text style={{fontSize:16,color:'#f0f8ff'}}>Next</Text>
    </TouchableOpacity>
);

const Done = ({...props}) => (
    <TouchableOpacity
        style={{marginHorizontal:10}}
        {...props}
    >
        <Text style={{fontSize:16,color:'#f0f8ff'}}>Done</Text>
    </TouchableOpacity>
);

const OnboardingScreen = ({navigation}) => {
    return (
        <Onboarding
        SkipButtonComponent={Skip}
        NextButtonComponent={Next}
        DoneButtonComponent={Done}
        DotComponent={Dots}
        onSkip={() => navigation.replace("Home")}    //navigation.navigate to navigate back to onboarding screen by the user
        onDone={() => navigation.navigate("Home")}
        pages={[
          {
            backgroundColor: '#000000',
            image: <Image source={require('../assets/onboarding-img1.png')} />,
            title: 'Welcome to Aristotle',
            subtitle: 'Your personalised media hub',
            
          },
          {
            backgroundColor: '#000000',
            image: <Image source={require('../assets/onboarding-img2.png')} />,
            title: 'Smart object detection',
            subtitle: 'Let our AI do the work for you!',
          },
          {
            backgroundColor: '#000000',
            image: <Image source={require('../assets/onboarding-img3.png')} />,
            title: 'Elevate your images with AI-powered prompts',
            subtitle: "Empowered by our Chatbot",
          },
        ]}
      />
    );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
});