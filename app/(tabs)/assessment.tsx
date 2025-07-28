
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Pressable
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AssessmentScreen() {
  const [selectedSection, setSelectedSection] = useState<string>('ybocs');

  const assessmentSections = [
    {
      id: 'ybocs',
      title: 'Y-BOCS Değerlendirmesi',
      description: 'Yale-Brown Obsesif Kompulsif Ölçeği',
      icon: 'clipboard-check',
      color: '#10B981'
    },
    {
      id: 'history',
      title: 'Geçmiş Değerlendirmeler',
      description: 'Önceki test sonuçlarını görüntüle',
      icon: 'history',
      color: '#3B82F6'
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Değerlendirme</Text>
          <Text style={styles.headerSubtitle}>
            OKB semptomlarını değerlendir ve ilerlemeni takip et
          </Text>
        </View>

        {/* Assessment Sections */}
        <View style={styles.sectionsContainer}>
          {assessmentSections.map((section) => (
            <Pressable
              key={section.id}
              style={[
                styles.sectionCard,
                selectedSection === section.id && styles.sectionCardActive
              ]}
              onPress={() => setSelectedSection(section.id)}
            >
              <View style={[styles.sectionIcon, { backgroundColor: `${section.color}20` }]}>
                <MaterialCommunityIcons 
                  name={section.icon as any} 
                  size={32} 
                  color={section.color} 
                />
              </View>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionDescription}>{section.description}</Text>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={20} 
                color="#6B7280" 
              />
            </Pressable>
          ))}
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          {selectedSection === 'ybocs' ? (
            <View style={styles.comingSoonContainer}>
              <MaterialCommunityIcons name="wrench" size={64} color="#F59E0B" />
              <Text style={styles.comingSoonTitle}>Y-BOCS Değerlendirmesi</Text>
              <Text style={styles.comingSoonText}>
                Yale-Brown Obsesif Kompulsif Ölçeği yakında eklenecek.
                Bu özellik üzerinde çalışıyoruz!
              </Text>
            </View>
          ) : (
            <View style={styles.comingSoonContainer}>
              <MaterialCommunityIcons name="history" size={64} color="#3B82F6" />
              <Text style={styles.comingSoonTitle}>Geçmiş Değerlendirmeler</Text>
              <Text style={styles.comingSoonText}>
                Önceki test sonuçlarınız burada görünecek.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter',
  },
  sectionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionCardActive: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  sectionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'Inter',
  },
  contentArea: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  comingSoonContainer: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  comingSoonText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter',
  },
});
