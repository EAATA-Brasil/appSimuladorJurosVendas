import { useState, useEffect, useCallback } from 'react';
import { TextInput, View, StyleSheet, TouchableOpacity, Text } from 'react-native';

export default function FinanceiroInput({
  value: propValue = '',
  onValueChange,
  placeholder = "Qtd.",
  style = {},
  tipoValor,
  valorTotal,
  ...props
}) {
  const [tipoDesconto, setTipoDesconto] = useState(tipoValor || "numero");
  const [displayValue, setDisplayValue] = useState('');
  // Calcula o valor absoluto baseado no valor exibido
  const getAbsoluteValue = useCallback((value) => {
    const numericValue = parseInt(value || '0', 10);

    if (tipoDesconto === "porcentagem") {
      return Math.round((numericValue * valorTotal) / 100);
    }

    return numericValue;
  }, [tipoDesconto, valorTotal]);

  // Atualiza o valor exibido quando o propValue muda
  useEffect(() => {
    setDisplayValue(propValue.toString());
  }, [propValue]);

  const formatDisplayValue = (value) => {
    const numeric = parseInt(value || '0', 10);

    if (tipoDesconto === "porcentagem") {
      return `${numeric}`;
    }

    return Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numeric);
  };

  const handleChange = (text) => {
    
    let numericValue = text.replace(/[^0-9]/g, '');

    // Limita porcentagem a 100
    if (tipoDesconto === "porcentagem") {
      numericValue = Math.min(parseInt(numericValue || '0', 10), 100).toString();
    }

    setDisplayValue(numericValue);
    
    // Só envia o valor absoluto quando o input perde o foco
    // Removemos a chamada imediata do onValueChange
  };

  useEffect(()=>{
    if(tipoDesconto !== 'porcentagem'){
      onValueChange(getAbsoluteValue(displayValue))
    }
  },[displayValue])

  const handleBlur = () => {
    // Quando o input perde o foco, envia o valor absoluto
    onValueChange?.(getAbsoluteValue(displayValue));
  };

  const toggleTipoDesconto = (type) => {
    if (type === tipoDesconto) return;

    // Mantém o mesmo valor absoluto ao trocar o tipo
    const currentAbsoluteValue = getAbsoluteValue(displayValue);
    setTipoDesconto(type);

    // Atualiza o valor exibido para o novo tipo
    if (type === "porcentagem") {
      const percentage = valorTotal > 0 ? Math.round((currentAbsoluteValue / valorTotal) * 100) : 0;
      setDisplayValue(Math.min(percentage, 100).toString());
    } else {
      setDisplayValue(currentAbsoluteValue.toString());
    }

    // Envia o valor absoluto após a troca
    onValueChange?.(currentAbsoluteValue);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        {!tipoValor && (
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                styles.toggleButtonLeft,
                tipoDesconto === "numero" && styles.toggleButtonActive
              ]}
              onPress={() => toggleTipoDesconto("numero")}
            >
              <Text style={[
                styles.toggleText,
                tipoDesconto === "numero" && styles.toggleTextActive
              ]}>
                R$
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                styles.toggleButtonRight,
                tipoDesconto === "porcentagem" && styles.toggleButtonActive
              ]}
              onPress={() => toggleTipoDesconto("porcentagem")}
            >
              <Text style={[
                styles.toggleText,
                tipoDesconto === "porcentagem" && styles.toggleTextActive
              ]}>
                %
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            !tipoValor && { paddingLeft: 60 }
          ]}
          keyboardType="number-pad"
          value={formatDisplayValue(displayValue)}
          onChangeText={handleChange}
          
          onBlur={handleBlur}
          placeholder={placeholder}
          {...props}
        />
      </View>
    </View>
  );
}

// ... (mantenha os mesmos estilos)

const styles = StyleSheet.create({
  container: {
    minWidth: 80,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
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
  toggleContainer: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
    flexDirection: 'row',
    height: 38, // Um pouco menor que o input para alinhar melhor
    marginLeft: 1,
  },
  toggleButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  toggleButtonLeft: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderRightWidth: 0,
  },
  toggleButtonRight: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    borderLeftWidth: 0,
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  toggleText: {
    color: '#333',
    fontSize: 14,
  },
  toggleTextActive: {
    color: 'white',
  },
});


