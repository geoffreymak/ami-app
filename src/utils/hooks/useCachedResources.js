// import { Ionicons } from "@expo/vector-icons";

import {useState, useEffect} from 'react';
import RNBootSplash from 'react-native-bootsplash';

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        RNBootSplash.show({fade: true});

        // Load fonts
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        RNBootSplash.hide({fade: true});
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete;
}
