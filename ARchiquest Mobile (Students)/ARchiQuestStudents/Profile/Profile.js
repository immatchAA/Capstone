import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView } from 'react-native';
import { supabase } from '../supabaseClient'; // Import Supabase client
import * as ImagePicker from 'expo-image-picker';

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
            source={require('../assets/default-profile.jpg')}
            style={styles.profileImage}
          />
        )}

        {/* Change Profile Picture Button */}
        <TouchableOpacity onPress={pickImage} style={styles.changeImageButton}>
          <Text style={styles.changeImageText}>Change Profile Picture</Text>
        </TouchableOpacity>

        {/* User Info */}
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
          style={styles.input}
          placeholder="Bio"
          value={bio}
          onChangeText={setBio}
          multiline
        />

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
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  changeImageButton: {
    backgroundColor: '#B4D4FF',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  changeImageText: {
    color: '#176B87',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    width: '100%',
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#176B87',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Profile;
