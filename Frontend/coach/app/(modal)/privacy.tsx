/**
 * Privacy Policy Modal Screen - React Native Version
 * Privacy policy document screen with comprehensive data protection information
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

export default function PrivacyScreen() {
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
          <Text className="text-foreground text-xl font-medium">Privacy Policy</Text>
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
            <Text className="text-foreground text-lg font-medium mb-4">Your Privacy Matters</Text>
            <Text className="text-foreground mb-4">
              At FitLogger Inc., we are committed to protecting your privacy and ensuring 
              the security of your personal information. This Privacy Policy explains how 
              we collect, use, disclose, and safeguard your information when you use our 
              FitLogger mobile application.
            </Text>
            <Text className="text-foreground mb-4">
              We believe in transparency and want you to understand exactly how your data 
              is handled. Please read this policy carefully to understand our practices 
              regarding your personal data.
            </Text>
            <Text className="text-foreground">
              By using FitLogger, you agree to the collection and use of information in 
              accordance with this Privacy Policy.
            </Text>
          </View>

          {/* Information We Collect */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">1. Information We Collect</Text>
            
            <Text className="text-foreground font-medium mb-2">Personal Information</Text>
            <Text className="text-foreground mb-3">
              When you create an account with FitLogger, we may collect personal information 
              that can identify you, including:
            </Text>
            <View className="ml-4 mb-4">
              <Text className="text-foreground mb-1">• Name and email address</Text>
              <Text className="text-foreground mb-1">• Date of birth and gender (optional)</Text>
              <Text className="text-foreground mb-1">• Profile picture (optional)</Text>
              <Text className="text-foreground mb-1">• Height, weight, and fitness goals (optional)</Text>
              <Text className="text-foreground mb-1">• Contact information for customer support</Text>
            </View>

            <Text className="text-foreground font-medium mb-2">Fitness and Health Data</Text>
            <Text className="text-foreground mb-3">
              FitLogger collects fitness-related information to provide our services:
            </Text>
            <View className="ml-4 mb-4">
              <Text className="text-foreground mb-1">• Workout data (exercises, sets, reps, weights)</Text>
              <Text className="text-foreground mb-1">• Activity logs and exercise history</Text>
              <Text className="text-foreground mb-1">• Voice recordings for workout logging (processed locally)</Text>
              <Text className="text-foreground mb-1">• Progress photos (if uploaded)</Text>
              <Text className="text-foreground mb-1">• Notes and personal workout observations</Text>
            </View>

            <Text className="text-foreground font-medium mb-2">Usage and Technical Data</Text>
            <Text className="text-foreground mb-3">
              We automatically collect certain technical information to improve our app:
            </Text>
            <View className="ml-4">
              <Text className="text-foreground mb-1">• Device information (model, operating system, app version)</Text>
              <Text className="text-foreground mb-1">• Usage patterns and feature interactions</Text>
              <Text className="text-foreground mb-1">• Crash reports and error logs</Text>
              <Text className="text-foreground mb-1">• IP address and general location (city/country level)</Text>
              <Text className="text-foreground mb-1">• App performance metrics</Text>
            </View>
          </View>

          {/* How We Use Your Information */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">2. How We Use Your Information</Text>
            <Text className="text-foreground mb-3">
              We use the information we collect for various purposes, including:
            </Text>
            
            <Text className="text-foreground font-medium mb-2">Service Provision</Text>
            <View className="ml-4 mb-4">
              <Text className="text-foreground mb-1">• Providing and maintaining the FitLogger app</Text>
              <Text className="text-foreground mb-1">• Processing and storing your workout data</Text>
              <Text className="text-foreground mb-1">• Enabling voice-to-text workout logging</Text>
              <Text className="text-foreground mb-1">• Generating progress reports and analytics</Text>
              <Text className="text-foreground mb-1">• Syncing data across your devices</Text>
            </View>

            <Text className="text-foreground font-medium mb-2">Communication</Text>
            <View className="ml-4">
              <Text className="text-foreground mb-1">• Sending important app updates and notifications</Text>
              <Text className="text-foreground mb-1">• Responding to customer support inquiries</Text>
              <Text className="text-foreground mb-1">• Providing workout tips and fitness content (optional)</Text>
              <Text className="text-foreground mb-1">• Notifying you about new features or changes</Text>
            </View>
          </View>

          {/* Voice Data and Processing */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">3. Voice Data and Processing</Text>
            <Text className="text-foreground mb-3">
              FitLogger's voice logging feature processes audio data to convert speech to text 
              for workout logging. Here's how we handle voice data:
            </Text>
            <View className="ml-4 mb-4">
              <Text className="text-foreground mb-2"><Text className="font-medium">Local Processing:</Text> Voice data is processed on your device when possible</Text>
              <Text className="text-foreground mb-2"><Text className="font-medium">Temporary Storage:</Text> Audio may be temporarily sent to secure servers for processing</Text>
              <Text className="text-foreground mb-2"><Text className="font-medium">No Permanent Storage:</Text> Voice recordings are not permanently stored</Text>
              <Text className="text-foreground mb-2"><Text className="font-medium">Encrypted Transmission:</Text> All voice data is encrypted during transmission</Text>
              <Text className="text-foreground mb-2"><Text className="font-medium">Opt-out Available:</Text> You can disable voice features at any time</Text>
            </View>
            <Text className="text-foreground">
              We do not use voice data for any purpose other than converting speech to workout data.
            </Text>
          </View>

          {/* Data Security */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">4. Data Security</Text>
            <Text className="text-foreground mb-3">
              We implement robust security measures to protect your personal information:
            </Text>
            <View className="ml-4 mb-4">
              <Text className="text-foreground mb-2"><Text className="font-medium">Encryption:</Text> Data is encrypted both in transit and at rest</Text>
              <Text className="text-foreground mb-2"><Text className="font-medium">Access Controls:</Text> Strict access controls limit who can view your data</Text>
              <Text className="text-foreground mb-2"><Text className="font-medium">Regular Audits:</Text> Security practices are regularly reviewed and updated</Text>
              <Text className="text-foreground mb-2"><Text className="font-medium">Secure Infrastructure:</Text> We use industry-standard secure cloud services</Text>
              <Text className="text-foreground mb-2"><Text className="font-medium">Data Minimization:</Text> We only collect data necessary for app functionality</Text>
            </View>
            <Text className="text-foreground">
              While we strive to protect your personal information, no method of transmission 
              or storage is 100% secure. We cannot guarantee absolute security.
            </Text>
          </View>

          {/* Your Rights and Choices */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">5. Your Rights and Choices</Text>
            <Text className="text-foreground mb-3">
              You have several rights regarding your personal information:
            </Text>

            <Text className="text-foreground font-medium mb-2">Access and Portability</Text>
            <View className="ml-4 mb-4">
              <Text className="text-foreground mb-1">• Request a copy of your personal data</Text>
              <Text className="text-foreground mb-1">• Export your workout data in a portable format</Text>
              <Text className="text-foreground mb-1">• View what information we have about you</Text>
            </View>

            <Text className="text-foreground font-medium mb-2">Deletion and Withdrawal</Text>
            <View className="ml-4">
              <Text className="text-foreground mb-1">• Delete your account and associated data</Text>
              <Text className="text-foreground mb-1">• Request deletion of specific data types</Text>
              <Text className="text-foreground mb-1">• Withdraw consent for optional data collection</Text>
              <Text className="text-foreground mb-1">• Opt out of marketing communications</Text>
            </View>
          </View>

          {/* Data Retention */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">6. Data Retention</Text>
            <Text className="text-foreground mb-3">
              We retain your information for different periods depending on the type of data:
            </Text>
            <View className="ml-4 mb-4">
              <Text className="text-foreground mb-2"><Text className="font-medium">Account Data:</Text> Retained while your account is active</Text>
              <Text className="text-foreground mb-2"><Text className="font-medium">Workout Data:</Text> Retained indefinitely unless you request deletion</Text>
              <Text className="text-foreground mb-2"><Text className="font-medium">Voice Data:</Text> Processed and immediately deleted</Text>
              <Text className="text-foreground mb-2"><Text className="font-medium">Technical Data:</Text> Retained for up to 2 years for analytics</Text>
              <Text className="text-foreground mb-2"><Text className="font-medium">Support Communications:</Text> Retained for 3 years</Text>
            </View>
            <Text className="text-foreground">
              After account deletion, we may retain some data for legal compliance, 
              security purposes, or legitimate business interests.
            </Text>
          </View>

          {/* Children's Privacy */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">7. Children's Privacy</Text>
            <Text className="text-foreground mb-3">
              FitLogger is not intended for children under 13 years of age. We do not 
              knowingly collect personal information from children under 13.
            </Text>
            <Text className="text-foreground">
              Users between 13-18 years old must have parental consent to use FitLogger.
            </Text>
          </View>

          {/* Changes to Privacy Policy */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">8. Changes to This Privacy Policy</Text>
            <Text className="text-foreground mb-3">
              We may update this Privacy Policy from time to time. We will notify you of 
              any material changes by posting the updated policy in the app and updating 
              the "Last updated" date.
            </Text>
            <Text className="text-foreground">
              Your continued use of FitLogger after any changes indicates your acceptance 
              of the updated Privacy Policy.
            </Text>
          </View>

          {/* Contact Us */}
          <View>
            <Text className="text-foreground text-base font-medium mb-3">9. Contact Information</Text>
            <Text className="text-foreground mb-3">
              If you have any questions about this Privacy Policy, please contact us:
            </Text>
            <View className="ml-4">
              <Text className="text-foreground"><Text className="font-medium">Privacy Officer:</Text> privacy@fitlogger.com</Text>
              <Text className="text-foreground"><Text className="font-medium">Data Protection:</Text> dpo@fitlogger.com</Text>
              <Text className="text-foreground mt-2">
                <Text className="font-medium">Address:</Text> FitLogger Inc., 123 Fitness Street, San Francisco, CA 94105
              </Text>
            </View>
          </View>

          {/* Acknowledgment */}
          <View className="pt-4 border-t border-border">
            <Text className="text-muted-foreground text-sm">
              By using FitLogger, you acknowledge that you have read and understood this 
              Privacy Policy and agree to our data practices as described herein.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}