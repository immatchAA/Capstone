import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  Image,
  Linking,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';

const DesignPlanDetails = ({ route, navigation }) => {
  const { designPlan, classId, classKey } = route.params || {};
  const [isLoading, setIsLoading] = useState(true);
  const [planDetails, setPlanDetails] = useState(null);
  const [error, setError] = useState(null);
  const [budgetSpent, setBudgetSpent] = useState(0);

  useEffect(() => {
    if (designPlan) {
      // If we already have the design plan data, use it
      setPlanDetails(designPlan);
      // Calculate a random spent amount for demo purposes
      // In a real app, this would come from the database
      const randomSpent = Math.floor(Math.random() * (designPlan.budget || 300000) * 0.7);
      setBudgetSpent(randomSpent);
      setIsLoading(false);
    } else if (route.params?.planId) {
      // If we only have the plan ID, fetch the details
      fetchPlanDetails(route.params.planId);
    } else {
      setError("No design plan information provided");
      setIsLoading(false);
    }
  }, [designPlan, route.params]);

  const fetchPlanDetails = async (planId) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('design_plan')
        .select('*')
        .eq('id', planId)
        .single();
        
      if (error) {
        console.error("Error fetching plan details:", error);
        setError(`Failed to load plan details: ${error.message}`);
      } else if (data) {
        setPlanDetails(data);
        // Calculate a random spent amount for demo purposes
        const randomSpent = Math.floor(Math.random() * (data.budget || 300000) * 0.7);
        setBudgetSpent(randomSpent);
      }
    } catch (err) {
      console.error("Exception in fetchPlanDetails:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleViewBudgetDetails = () => {
    // Navigate to a detailed budget breakdown
    Alert.alert(
      "Budget Details",
      "This would show a detailed breakdown of the budget allocation and spending.",
      [{ text: "OK" }]
    );
  };

  const handleOpenDesignFile = () => {
    if (planDetails?.design_file_url) {
      Linking.openURL(planDetails.design_file_url)
        .catch(err => {
          console.error("Error opening design file:", err);
          Alert.alert("Error", "Could not open the design file URL");
        });
    } else {
      Alert.alert("No File", "No design file URL is available for this plan");
    }
  };

  // Format currency with the appropriate symbol
  const formatCurrency = (amount, currency = "PHP") => {
    if (!amount && amount !== 0) return "N/A";
    
    let symbol = "₱"; // Default to Philippine Peso
    
    // Set symbol based on currency code
    switch (currency?.toUpperCase()) {
      case "USD":
        symbol = "$";
        break;
      case "EUR":
        symbol = "€";
        break;
      case "GBP":
        symbol = "£";
        break;
      case "JPY":
        symbol = "¥";
        break;
      case "PHP":
        symbol = "₱";
        break;
      default:
        symbol = "₱"; // Default
    }
    
    // Format with thousand separators
    return `${symbol}${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#176BB7" />
      </View>
    );
  }

  if (error || !planDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorText}>{error || "Failed to load design plan"}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => route.params?.planId ? fetchPlanDetails(route.params.planId) : handleGoBack()}
          >
            <Text style={styles.retryButtonText}>
              {route.params?.planId ? "Retry" : "Go Back"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate remaining budget and percentage
  const budget = planDetails.budget || 300000;
  const currency = planDetails.currency || "PHP";
  const remaining = budget - budgetSpent;
  const spentPercentage = (budgetSpent / budget) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Design Plan Details</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Plan Name and Description */}
          <View style={styles.planHeader}>
            <Text style={styles.planName}>
              {planDetails.title || planDetails.plan_name || "Untitled Design Plan"}
            </Text>
            <Text style={styles.planDescription}>
              {planDetails.description || "No description available for this design plan."}
            </Text>
          </View>

          {/* Budget Status Card */}
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetTitle}>Budget Status</Text>
              <View style={styles.budgetBadge}>
                <Text style={styles.budgetBadgeText}>
                  {formatCurrency(budget, currency)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.budgetSubtitle}>
              Assigned budget from instructor
            </Text>
            
            <View style={styles.budgetDetails}>
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Spent:</Text>
                <Text style={styles.budgetSpent}>
                  {formatCurrency(budgetSpent, currency)}
                </Text>
              </View>
              
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Remaining:</Text>
                <Text style={styles.budgetRemaining}>
                  {formatCurrency(remaining, currency)}
                </Text>
              </View>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${spentPercentage}%` }
                ]} 
              />
            </View>
            
            <TouchableOpacity 
              style={styles.budgetButton}
              onPress={handleViewBudgetDetails}
            >
              <Text style={styles.budgetButtonText}>View Budget Details</Text>
            </TouchableOpacity>
          </View>

          {/* Design File Section */}
          {planDetails.design_file_url && (
            <View style={styles.fileSection}>
              <Text style={styles.sectionTitle}>Design File</Text>
              
              <TouchableOpacity 
                style={styles.fileButton}
                onPress={handleOpenDesignFile}
              >
                <Ionicons name="document-outline" size={24} color="#176BB7" />
                <Text style={styles.fileButtonText}>Open Design File</Text>
              </TouchableOpacity>
              
              <Text style={styles.fileUrl}>{planDetails.design_file_url}</Text>
            </View>
          )}

          {/* Materials Section - Placeholder */}
          <View style={styles.materialsSection}>
            <Text style={styles.sectionTitle}>Materials</Text>
            
            {planDetails.materials ? (
              <View>
                {/* Render materials if available */}
                <Text style={styles.materialsText}>
                  {typeof planDetails.materials === 'string' 
                    ? planDetails.materials 
                    : JSON.stringify(planDetails.materials, null, 2)}
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="construct-outline" size={32} color="#B4D4FF" />
                <Text style={styles.emptyStateText}>
                  No materials information available
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Start Working on Design</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Save for Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF5FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  planHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E4F91',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  budgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E4F91',
  },
  budgetBadge: {
    backgroundColor: '#B4D4FF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  budgetBadgeText: {
    color: '#1E4F91',
    fontWeight: '600',
    fontSize: 14,
  },
  budgetSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  budgetDetails: {
    marginBottom: 12,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#666',
  },
  budgetSpent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  budgetRemaining: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#B4D4FF',
  },
  budgetButton: {
    borderWidth: 1,
    borderColor: '#1E4F91',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  budgetButtonText: {
    color: '#1E4F91',
    fontWeight: '600',
    fontSize: 14,
  },
  fileSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E4F91',
    marginBottom: 16,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF5FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  fileButtonText: {
    color: '#176BB7',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  fileUrl: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  materialsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  materialsText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFF',
    borderRadius: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  actionButtons: {
    marginTop: 8,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#176BB7',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#EEF5FF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#176BB7',
    fontWeight: '600',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#B4D4FF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#1E4F91',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default DesignPlanDetails;