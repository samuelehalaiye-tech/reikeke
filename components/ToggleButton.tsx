import React, { useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

interface ToggleButtonProps {
  label?: string;
  activeColor?: string;
  inactiveColor?: string;
  onToggle?: (active: boolean) => void;
}

export default function ToggleButton({
  label = 'Toggle',
  activeColor = 'orange',
  inactiveColor = '#ccc',
  onToggle,
}: ToggleButtonProps) {
  const [active, setActive] = useState(false);

  const handlePress = () => {
    const newState = !active;
    setActive(newState);
    if (onToggle) onToggle(newState); // optional callback
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: active ? activeColor : inactiveColor, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={styles.text}>
        {label} {active ? '✓' : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
