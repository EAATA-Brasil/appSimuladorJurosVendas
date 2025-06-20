import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const EquipamentoSelector = ({
  equipamentos,
  marcas,
  selectedEquipamento,
  onSelect,
  disabledEquipamentos = [],
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredEquipamentos, setFilteredEquipamentos] = useState([]);

  useEffect(() => {
    let result = [...equipamentos];
    
    // Filtro por marca
    if (selectedGrupo) {
      result = result.filter(equip => equip.marca === selectedGrupo);
    }
    
    // Filtro por texto
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(equip => 
        equip.nome.toLowerCase().includes(searchLower) ||
        (equip.codigo && equip.codigo.toLowerCase().includes(searchLower))
      );
    }
    
    // Remover equipamentos já selecionados
    const disabledIds = disabledEquipamentos.map(equip => equip.id);
    result = result.filter(equip => !disabledIds.includes(equip.id));
    
    setFilteredEquipamentos(result);
  }, [selectedGrupo, searchText, equipamentos, disabledEquipamentos]);

  const handleSelect = (equipamento) => {
    onSelect(equipamento);
    setModalVisible(false);
    setSearchText('');
    setSelectedGrupo(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.selectorButton,
          !selectedEquipamento && styles.selectorButtonEmpty
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text 
          style={[
            styles.selectorButtonText,
            !selectedEquipamento && styles.selectorButtonPlaceholder
          ]}
          numberOfLines={1}
        >
          {selectedEquipamento ? selectedEquipamento.nome : 'Selecione um equipamento...'}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="#7f8c8d" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Equipamento</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <MaterialIcons name="close" size={24} color="#2c3e50" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Digite para buscar..."
            placeholderTextColor="#95a5a6"
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
          />

          <ScrollView 
            horizontal 
            style={styles.marcasScroll}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.marcasContainer}
          >
            <TouchableOpacity
              style={[
                styles.marcaButton,
                !selectedGrupo && styles.marcaButtonActive
              ]}
              onPress={() => setSelectedGrupo(null)}
            >
              <Text style={[
                styles.marcaButtonText,
                !selectedGrupo && styles.marcaButtonTextActive
              ]}>
                Todos
              </Text>
            </TouchableOpacity>
            
            {marcas.map(marca => (
              <TouchableOpacity
                key={`marca-${marca.id}`}
                style={[
                  styles.marcaButton,
                  selectedGrupo === marca.id && styles.marcaButtonActive
                ]}
                onPress={() => setSelectedGrupo(marca.id)}
              >
                <Text style={[
                  styles.marcaButtonText,
                  selectedGrupo === marca.id && styles.marcaButtonTextActive
                ]}>
                  {marca.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filteredEquipamentos}
            keyExtractor={(item) => `equip-${item.id}`}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search-off" size={50} color="#bdc3c7" />
                <Text style={styles.emptyText}>
                  {searchText || selectedGrupo 
                    ? "Nenhum equipamento encontrado com esses filtros"
                    : "Todos os equipamentos já foram selecionados"}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.equipamentoItem}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.equipamentoNome}>{item.nome}</Text>
                {item.codigo && (
                  <Text style={styles.equipamentoCodigo}>Código: {item.codigo}</Text>
                )}
                <Text style={styles.equipamentoGrupo}>
                  Marca: {marcas.find(g => g.id === item.marca)?.nome || 'N/A'}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 5,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  selectorButtonEmpty: {
    backgroundColor: '#f1f1f1',
  },
  selectorButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    marginRight: 10,
  },
  selectorButtonPlaceholder: {
    color: '#95a5a6',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 5,
  },
  searchInput: {
    margin: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  marcasScroll: {
    maxHeight: 60,
    marginHorizontal: 15,
  },
  marcasContainer: {
    paddingBottom: 10,
  },
  marcaButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
  },
  marcaButtonActive: {
    backgroundColor: '#3498db',
  },
  marcaButtonText: {
    color: '#7f8c8d',
  },
  marcaButtonTextActive: {
    color: 'white',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
  },
  equipamentoItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  equipamentoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  equipamentoCodigo: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  equipamentoGrupo: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});

export default EquipamentoSelector;