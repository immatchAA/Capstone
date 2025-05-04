import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.greetingContainer}>
        <Text style={styles.helloText}>Hello,</Text>
        <Text style={styles.helloText}>User</Text>
      </View>

      <View style={styles.subtitleContainer}>
        <View style={styles.line} />
        <Text style={styles.subtitle}>Let's get started</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('UserLogin')}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.buttonOutline} 
        onPress={() => navigation.navigate('UserRegister')}
      >
        <Text style={styles.buttonOutlineText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: '#f5f5f5',
  padding: 20,
  paddingTop: 60,
},

greetingContainer: {
  marginBottom: '60%',
  marginLeft: '5%',
},

helloText: {
  fontSize: 60,
  fontWeight: 'bold',
  color: '#176B87',
},

subtitleContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: '15%',
  alignSelf: 'center',
},

line: {
  flex: 1,
  height: 2,
  backgroundColor: '#ccc',
  marginHorizontal: '1.5%',
},

subtitle: {
  fontSize: 15,
  color: '#555',
},

button: {
  backgroundColor: '#176B87',
  paddingVertical: 15,
  paddingHorizontal: 40,
  borderRadius: 25,
  marginVertical: 10,
  width: '80%',
  alignSelf: 'center',
  alignItems: 'center',
},

buttonText: {
  color: '#fff',
  fontSize: 18,
  fontWeight: '600',
},

buttonOutline: {
  borderColor: '#176B87',
  borderWidth: 1.5,
  paddingVertical: 15,
  paddingHorizontal: 40,
  borderRadius: 25,
  marginVertical: 10,
  width: '80%',
  alignSelf: 'center',
  alignItems: 'center',
},

buttonOutlineText: {
  color: '#176B87',
  fontSize: 18,
  fontWeight: '600',
},

});

export default WelcomeScreen;
