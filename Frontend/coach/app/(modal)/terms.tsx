/**
 * Terms and Conditions Modal Screen - React Native Version
 * Legal document screen with comprehensive terms for the FitLogger app
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Hooks
import { useUnifiedColors } from '@/hooks/use-unified-theme';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useUnifiedColors();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-4 flex-shrink-0 border-b border-border">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -m-2 rounded-lg mr-3"
            activeOpacity={0.7}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={colors.tokens.foreground} 
            />
          </TouchableOpacity>
          <Text className="text-foreground text-xl font-medium">Terms and Conditions</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 space-y-8">
          {/* Last Updated */}
          <Text className="text-muted-foreground text-sm">
            Last updated: January 15, 2025
          </Text>

          {/* Introduction */}
          <View>
            <Text className="text-foreground text-lg font-medium mb-4">Welcome to FitLogger</Text>
            <Text className="text-foreground mb-4">
              These Terms and Conditions govern your use of the FitLogger mobile application 
              and services provided by FitLogger Inc. By accessing or using our application, 
              you agree to be bound by these terms.
            </Text>
            <Text className="text-foreground">
              If you disagree with any part of these terms, then you may not access the service.
            </Text>
          </View>

          {/* Acceptance of Terms */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">1. Acceptance of Terms</Text>
            <Text className="text-foreground mb-3">
              By downloading, installing, or using the FitLogger application, you acknowledge 
              that you have read, understood, and agree to be bound by these Terms and Conditions 
              and our Privacy Policy.
            </Text>
            <Text className="text-foreground">
              These terms apply to all visitors, users, and others who access or use the service.
            </Text>
          </View>

          {/* Description of Service */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">2. Description of Service</Text>
            <Text className="text-foreground mb-3">
              FitLogger is a fitness tracking application that allows users to log workouts, 
              track exercises, monitor progress, and maintain fitness records through voice 
              commands and manual input.
            </Text>
            <Text className="text-foreground mb-3">
              The service includes but is not limited to workout logging, exercise databases, 
              progress tracking, voice recognition features, and data synchronization capabilities.
            </Text>
            <Text className="text-foreground">
              We reserve the right to modify, suspend, or discontinue any aspect of the service 
              at any time without prior notice.
            </Text>
          </View>

          {/* User Accounts */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">3. User Accounts</Text>
            <Text className="text-foreground mb-3">
              To access certain features of the application, you may be required to create 
              an account. You are responsible for maintaining the confidentiality of your 
              account credentials and for all activities that occur under your account.
            </Text>
            <Text className="text-foreground mb-3">
              You agree to provide accurate, current, and complete information during 
              registration and to update such information to keep it accurate, current, 
              and complete.
            </Text>
            <Text className="text-foreground">
              You must immediately notify us of any unauthorized use of your account 
              or any other breach of security.
            </Text>
          </View>

          {/* Acceptable Use */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">4. Acceptable Use</Text>
            <Text className="text-foreground mb-3">You agree not to use the service to:</Text>
            <View className="ml-4 mb-3">
              <Text className="text-foreground mb-2">• Violate any applicable laws or regulations</Text>
              <Text className="text-foreground mb-2">• Transmit any harmful, offensive, or inappropriate content</Text>
              <Text className="text-foreground mb-2">• Interfere with or disrupt the service or servers</Text>
              <Text className="text-foreground mb-2">• Attempt to gain unauthorized access to any part of the service</Text>
              <Text className="text-foreground mb-2">• Use the service for any commercial purpose without authorization</Text>
              <Text className="text-foreground mb-2">• Upload or transmit viruses or malicious code</Text>
            </View>
            <Text className="text-foreground">
              We reserve the right to terminate or suspend your account for violations 
              of these acceptable use policies.
            </Text>
          </View>

          {/* Privacy and Data */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">5. Privacy and Data Protection</Text>
            <Text className="text-foreground mb-3">
              Your privacy is important to us. Our Privacy Policy explains how we collect, 
              use, and protect your information when using our service. By using FitLogger, 
              you consent to our data practices as described in our Privacy Policy.
            </Text>
            <Text className="text-foreground mb-3">
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </Text>
            <Text className="text-foreground">
              You retain ownership of your fitness data and content. We do not claim 
              ownership of your personal workout information.
            </Text>
          </View>

          {/* Voice Recognition */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">6. Voice Recognition Features</Text>
            <Text className="text-foreground mb-3">
              Our voice recognition features may process and temporarily store audio data 
              to provide accurate workout logging. Audio data is processed securely and 
              is not permanently stored on our servers.
            </Text>
            <Text className="text-foreground mb-3">
              Voice recognition accuracy may vary based on environmental conditions, 
              speech patterns, and device capabilities. We do not guarantee perfect 
              accuracy of voice-to-text conversions.
            </Text>
            <Text className="text-foreground">
              You may disable voice features at any time through the application settings.
            </Text>
          </View>

          {/* Health Disclaimers */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">7. Health and Fitness Disclaimers</Text>
            <Text className="text-foreground mb-3">
              FitLogger is designed for general fitness tracking purposes only and should 
              not be used as a substitute for professional medical advice, diagnosis, 
              or treatment. Always consult with a qualified healthcare provider before 
              starting any exercise program.
            </Text>
            <Text className="text-foreground mb-3">
              The application provides general fitness information and tools but cannot 
              provide personalized medical advice. Users assume all risks associated 
              with their exercise routines and fitness activities.
            </Text>
            <Text className="text-foreground">
              We are not responsible for any injuries, health complications, or other 
              adverse effects that may result from using our application or following 
              any fitness recommendations.
            </Text>
          </View>

          {/* Limitation of Liability */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">8. Limitation of Liability</Text>
            <Text className="text-foreground mb-3">
              In no event shall FitLogger Inc., its directors, employees, partners, agents, 
              suppliers, or affiliates be liable for any indirect, incidental, special, 
              consequential, or punitive damages, including loss of profits, data, use, 
              goodwill, or other intangible losses.
            </Text>
            <Text className="text-foreground">
              Some jurisdictions do not allow the exclusion of certain warranties or 
              limitation of liability for consequential damages, so the above limitations 
              may not apply to you.
            </Text>
          </View>

          {/* Termination */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">9. Termination</Text>
            <Text className="text-foreground mb-3">
              We may terminate or suspend your account and access to the service immediately, 
              without prior notice or liability, for any reason, including breach of these terms.
            </Text>
            <Text className="text-foreground mb-3">
              You may also delete your account at any time through the application settings. 
              Upon termination, your right to use the service will cease immediately.
            </Text>
            <Text className="text-foreground">
              Provisions that by their nature should survive termination shall survive, 
              including ownership provisions, warranty disclaimers, indemnity, and 
              limitations of liability.
            </Text>
          </View>

          {/* Changes to Terms */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">10. Changes to Terms</Text>
            <Text className="text-foreground mb-3">
              We reserve the right to modify these Terms and Conditions at any time. 
              We will notify users of any material changes by posting the new terms 
              in the application and updating the "Last updated" date.
            </Text>
            <Text className="text-foreground">
              Your continued use of the service after any such changes constitutes 
              acceptance of the new Terms and Conditions.
            </Text>
          </View>

          {/* Contact Information */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">11. Contact Information</Text>
            <Text className="text-foreground mb-3">
              If you have any questions about these Terms and Conditions, please contact us at:
            </Text>
            <View className="ml-4">
              <Text className="text-foreground">Email: legal@fitlogger.com</Text>
              <Text className="text-foreground">Address: 123 Fitness Street, San Francisco, CA 94105</Text>
              <Text className="text-foreground">Phone: +1 (555) FITLOGR</Text>
            </View>
          </View>

          {/* Acknowledgment */}
          <View className="pt-4 border-t border-border">
            <Text className="text-muted-foreground text-sm">
              By using FitLogger, you acknowledge that you have read and understood 
              these Terms and Conditions and agree to be bound by them.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}