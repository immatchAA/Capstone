import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
//import { Picker } from '@react-native-picker/picker';
import { useNavigation} from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { ref, uploadBytes, getDownloadURL, addDoc} from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';

const DesignPlan = () => {
  const navigation = useNavigation();
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState(5000);
  //const [environment, setEnvironment] = useState('Urban Setting');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
 

  const requestPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
    if (status !== 'granted') {
      alert('Sorry, we need permission to access your media library to continue!');
    }
  };

  

  const handleSave = async () => {
    if (!planName || !description || !selectedFile || !selectedFile.uri) {
      alert('Please complete all fields and upload a valid 3D file.');
      return;
    }
  
    try {
      console.log('📦 Saving:', planName, description, budget, selectedFile);
      
      // Use FileSystem to check the file existence
      const fileUri = selectedFile.uri;
      console.log("📂 File URI:", fileUri);
  
      // Check if the file exists at the given URI
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      console.log("📂 File info:", fileInfo);
      
      if (!fileInfo.exists) {
        alert('The selected file does not exist.');
        return;
      }
  
      // Read the file as a blob using fetch
      const response = await fetch(fileUri);
      const blob = await response.blob();
      
      console.log("📂 Blob created:", blob);
      if (!blob) {
        alert('Error creating file blob. Please try again.');
        return;
      }
  
      // Firebase upload logic
      const fileRef = ref(storage, `3dmodels/${selectedFile.name}`);
      await uploadBytes(fileRef, blob);
  
      // Get the URL for the uploaded file
      const fileURL = await getDownloadURL(fileRef);
    
      // Save metadata to Firestore
      await addDoc(collection(db, 'designPlans'), {
        planName,
        description,
        budget,
        modelURL: fileURL,
        createdAt: new Date(),
      });
  
      alert('✅ Design Plan Saved!');
      console.log('✅ Saved to Firestore:', fileURL);
  
    } catch (error) {
      console.error('❌ Error saving plan:', error);
      alert('Error saving plan. Please try again.');
    }
  };
  
  

  
const pick3DFile = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: false,
    });

    console.log('📦 Full file picker result:', result);

    // Access the file from result.assets[0]
    const file = result.assets && result.assets[0];

    // Check if the file has a valid name and URI
    if (file && file.name && file.uri) {
      // Ensure the file is a valid 3D file type
      const allowedExtensions = ['.glb', '.gltf', '.obj'];
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const isValid = allowedExtensions.includes(`.${fileExtension}`);

      if (!isValid) {
        alert('❌ Invalid file type. Please select a .glb, .gltf, or .obj file.');
        return;
      }

      // If the file is valid, save it
      setSelectedFile(file);
      console.log('✅ Selected file:', file.name);
    } else {
      console.log('❌ No valid file selected.');
      alert('Please select a valid file.');
    }
  } catch (error) {
    console.error('File pick error:', error);
    alert('Failed to select a file.');
  }
};


  
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create Design Plan</Text>

      
      <View style={styles.tabContainer}>
        <Text style={[styles.tab, styles.activeTab]}>Design</Text>

        <TouchableOpacity onPress = {() => navigation.navigate('MaterialsTab')}> 
        <Text style={styles.tab}>Materials</Text>
        </TouchableOpacity>

        <Text style={styles.tab}>Preview</Text>
      </View>

      <Text style={styles.sectionTitle}>Design Plan Details</Text>
      <Text style={styles.sectionSubtitle}>Create a new AR learning experience</Text>

      <Text style={styles.label}>Plan Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter plan name"
        value={planName}
        onChangeText={setPlanName}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Describe the learning objectives"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Budget Allocation</Text>
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={0}
        maximumValue={10000}
        step={100}
        minimumTrackTintColor="#176B87"
        maximumTrackTintColor="#d3d3d3"
        value={budget}
        onValueChange={setBudget}
      />
      <Text style={styles.budgetValue}>₱{budget.toLocaleString()}</Text>

      <Text style = {styles.label}>Upload 3D Model</Text>
      <TouchableOpacity style = {styles.uploadButton} onPress={pick3DFile}>
      <Text style={styles.uploadButtonText}>Choose File</Text>
      </TouchableOpacity>

      {selectedFile && (
        <Text style={styles.fileName}>📁 {selectedFile.name}</Text>
      )}

      <View style={styles.switchRow}>
        <Switch value={isPublic} onValueChange={setIsPublic} />
        <Text style={styles.switchText}>Make this plan public to other instructors</Text>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Design</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f8ff',
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#176B87',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tab: {
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    color: '#7a7a7a',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: '#176B87',
    color: '#176B87',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7a7a7a',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  budgetValue: {
    textAlign: 'right',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#176B87',
    marginBottom: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchText: {
    marginLeft: 10,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#176B87',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  uploadButton: {
  backgroundColor: '#176B87',
  paddingVertical: 10,
  paddingHorizontal: 15,
  borderRadius: 6,
  alignItems: 'center',
  marginBottom: 10,
},
uploadButtonText: {
  color: '#fff',
  fontWeight: 'bold',
},
fileName: {
  fontSize: 14,
  color: '#333',
  marginBottom: 10,
},

});


export default DesignPlan;
