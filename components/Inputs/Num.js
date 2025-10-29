import { useState, useEffect } from 'react';
import { TextInput, View, StyleSheet, TouchableOpacity, Text } from 'react-native';

/**
 * Componente de Input Numérico com botões de Incremento e Decremento.
 * Garante que o valor seja um número dentro dos limites min/max.
 *
 * @param {string|number} [value=''] - O valor numérico controlado (propriedade).
 * @param {Function} onValueChange - Callback chamado com o valor numérico final.
 * @param {string} [placeholder='Qtd.'] - Texto de placeholder.
 * @param {Object} [style={}] - Estilos personalizados para o container.
 * @param {Object} [inputStyle={}] - Estilos personalizados para o TextInput.
 * @param {number} [min=1] - Valor mínimo permitido.
 * @param {number} [max] - Valor máximo permitido (opcional).
 * @param {boolean} [disabled=false] - Se true, desabilita todas as interações.
 * @param {Object} props - Outras props passadas diretamente para o TextInput.
 */
export default function NumericInput({ 
  value: propValue = '', 
  onValueChange, 
  placeholder = "Qtd.",
  style = {},
  inputStyle = {},
  min = 1,
  max,
  disabled = false, // Propriedade para desabilitar o componente
  ...props 
}) {
  // Estado interno para gerenciar o valor exibido no TextInput
  const [internalValue, setInternalValue] = useState(propValue.toString());

  /**
   * Efeito para sincronizar o estado interno com o valor da prop `value`.
   * Isso é essencial para que o componente seja controlado externamente.
   */
  useEffect(() => {
    // Converte a prop para string, tratando valores nulos/indefinidos
    const propStr = (propValue !== undefined && propValue !== null) ? propValue.toString() : '';
    // Atualiza o estado interno apenas se for diferente do valor da prop
    if (propStr !== internalValue) {
      setInternalValue(propStr);
    }
  }, [propValue, internalValue]); // Dependências: propValue e internalValue

  /**
   * Lida com a mudança de texto no TextInput.
   * Remove caracteres não numéricos e atualiza o estado interno e a prop.
   *
   * @param {string} text - O texto digitado.
   */
  const handleChange = (text) => {
    if (disabled) return; // Ignora se desabilitado
    
    // Remove todos os caracteres que não são dígitos
    let numericValue = text.replace(/[^0-9]/g, '');
    setInternalValue(numericValue);
    
    // Chama o callback onValueChange se o valor interno for diferente do valor da prop
    if (onValueChange && numericValue !== propValue) {
      onValueChange(numericValue);
    }
  };

  /**
   * Lida com a perda de foco (onBlur) do TextInput.
   * Aplica a validação de limites (min e max).
   */
  const handleBlur = () => {
    if (disabled) return; // Ignora se desabilitado
    
    // Converte o valor interno para inteiro
    let val = parseInt(internalValue, 10);
    
    // 1. Validação de Mínimo: Se não for um número válido ou for menor que 'min', define como 'min'
    if (isNaN(val) || val < min) {
      val = min;
    }
    
    // 2. Validação de Máximo: Se 'max' estiver definido e o valor for maior, define como 'max'
    if (max !== undefined && val > max) {
      val = max;
    }
    
    // Atualiza o estado interno com o valor validado
    setInternalValue(val.toString());
    
    // Reporta o valor final validado ao componente pai
    if (onValueChange) {
      onValueChange(val);
    }
  };

  /**
   * Função para incrementar o valor.
   */
  const increment = () => {
    if (disabled) return; // Ignora se desabilitado
    
    let val = parseInt(internalValue, 10);
    // Trata o caso de valor inválido no estado interno, definindo-o como (min - 1) para que a próxima linha o incremente para 'min'
    if (isNaN(val)) val = min - 1;
    
    let newVal = val + 1;
    
    // Verifica o limite máximo
    if (max !== undefined && newVal > max) return; // Não faz nada se exceder o máximo
    
    // Atualiza o estado e notifica o componente pai
    setInternalValue(newVal.toString());
    if (onValueChange) {
      onValueChange(newVal);
    }
  };

  /**
   * Função para decrementar o valor.
   */
  const decrement = () => {
    if (disabled) return; // Ignora se desabilitado
    
    let val = parseInt(internalValue, 10);
    // Trata o caso de valor inválido no estado interno, definindo-o como (min + 1) para que a próxima linha o decremente para 'min'
    if (isNaN(val)) val = min + 1;
    
    let newVal = val - 1;
    
    // Verifica o limite mínimo
    if (newVal < min) return; // Não faz nada se for menor que o mínimo
    
    // Atualiza o estado e notifica o componente pai
    setInternalValue(newVal.toString());
    if (onValueChange) {
      onValueChange(newVal);
    }
  };

  // --- Renderização do Componente ---
  return (
    <View style={[styles.container, style]}>
      {/* Botão de Decremento */}
      <TouchableOpacity 
        style={[styles.button, disabled && styles.buttonDisabled]} 
        onPress={decrement}
        disabled={disabled} // Desabilita o botão fisicamente
      >
        <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>−</Text>
      </TouchableOpacity>

      {/* TextInput Central */}
      <TextInput
        style={[styles.input, inputStyle]}
        keyboardType="number-pad" // Teclado numérico
        value={internalValue} // Usa o estado interno
        onChangeText={handleChange} // Lida com a entrada de texto
        onBlur={handleBlur} // Lida com a validação ao perder o foco
        placeholder={placeholder}
        editable={!disabled} // Impede a entrada de texto se desabilitado
        {...props} // Outras props
      />

      {/* Botão de Incremento */}
      <TouchableOpacity 
        style={[styles.button, disabled && styles.buttonDisabled]} 
        onPress={increment}
        disabled={disabled} // Desabilita o botão fisicamente
      >
        <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- Definições de Estilos (StyleSheet) ---
const styles = StyleSheet.create({
  container: {
    minWidth: 120,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    width: '100%',
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
  // Estilos para quando o componente está desabilitado
  buttonDisabled: {
    backgroundColor: '#f5f5f5', // Cor de fundo mais clara
  },
  buttonTextDisabled: {
    color: '#aaa', // Cor do texto mais clara
  },
});
