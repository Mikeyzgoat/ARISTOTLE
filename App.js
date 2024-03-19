import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect } from "react";;

import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from "./screens/HomeScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import ChatBot from './screens/ChatBot';

const AppStack = createStackNavigator();

const App = () => {
  const [isFirstLaunch,setIsFirstLaunch] = React.useState(null);
  useEffect(()=>{
    AsyncStorage.getItem('AlreadyLaunched').then(value=> {
      if(value==null){
        AsyncStorage.setItem('AlreadyLaunched','true');
        setIsFirstLaunch(true);
      }else{
        setIsFirstLaunch(false);
      }
    })
  },[]);

  if(isFirstLaunch == null){
    return null;
  }else if(isFirstLaunch == true){
    return <HomeScreen />
    // return(
    //   <NavigationContainer>
    //     <AppStack.Navigator headerShown = "false">
    //       <AppStack.Screen name="Aristotle" component={OnboardingScreen}/>
    //       <AppStack.Screen name="Home" component={HomeScreen}/>
    //     </AppStack.Navigator>
    //   </NavigationContainer>
    // );
  }else{
    // return <HomeScreen />
    return(
      <NavigationContainer>
        <AppStack.Navigator headerShown = "false">
          <AppStack.Screen name="Aristotle" component={OnboardingScreen}/>
          <AppStack.Screen name="Home" component={HomeScreen}/>
          <AppStack.Screen name="ChatBot" component={ChatBot}/>
        </AppStack.Navigator>
      </NavigationContainer>
    );
  }

}

export default App;


