import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const materialData = {
  Structural: ['Concrete Foundation', 'Steel Beams'],
  Finishing: ['Tile Flooring', 'Wall Paint'],
  Roofing: ['Metal Roof', 'Concrete Slab'],
  Insulation: ['Foam Panels', 'Fiberglass Sheets'],
};

const pricePerUnit = 250;

const MaterialsTab = () => {
  const [category, setCategory] = useState('Structural');
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  const handleAdd = (material) => {
    if (!selectedMaterials.includes(material)) {
      setSelectedMaterials([...selectedMaterials, material]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Material Selection</Text>
      <Text style={styles.subtitle}>Choose virtual building materials for AR activities</Text>
      
      {/* Tab Buttons */}
      <View style={styles.tabRow}>
        {Object.keys(materialData).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.tab, category === cat && styles.activeTab]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.tabText, category === cat && styles.activeTabText]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Material List */}
      <FlatList
        data={materialData[category]}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.materialCard}>
            <Text style={styles.materialName}>{item}</Text>
            <Text style={styles.materialPrice}>₱{pricePerUnit} per unit</Text>
            <TouchableOpacity onPress={() => handleAdd(item)} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Selected Materials */}
      <Text style={styles.sectionTitle}>Selected Materials</Text>
      {selectedMaterials.map((mat, index) => (
        <View key={index} style={styles.selectedItem}>
          <Text style={styles.selectedText}>{mat}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFF',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#176B87',
  },
  subtitle: {
    fontSize: 14,
    color: '#7a7a7a',
    marginBottom: 10,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#176B87',
  },
  tabText: {
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  materialCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  materialName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  materialPrice: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  addButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#176B87',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#176B87',
  },
  selectedItem: {
    backgroundColor: '#e6f2f8',
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
  },
  selectedText: {
    fontSize: 14,
    color: '#333',
  },
});

export default MaterialsTab;
