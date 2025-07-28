import { Text, TouchableOpacity, View, StyleSheet } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

const Radio = ({ options, checkedValue, onChange, containerStyle, maxWidth }) => {
  
  return (
    
    <View style={[containerStyle,{gap: '40%'} ]}>
      {options.map((option) => {
        const active = checkedValue === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionContainer,
              maxWidth && { maxWidth: maxWidth }
            ]}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
          >
            {/* Radio Button Customizado */}
            <View style={[
              styles.radioButton,
              active && styles.radioButtonActive
            ]}>
              {active && <View style={styles.radioButtonInner} />}
            </View>
            
            <Text style={[styles.optionLabel, active && styles.activeLabel]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Alinha no topo para textos quebrados
    marginVertical: 8,
    alignSelf: 'flex-start', // Ajusta largura ao conteúdo
    maxWidth: '100%', // Permite quebra quando necessário
    flexShrink: 1,
  },
  
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6c757d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2, // Pequeno ajuste para alinhar com texto
  },
  radioButtonActive: {
    borderColor: '#0d6efd',
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#0d6efd',
  },
  optionLabel: {
    fontSize: 16,
    color: '#212529',
    flex: 1, // Permite que o texto use o espaço disponível
    flexWrap: 'wrap', // Permite quebra de linha
  },
  activeLabel: {
    color: '#0d6efd',
    fontWeight: "bold",
  },
});

export default Radio