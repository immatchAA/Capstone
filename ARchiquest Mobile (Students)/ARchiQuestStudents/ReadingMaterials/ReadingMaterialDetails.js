import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // or 'react-native-vector-icons/Ionicons'
import Markdown from 'react-native-markdown-display';
import { supabase } from '../supabaseClient';

const ReadingMaterialDetails = ({ route, navigation }) => {
  const { materialId, title } = route.params;
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      const { data, error } = await supabase
        .from('reading_material_sections')
        .select('section_slug, content')
        .eq('reading_material_id', materialId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching sections:', error);
      } else {
        setSections(data);
      }
      setLoading(false);
    };

    fetchSections();
  }, [materialId]);

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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, index) => (
          <View key={index}>
            <Text style={styles.sectionTitle}>
              {section.section_slug.replace(/_/g, ' ')}
            </Text>
            <View style={styles.card}>
              <Markdown
                style={markdownStyles}
                rules={{
                  paragraph: (node, children, parent, styles) => (
                    <Text
                      key={node.key}
                      style={[styles.paragraph, { textAlign: 'justify' }]}
                    >
                      {children?.length ? children : node.content}
                    </Text>
                  ),
                  text: (node, children, parent, styles) => (
                    <Text
                      key={node.key}
                      style={[styles.text, { textAlign: 'justify' }]}
                    >
                      {children?.length ? children : node.content}
                    </Text>
                  ),
                }}
              >
                {section.content || 'No content'}
              </Markdown>
            </View>
          </View>
        ))}
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
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    padding: 12,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#176B87',
    marginVertical: 16,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#EEF5FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const markdownStyles = {
  body: {
    color: '#176B87',
    fontSize: 16,
    lineHeight: 24,
  },
  paragraph: {
    color: '#176B87',
    fontSize: 16,
    lineHeight: 24,
  },
  text: {
    color: '#176B87',
  },
  bullet_list: {
    marginVertical: 8,
  },
  list_item: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  link: {
    color: '#0A84FF',
    textDecorationLine: 'underline',
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
};

export default ReadingMaterialDetails;
