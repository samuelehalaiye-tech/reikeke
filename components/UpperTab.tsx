import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ToggleButton from './ToggleButton';

function UpperTab() {
  const [isAvailable, setIsAvailable] = useState(false);

  return (
    <SafeAreaView style={{ backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <ToggleButton
          label={isAvailable ? "Available ✓" : "Available"}
          activeColor="orange"
          inactiveColor="#ccc"
          onToggle={(active) => setIsAvailable(active)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#fff',
    position: 'absolute',
    top: 0,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    elevation: 5,
  },
});

export default UpperTab;
