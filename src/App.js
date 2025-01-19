import React, { useEffect } from 'react'; 
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';  // Import the splash screen module
import StatesGrid from './screens/StatesGrid';
import PlacesGrid from './screens/PlacesGrid';
import PlaceDetails from './screens/PlaceDetails';

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    // Prevent the splash screen from auto hiding
    SplashScreen.preventAutoHideAsync();
    
    // Simulate loading resources, e.g., fetching data or fonts
    const loadResources = async () => {
      try {
        // Here you can load your resources like data, fonts, etc.
        // e.g., await loadDataAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        // Hide splash screen when loading is done
        SplashScreen.hideAsync();
      }
    };

    loadResources();
  }, []);  // This will run once when the app mounts

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="StatesGrid">
        <Stack.Screen name="StatesGrid" component={StatesGrid} />
        <Stack.Screen name="PlacesGrid" component={PlacesGrid} />
        <Stack.Screen name="PlaceDetails" component={PlaceDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
