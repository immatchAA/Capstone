import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';

const DesignProgressScreen = ({ route, navigation }) => {
  const { classId, classKey, className } = route.params || {};
  const [isLoading, setIsLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setIsLoading(true);
      
      // This is a placeholder. You'd implement real progress data fetching
      // based on your database schema
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("User not authenticated");
        return;
      }
      
      // Simulate progress data
      // In a real app, fetch this from your database
      setTimeout(() => {
        const mockProgressData = [
          {
            id: 1,
            title: "Initial Design",
            status: "completed",
            completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            progress: 100
          },
          {
            id: 2,
            title: "Design Refinement",
            status: "in_progress",
            completedAt: null,
            progress: 65
          },
          {
            id: 3,
            title: "Final Design",
            status: "not_started",
            completedAt: null,
            progress: 0
          }
        ];
        setProgressData(mockProgressData);
        setIsLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error("Error fetching progress data:", err);
      setError("Failed to load progress data");
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />;
      case 'in_progress':
        return <Ionicons name="time" size={24} color="#FF9800" />;
      case 'not_started':
        return <Ionicons name="ellipse-outline" size={24} color="#999" />;
      default:
        return <Ionicons name="help-circle" size={24} color="#999" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Class Progress</Text>
      </View>

      <View style={styles.subHeader}>
        <Text style={styles.subHeaderTitle}>{className || `Class #${classId}`}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#176BB7" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchProgressData}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.progressContainer}>
            <Text style={styles.sectionTitle}>Your Design Progress</Text>
            
            {progressData.map((item) => (
              <View key={item.id} style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <View style={styles.progressStatus}>
                    {getStatusIcon(item.status)}
                    <Text style={styles.progressTitle}>{item.title}</Text>
                  </View>
                  <Text style={styles.progressPercentage}>{item.progress}%</Text>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${item.progress}%` }
                    ]} 
                  />
                </View>
                
                {item.status === 'completed' && (
                  <Text style={styles.completedDate}>
                    Completed on {new Date(item.completedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
            
            <View style={styles.overallProgress}>
              <Text style={styles.overallTitle}>Overall Completion</Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${progressData.reduce((sum, item) => sum + item.progress, 0) / progressData.length}%`,
                      backgroundColor: '#4CAF50' 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.overallPercentage}>
                {Math.round(progressData.reduce((sum, item) => sum + item.progress, 0) / progressData.length)}%
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF5FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#176BB7',
    height: 60,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 16,
  },
  subHeader: {
    backgroundColor: '#1E4F91',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  subHeaderTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#B4D4FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#1E4F91',
    fontWeight: '600',
    fontSize: 14,
  },
  progressContainer: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#176BB7',
    marginBottom: 16,
  },
  progressItem: {
    marginBottom: 16,
    backgroundColor: '#F8FAFF',
    padding: 16,
    borderRadius: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#176BB7',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#176BB7',
  },
  completedDate: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 8,
  },
  overallProgress: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#EEF5FF',
    borderRadius: 8,
  },
  overallTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E4F91',
    marginBottom: 12,
  },
  overallPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default DesignProgressScreen;