import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, TextInput, Modal, Image, Alert, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabaseClient';
import { Ionicons } from '@expo/vector-icons';

const Profile = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [savedMaterials, setSavedMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [editedName, setEditedName] = useState('');
  const [editedLastName, setEditedLastName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: userDetails } = await supabase
        .from('users')
        .select('first_name, last_name, email, avatar_url')
        .eq('id', user.id)
        .single();

      setUserInfo(userDetails);
      setEditedName(userDetails?.first_name || '');
      setEditedLastName(userDetails?.last_name || '');


      const { data: designPlans } = await supabase
        .from('design_plan')
        .select('plan_name')
        .eq('student_id', user.id);

      const { data: saved } = await supabase
        .from('saved_reading_materials')
        .select('title')
        .eq('user_id', user.id);

      setUserInfo(userDetails);
      setEditedName(userDetails?.first_name || '');
      setEditedEmail(userDetails?.email || '');
      setAvatarUrl(userDetails?.avatar_url || '');
      setSubmissions(designPlans || []);
      setSavedMaterials(saved || []);
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('users')
      .update({
        first_name: editedName,
        last_name: editedLastName,
        email: editedEmail,
        avatar_url: avatarUrl
      })
      .eq('id', user.id);

    if (error) {
      Alert.alert('Error', 'Failed to update profile');
    } else {
      setEditing(false);
      fetchProfileData();
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const image = result.assets[0];
      const fileExt = image.uri.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const response = await fetch(image.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        Alert.alert('Upload failed');
        return;
      }

      const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(data.publicUrl);
      Alert.alert('Success', 'Profile picture updated');
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#176B87" />
      </View>
    );
  }

  const onBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#176B87" />
      </View>
    );
  }


  return (
        <View style={styles.fullScreen}>
          <View style={styles.header1}>
            <TouchableOpacity onPress={onBack}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={{ width: 24 }} />
          </View>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={64} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.name}>{(userInfo?.first_name || 'Student') + ' ' + (userInfo?.last_name || '')}</Text>
        <Text style={styles.email}>{userInfo?.email || 'N/A'}</Text>
        <TouchableOpacity onPress={() => setEditing(true)} style={styles.editIcon}>
          <Ionicons name="create-outline" size={24} color="#176B87" />
        </TouchableOpacity>
      </View>


      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Submissions</Text>
        {submissions.length > 0 ? (
          submissions.map((item, index) => (
            <Text key={index} style={styles.item}>• {item.plan_name}</Text>
          ))
        ) : (
          <Text style={styles.placeholder}>No submissions yet.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Reading Materials</Text>
        {savedMaterials.length > 0 ? (
          savedMaterials.map((item, index) => (
            <Text key={index} style={styles.item}>• {item.title}</Text>
          ))
        ) : (
          <Text style={styles.placeholder}>No materials saved.</Text>
        )}
      </View>

      <Modal visible={editing} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Full Name"
            />
            <TextInput
              style={styles.input}
              value={editedLastName}
              onChangeText={setEditedLastName}
              placeholder="Last Name"
            />
            <TextInput
              style={styles.input}
              value={editedEmail}
              onChangeText={setEditedEmail}
              placeholder="Email"
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={handleSaveProfile} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditing(false)} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
fullScreen: {
    flex: 1,
    backgroundColor: '#EEF5FF',
  },
  header1: {
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
    backgroundColor: '#EEF5FF' 
  },
content: { padding: 20 },
loader: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' },
header: {
  alignItems: 'center',
  marginBottom: 30,
  paddingVertical: 20,
  backgroundColor: '#fff',
  borderRadius: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
},
avatarContainer: {
  marginBottom: 10,
},
avatar: {
  width: 100,
  height: 100,
  borderRadius: 50,
  borderWidth: 2,
  borderColor: '#176B87',
},
avatarPlaceholder: {
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: '#176B87',
  justifyContent: 'center',
  alignItems: 'center',
},
name: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#176B87',
  marginTop: 8,
},
email: {
  fontSize: 16,
  color: '#666',
  marginBottom: 10,
},
editIcon: {
  position: 'absolute',
  top: 16,
  right: 16,
},
section: { 
  marginBottom: 25 
},
sectionTitle: { 
  fontSize: 18, 
  fontWeight: '600', 
  color: '#176B87', 
  marginBottom: 10 
},
item: { 
  fontSize: 15, 
  color: '#333', 
  marginBottom: 5, 
  marginLeft: 10 
},
placeholder: { 
  fontStyle: 'italic', 
  color: '#888', 
  marginLeft: 10 
},
modalOverlay: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)'
},
modalContent: {
    width: '90%', backgroundColor: 'white', padding: 20,
    borderRadius: 12, elevation: 5, alignItems: 'stretch',
},
input: {
    backgroundColor: '#f3f3f3', padding: 10,
    borderRadius: 8, marginBottom: 12,
},
modalButton: {
    backgroundColor: '#176B87',
    padding: 10, borderRadius: 8, flex: 1, alignItems: 'center',
},
modalButtonText: {
    color: 'white', fontWeight: '600',
},
modalCancel: {
    backgroundColor: '#eee',
    padding: 10, borderRadius: 8, flex: 1, alignItems: 'center',
},
modalCancelText: {
    color: '#333', fontWeight: '600',
},
});

export default Profile;
