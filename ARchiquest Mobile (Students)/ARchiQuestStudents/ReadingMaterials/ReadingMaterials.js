import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';

const ReadingMaterials = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [savedMaterials, setSavedMaterials] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  await fetchMaterials();
  setRefreshing(false);
};

  useEffect(() => {
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };
  getCurrentUser();
}, []);

  useEffect(() => {
    if (user) {
      fetchMaterials();
    }
  }, [user]);

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from('reading_materials')
      .select('id, title')
      .order('created_at', { ascending: false });

    const { data: saved, error: savedError } = await supabase
      .from('saved_reading_materials')
      .select('material_id')
      .eq('user_id', user.id);

    if (!error && !savedError) {
      setMaterials(data);
      setSavedMaterials(new Set(saved.map(item => item.material_id)));
    } else {
      console.error(error || savedError);
    }
    setLoading(false);
  };

  const toggleSaveMaterial = async (material) => {
    if (savedMaterials.has(material.id)) {
      const { error } = await supabase
        .from('saved_reading_materials')
        .delete()
        .eq('user_id', user.id)
        .eq('material_id', material.id);

      if (!error) {
        const updatedSet = new Set(savedMaterials);
        updatedSet.delete(material.id);
        setSavedMaterials(updatedSet);
      }
    } else {
      const { error } = await supabase.from('saved_reading_materials').insert({
        user_id: user.id,
        material_id: material.id,
        title: material.title,
      });

      if (!error) {
        const updatedSet = new Set(savedMaterials);
        updatedSet.add(material.id);
        setSavedMaterials(updatedSet);
      }
    }
  };

  const onBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#176B87" />
      </View>
    );
  }

  return (
    <View style={styles.fullScreen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reading Materials</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#176B87" />
        }
      >
        <View style={styles.row}>
          {materials.map((material) => (
            <View key={material.id} style={styles.cardContainer}>
              <View style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle}>{material.title}</Text>
                  <TouchableOpacity onPress={() => toggleSaveMaterial(material)}>
                    <Ionicons
                      name={savedMaterials.has(material.id) ? 'bookmark' : 'bookmark-outline'}
                      size={22}
                      color="#176B87"
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.cardButton}
                  onPress={() =>
                    navigation.navigate('ReadingMaterialDetails', {
                      materialId: material.id,
                      title: material.title,
                    })
                  }
                >
                  <Text style={styles.cardButtonText}>Read</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#EEF5FF',
  },
  header: {
    height: '8%',
    backgroundColor: '#176B87',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    padding: 12,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#EEF5FF',
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
    height: 150,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#176B87',
    flex: 1,
    marginRight: 10,
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
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReadingMaterials;
