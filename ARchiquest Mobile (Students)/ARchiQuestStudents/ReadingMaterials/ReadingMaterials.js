import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const ReadingMaterials = ({ navigation }) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContentContainer}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled={true}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.row}>
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Modern Architectural Principles</Text>
            <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('ModernArchPrinciples')}>
              <Text style={styles.cardButtonText}>Read</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Urban Planning Fundamentals</Text>
            <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('UrbanPlanningFundamentals')}>
              <Text style={styles.cardButtonText}>Read</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sustainable Building Design</Text>
            <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('SustainableBuildingDesign')}>
              <Text style={styles.cardButtonText}>Read</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Building Materials and Technologies</Text>
            <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('BuildingMaterials')}>
              <Text style={styles.cardButtonText}>Read</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Building Information Modeling (BIM)</Text>
            <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('BuildingInfoModeling')}>
              <Text style={styles.cardButtonText}>Read</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Smart Building Technologies</Text>
            <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('SmartBuildingTechs')}>
              <Text style={styles.cardButtonText}>Read</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Energy-Efficient Building Design</Text>
            <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('EnergyEfficientBuilding')}>
              <Text style={styles.cardButtonText}>Read</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Green Building Certifications</Text>
            <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('GreenBuildingCert')}>
              <Text style={styles.cardButtonText}>Read</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Renewable Energy Systems in Buildings</Text>
            <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('RenewableEnergySystems')}>
              <Text style={styles.cardButtonText}>Read</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Fire Safety and Building Codes</Text>
            <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate('FireSafety')}>
              <Text style={styles.cardButtonText}>Read</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF5FF',
    padding: 20,
    paddingTop: 30,
  },
  scrollContentContainer: {
    paddingBottom: '30%',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    height: 180,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#176B87',
    marginBottom: 10,
  },
  cardButton: {
    backgroundColor: '#176B87',
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: 'center',
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '250',
  },
});

export default ReadingMaterials;
