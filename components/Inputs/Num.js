import { useState, useEffect } from 'react';
import { TextInput, View, StyleSheet, TouchableOpacity, Text } from 'react-native';

export default function NumericInput({ 
  value: propValue = '', 
  onValueChange, 
  placeholder = "Qtd.",
  style = {},
  inputStyle = {},
  min = 1,
  max,
  ...props 
}) {
  const [internalValue, setInternalValue] = useState(propValue.toString());

  useEffect(() => {
    const propStr = (propValue !== undefined && propValue !== null) ? propValue.toString() : '';
    if (propStr !== internalValue) {
      setInternalValue(propStr);
    }
  }, [propValue]);



  const handleChange = (text) => {
    let numericValue = text.replace(/[^0-9]/g, '');
    setInternalValue(numericValue);
    
    if (onValueChange && numericValue !== propValue) {
      onValueChange(numericValue);
    }
  };


  const handleBlur = () => {
    let val = parseInt(internalValue, 10);
    if (isNaN(val) || val < min) {
      val = min;
    }
    if (max !== undefined && val > max) {
      val = max;
    }
    setInternalValue(val.toString());
    if (onValueChange) {
      onValueChange(val);
    }
  };

  const increment = () => {
    let val = parseInt(internalValue, 10);
    if (isNaN(val)) val = min - 1;
    let newVal = val + 1;
    if (max !== undefined && newVal > max) return;
    setInternalValue(newVal.toString());
    if (onValueChange) {
      onValueChange(newVal);
    }
  };

  const decrement = () => {
    let val = parseInt(internalValue, 10);
    if (isNaN(val)) val = min + 1;
    let newVal = val - 1;
    if (newVal < min) return;
    setInternalValue(newVal.toString());
    if (onValueChange) {
      onValueChange(newVal);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity style={styles.button} onPress={decrement}>
        <Text style={styles.buttonText}>−</Text>
      </TouchableOpacity>

      <TextInput
        style={[styles.input, inputStyle]}
        keyboardType="number-pad"
        value={internalValue}
        onChangeText={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        {...props}
      />

      <TouchableOpacity style={styles.button} onPress={increment}>
        <Text style={styles.buttonText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 120,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    textAlign: 'center',
    flex: 1,
  },
  button: {
    backgroundColor: '#eee',
    paddingHorizontal: 15,
    paddingVertical: 7,
    marginHorizontal: 5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 22,
    color: '#333',
    fontWeight: 'bold',
  },
});
