import {PropTypes} from 'prop-types';
import React, {useState, useEffect} from 'react';

import {
  Animated,
  Dimensions,
  Keyboard,
  StyleSheet,
  TextInput,
  UIManager,
  findNodeHandle,
} from 'react-native';

const {State: TextInputState} = TextInput;

const KeyboardShift = ({children}) => {
  const [shift, setShift] = useState(new Animated.Value(0));

  useEffect(() => {
    const _handleKeyboardDidShow = (event) => {
      const {height: windowHeight} = Dimensions.get('window');
      const keyboardHeight = event.endCoordinates.height;
      const currentlyFocusedField = TextInputState.currentlyFocusedInput
        ? findNodeHandle(TextInputState.currentlyFocusedInput())
        : TextInputState.currentlyFocusedField();
      if (currentlyFocusedField) {
        UIManager.measure(
          currentlyFocusedField,
          (originX, originY, width, height, pageX, pageY) => {
            const fieldHeight = height;
            const fieldTop = pageY;
            const gap =
              windowHeight - keyboardHeight - (fieldTop + fieldHeight);
            if (gap >= 0) {
              return;
            }
            Animated.timing(shift, {
              toValue: gap,
              duration: 1000,
              useNativeDriver: true,
            }).start();
          },
        );
      }
    };
    const _handleKeyboardDidHide = () => {
      Animated.timing(shift, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    };

    const keyboardDidShowSubscription = Keyboard.addListener(
      'keyboardDidShow',
      _handleKeyboardDidShow,
    );
    const keyboardDidHideSubscription = Keyboard.addListener(
      'keyboardDidHide',
      _handleKeyboardDidHide,
    );

    // cleanup function
    return () => {
      keyboardDidShowSubscription.remove();
      keyboardDidHideSubscription.remove();
    };
  }, [shift]);

  return (
    <Animated.View
      style={[styles.container, {transform: [{translateY: shift}]}]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
});

KeyboardShift.propTypes = {
  children: PropTypes.func.isRequired,
};

export default KeyboardShift;
