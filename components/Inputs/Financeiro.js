import { useState, useEffect } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';

export default function FinanceiroInput({ 
  value: propValue = '', 
  onValueChange, 
  placeholder = "Qtd.",
  style = {},
  ...props 
}) {
  const [internalValue, setInternalValue] = useState(propValue);

  useEffect(() => {
    if (propValue !== internalValue) {
      setInternalValue(propValue);
    }
  }, [propValue]);

  const formatToCurrency = (value) => {
    const numeric = parseInt(value || '0', 10);
    return Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,  // Sem casas decimais
      maximumFractionDigits: 0,
    }).format(numeric);
  };

  const handleChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setInternalValue(numericValue);
    if (onValueChange) {
      onValueChange(numericValue);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={[styles.input, style]}
        keyboardType="number-pad"
        value={formatToCurrency(internalValue)}
        onChangeText={handleChange}
        placeholder={placeholder}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 80,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    textAlign: 'center',
  },
});
