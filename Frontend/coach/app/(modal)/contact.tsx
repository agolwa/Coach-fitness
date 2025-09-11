/**
 * Contact Us Modal Screen - React Native Version
 * Contact information and support screen for FitLogger app
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Hooks
import { useUnifiedColors } from '@/hooks/use-unified-theme';
import { showAlert, showError } from '@/utils/alert-utils';

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  const colors = useUnifiedColors();

  // Handle contact methods
  const handleEmailPress = (email: string) => {
    const subject = 'FitLogger App Inquiry';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    Linking.canOpenURL(mailtoUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(mailtoUrl);
        } else {
          showAlert(
            'Email Client Not Available',
            `Please email us directly at: ${email}`,
            [{ text: 'OK' }]
          );
        }
      })
      .catch((error) => {
        console.error('Error opening email client:', error);
        showError('Error', `Please email us at: ${email}`);
      });
  };

  const handlePhonePress = (phoneNumber: string) => {
    const telUrl = `tel:${phoneNumber}`;
    
    Linking.canOpenURL(telUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(telUrl);
        } else {
          showAlert(
            'Phone App Not Available',
            `Please call us at: ${phoneNumber}`,
            [{ text: 'OK' }]
          );
        }
      })
      .catch((error) => {
        console.error('Error opening phone app:', error);
        showError('Error', `Please call us at: ${phoneNumber}`);
      });
  };

  const handleWebsitePress = (url: string) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          showError('Error', 'Cannot open website at this time.');
        }
      })
      .catch((error) => {
        console.error('Error opening website:', error);
        showError('Error', 'Cannot open website at this time.');
      });
  };

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
          <Text className="text-foreground text-xl font-medium">Contact Us</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 space-y-8">
          {/* Header */}
          <View>
            <Text className="text-foreground text-lg font-medium mb-4">Get in Touch</Text>
            <Text className="text-foreground mb-4">
              We're here to help! Whether you have questions about FitLogger, need technical support, 
              or want to share feedback, our team is ready to assist you.
            </Text>
            <Text className="text-foreground">
              Choose the contact method that works best for you, and we'll get back to you as soon as possible.
            </Text>
          </View>

          {/* Customer Support */}
          <View className="bg-card border border-border rounded-xl p-6">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                <Ionicons 
                  name="headset-outline" 
                  size={24} 
                  color={colors.tokens.primary} 
                />
              </View>
              <Text className="text-foreground text-base font-medium">Customer Support</Text>
            </View>
            <Text className="text-foreground mb-4">
              For general questions, account issues, or technical support, reach out to our 
              customer support team:
            </Text>
            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => handleEmailPress('support@fitlogger.com')}
                className="flex-row items-center gap-2"
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="mail-outline" 
                  size={18} 
                  color={colors.tokens.primary} 
                />
                <Text className="text-primary font-medium">support@fitlogger.com</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePhonePress('+15553485644')}
                className="flex-row items-center gap-2"
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="call-outline" 
                  size={18} 
                  color={colors.tokens.primary} 
                />
                <Text className="text-primary font-medium">+1 (555) 348-5644</Text>
              </TouchableOpacity>
              <View className="flex-row items-center gap-2">
                <Ionicons 
                  name="time-outline" 
                  size={18} 
                  color={colors.tokens.mutedForeground} 
                />
                <Text className="text-muted-foreground">Mon-Fri, 9 AM - 6 PM PST</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons 
                  name="timer-outline" 
                  size={18} 
                  color={colors.tokens.mutedForeground} 
                />
                <Text className="text-muted-foreground">Response within 24 hours</Text>
              </View>
            </View>
          </View>

          {/* Technical Support */}
          <View className="bg-card border border-border rounded-xl p-6">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center">
                <Ionicons 
                  name="construct-outline" 
                  size={24} 
                  color="#EA580C" 
                />
              </View>
              <Text className="text-foreground text-base font-medium">Technical Support</Text>
            </View>
            <Text className="text-foreground mb-4">
              Experiencing bugs, app crashes, or other technical issues? Our technical team 
              can help resolve any problems you're encountering.
            </Text>
            <View className="space-y-3 mb-4">
              <TouchableOpacity
                onPress={() => handleEmailPress('tech@fitlogger.com')}
                className="flex-row items-center gap-2"
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="mail-outline" 
                  size={18} 
                  color="#EA580C" 
                />
                <Text style={{ color: '#EA580C' }} className="font-medium">tech@fitlogger.com</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePhonePress('+15553488324')}
                className="flex-row items-center gap-2"
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="call-outline" 
                  size={18} 
                  color="#EA580C" 
                />
                <Text style={{ color: '#EA580C' }} className="font-medium">+1 (555) 348-8324</Text>
              </TouchableOpacity>
              <View className="flex-row items-center gap-2">
                <Ionicons 
                  name="time-outline" 
                  size={18} 
                  color={colors.tokens.mutedForeground} 
                />
                <Text className="text-muted-foreground">24/7 for critical issues</Text>
              </View>
            </View>
            <Text className="text-foreground mb-3">When reporting technical issues, please include:</Text>
            <View className="ml-2 space-y-1">
              <Text className="text-foreground">• Your device model and OS version</Text>
              <Text className="text-foreground">• FitLogger app version</Text>
              <Text className="text-foreground">• Steps to reproduce the issue</Text>
              <Text className="text-foreground">• Screenshots or error messages</Text>
            </View>
          </View>

          {/* Business Inquiries */}
          <View className="bg-card border border-border rounded-xl p-6">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                <Ionicons 
                  name="briefcase-outline" 
                  size={24} 
                  color="#2563EB" 
                />
              </View>
              <Text className="text-foreground text-base font-medium">Business & Partnerships</Text>
            </View>
            <Text className="text-foreground mb-4">
              Interested in partnering with FitLogger or have business-related questions? 
              Contact our business development team.
            </Text>
            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => handleEmailPress('business@fitlogger.com')}
                className="flex-row items-center gap-2"
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="mail-outline" 
                  size={18} 
                  color="#2563EB" 
                />
                <Text style={{ color: '#2563EB' }} className="font-medium">business@fitlogger.com</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePhonePress('+15553482874')}
                className="flex-row items-center gap-2"
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="call-outline" 
                  size={18} 
                  color="#2563EB" 
                />
                <Text style={{ color: '#2563EB' }} className="font-medium">+1 (555) 348-2874</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Feedback & Suggestions */}
          <View className="bg-card border border-border rounded-xl p-6">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
                <Ionicons 
                  name="bulb-outline" 
                  size={24} 
                  color="#059669" 
                />
              </View>
              <Text className="text-foreground text-base font-medium">Feedback & Feature Requests</Text>
            </View>
            <Text className="text-foreground mb-4">
              Your feedback helps us improve FitLogger! Share your ideas, suggestions, 
              or feature requests with our product team.
            </Text>
            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => handleEmailPress('feedback@fitlogger.com')}
                className="flex-row items-center gap-2"
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="mail-outline" 
                  size={18} 
                  color="#059669" 
                />
                <Text style={{ color: '#059669' }} className="font-medium">feedback@fitlogger.com</Text>
              </TouchableOpacity>
              <View className="flex-row items-center gap-2">
                <Ionicons 
                  name="star-outline" 
                  size={18} 
                  color={colors.tokens.mutedForeground} 
                />
                <Text className="text-muted-foreground">Feature requests available in-app</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleWebsitePress('https://community.fitlogger.com')}
                className="flex-row items-center gap-2"
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="globe-outline" 
                  size={18} 
                  color="#059669" 
                />
                <Text style={{ color: '#059669' }} className="font-medium">community.fitlogger.com</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Office Locations */}
          <View>
            <Text className="text-foreground text-base font-medium mb-4">Office Locations</Text>
            
            <View className="space-y-4">
              <View className="bg-card border border-border rounded-xl p-6">
                <Text className="text-foreground font-medium mb-3">Headquarters - San Francisco</Text>
                <View className="space-y-1">
                  <Text className="text-muted-foreground">123 Fitness Street</Text>
                  <Text className="text-muted-foreground">San Francisco, CA 94105</Text>
                  <Text className="text-muted-foreground">United States</Text>
                  <TouchableOpacity
                    onPress={() => handlePhonePress('+15553485644')}
                    className="flex-row items-center gap-2 mt-2"
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="call-outline" 
                      size={16} 
                      color={colors.tokens.primary} 
                    />
                    <Text className="text-primary">+1 (555) 348-5644</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="bg-card border border-border rounded-xl p-6">
                <Text className="text-foreground font-medium mb-3">Development Center - Austin</Text>
                <View className="space-y-1">
                  <Text className="text-muted-foreground">456 Tech Boulevard</Text>
                  <Text className="text-muted-foreground">Austin, TX 78701</Text>
                  <Text className="text-muted-foreground">United States</Text>
                  <TouchableOpacity
                    onPress={() => handlePhonePress('+15123489876')}
                    className="flex-row items-center gap-2 mt-2"
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="call-outline" 
                      size={16} 
                      color={colors.tokens.primary} 
                    />
                    <Text className="text-primary">+1 (512) 348-9876</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Social Media */}
          <View>
            <Text className="text-foreground text-base font-medium mb-4">Follow Us</Text>
            <Text className="text-foreground mb-4">
              Stay connected with FitLogger on social media for updates, tips, and community features:
            </Text>
            <View className="bg-card border border-border rounded-xl p-6">
              <View className="space-y-3">
                <View className="flex-row items-center gap-2">
                  <Ionicons 
                    name="logo-twitter" 
                    size={18} 
                    color="#1DA1F2" 
                  />
                  <Text className="text-foreground">@FitLoggerApp</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Ionicons 
                    name="logo-instagram" 
                    size={18} 
                    color="#E4405F" 
                  />
                  <Text className="text-foreground">@FitLoggerOfficial</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Ionicons 
                    name="logo-facebook" 
                    size={18} 
                    color="#1877F2" 
                  />
                  <Text className="text-foreground">FitLogger</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Ionicons 
                    name="logo-youtube" 
                    size={18} 
                    color="#FF0000" 
                  />
                  <Text className="text-foreground">FitLogger Tutorials</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Emergency Contact */}
          <View className="bg-destructive/10 border border-destructive/20 rounded-xl p-6">
            <View className="flex-row items-center gap-3 mb-3">
              <Ionicons 
                name="warning-outline" 
                size={24} 
                color={colors.tokens.destructive} 
              />
              <Text className="text-destructive text-base font-medium">Emergency Contact</Text>
            </View>
            <Text className="text-foreground mb-3">
              For critical security issues or urgent matters affecting user safety:
            </Text>
            <View className="space-y-2">
              <TouchableOpacity
                onPress={() => handlePhonePress('+1555911HELP')}
                className="flex-row items-center gap-2"
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="call-outline" 
                  size={18} 
                  color={colors.tokens.destructive} 
                />
                <Text className="text-destructive font-medium">+1 (555) 911-HELP</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleEmailPress('security@fitlogger.com')}
                className="flex-row items-center gap-2"
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="mail-outline" 
                  size={18} 
                  color={colors.tokens.destructive} 
                />
                <Text className="text-destructive font-medium">security@fitlogger.com</Text>
              </TouchableOpacity>
              <View className="flex-row items-center gap-2">
                <Ionicons 
                  name="time-outline" 
                  size={18} 
                  color={colors.tokens.mutedForeground} 
                />
                <Text className="text-muted-foreground">Available 24/7</Text>
              </View>
            </View>
          </View>

          {/* Footer Note */}
          <View className="pt-4 border-t border-border">
            <Text className="text-muted-foreground text-sm text-center">
              We value your communication and strive to provide excellent customer service. 
              Thank you for choosing FitLogger for your fitness journey!
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}