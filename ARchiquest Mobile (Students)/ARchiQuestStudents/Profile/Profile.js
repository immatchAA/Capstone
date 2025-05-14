import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView } from 'react-native';
import { supabase } from '../supabaseClient'; // Import Supabase client
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for camera icon

const Profile = () => {
  const [user, setUser] = useState(null); // State to store user data
  const [loading, setLoading] = useState(true);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [bio, setBio] = useState('');

  // Fetch user profile data when the component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user:', error.message);
        return;
      }

      setUser(data?.user || null);
      setNewFullName(data?.user_metadata?.full_name || '');
      setNewEmail(data?.email || '');
      setBio(data?.user_metadata?.bio || '');
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  // Handle profile image picking
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setProfileImage(result.uri);
    }
  };

  // Update user profile
  const updateProfile = async () => {
    try {
      let updatedUser = {
        full_name: newFullName,
        email: newEmail,
        bio: bio,
      };

      // If a profile image is selected, upload the image and update the profile picture
      if (profileImage) {
        const fileExt = profileImage.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { data, error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(fileName, { uri: profileImage });

        if (uploadError) {
          throw new Error('Failed to upload image');
        }

        const imageUrl = data?.path
          ? `${supabase.storage.url}/profile-pictures/${data.path}`
          : null;

        updatedUser.profile_picture = imageUrl;
      }

      // Update user profile in Supabase
      const { error } = await supabase.auth.updateUser(updatedUser);

      if (error) {
        throw new Error(error.message);
      }

      alert('Profile updated successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No user data available. Please log in.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        {/* Profile Image */}
        {profileImage || user?.user_metadata?.profile_picture ? (
          <Image
            source={{ uri: profileImage || user?.user_metadata?.profile_picture }}
            style={styles.profileImage}
          />
        ) : (
          <Image
            source={require('../assets/default-profile.jpg')} // Correct path to your local image
            style={styles.profileImage}
          />
        )}

        {/* Change Profile Picture Button with Camera Icon */}
        <TouchableOpacity onPress={pickImage} style={styles.changeImageButton}>
          <Ionicons name="camera" size={24} color="#176B87" /> {/* Smaller camera icon */}
        </TouchableOpacity>

        {/* User Info */}
        <View style={styles.userInfo}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={newFullName}
            onChangeText={setNewFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={newEmail}
            onChangeText={setNewEmail}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Bio"
            value={bio}
            onChangeText={setBio}
            multiline
          />
        </View>

        {/* Save Profile Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={updateProfile}>
          <Text style={styles.buttonText}>Save Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          // Log out functionality
          supabase.auth.signOut();
          alert('Logged out successfully');
        }}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f7',
    justifyContent: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 15,
  },
  changeImageButton: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#B4D4FF',
    marginTop: 10,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeImageText: {
    color: '#176B87',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#176B87',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Profile;
