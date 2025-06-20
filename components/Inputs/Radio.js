import { Text, TouchableOpacity, View, StyleSheet } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"

const Radio = ({ options, checkedValue, onChange, containerStyle }) => {
  return (
    <View style={containerStyle}>
      {options.map((option) => {
        const active = checkedValue === option.value
        return (
          <TouchableOpacity
            key={option.value}
            style={styles.optionContainer}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
          >
            <MaterialIcons
              name={active ? "radio-button-checked" : "radio-button-unchecked"}
              size={24}
              color={active ? "#007AFF" : "#999"}
            />
            <Text style={[styles.optionLabel, active && styles.activeLabel]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  optionLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  activeLabel: {
    fontWeight: "bold",
    color: "#007AFF",
  },
})

export default Radio
