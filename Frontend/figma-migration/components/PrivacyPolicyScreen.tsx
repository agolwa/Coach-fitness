import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

export function PrivacyPolicyScreen({ onBack }: PrivacyPolicyScreenProps) {
  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-border bg-background">
        <button 
          onClick={onBack}
          className="mr-3 p-1 hover:bg-accent rounded-full transition-colors"
        >
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-medium text-foreground">Privacy Policy</h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div 
          className="p-6 space-y-8 text-foreground terms-content"
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            WebkitTouchCallout: 'none',
            WebkitTapHighlightColor: 'transparent'
          }}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        >
          {/* Last Updated */}
          <div className="text-sm text-muted-foreground">
            Last updated: January 15, 2025
          </div>

          {/* Introduction */}
          <section>
            <h2 className="text-lg mb-4">Your Privacy Matters</h2>
            <p className="mb-4">
              At FitLogger Inc., we are committed to protecting your privacy and ensuring 
              the security of your personal information. This Privacy Policy explains how 
              we collect, use, disclose, and safeguard your information when you use our 
              FitLogger mobile application.
            </p>
            <p className="mb-4">
              We believe in transparency and want you to understand exactly how your data 
              is handled. Please read this policy carefully to understand our practices 
              regarding your personal data.
            </p>
            <p>
              By using FitLogger, you agree to the collection and use of information in 
              accordance with this Privacy Policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h3 className="text-base mb-3">1. Information We Collect</h3>
            
            <h4 className="font-medium mb-2">Personal Information</h4>
            <p className="mb-3">
              When you create an account with FitLogger, we may collect personal information 
              that can identify you, including:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
              <li>Name and email address</li>
              <li>Date of birth and gender (optional)</li>
              <li>Profile picture (optional)</li>
              <li>Height, weight, and fitness goals (optional)</li>
              <li>Contact information for customer support</li>
            </ul>

            <h4 className="font-medium mb-2">Fitness and Health Data</h4>
            <p className="mb-3">
              FitLogger collects fitness-related information to provide our services:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
              <li>Workout data (exercises, sets, reps, weights)</li>
              <li>Activity logs and exercise history</li>
              <li>Voice recordings for workout logging (processed locally)</li>
              <li>Progress photos (if uploaded)</li>
              <li>Notes and personal workout observations</li>
            </ul>

            <h4 className="font-medium mb-2">Usage and Technical Data</h4>
            <p className="mb-3">
              We automatically collect certain technical information to improve our app:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Device information (model, operating system, app version)</li>
              <li>Usage patterns and feature interactions</li>
              <li>Crash reports and error logs</li>
              <li>IP address and general location (city/country level)</li>
              <li>App performance metrics</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h3 className="text-base mb-3">2. How We Use Your Information</h3>
            <p className="mb-3">
              We use the information we collect for various purposes, including:
            </p>
            
            <h4 className="font-medium mb-2">Service Provision</h4>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
              <li>Providing and maintaining the FitLogger app</li>
              <li>Processing and storing your workout data</li>
              <li>Enabling voice-to-text workout logging</li>
              <li>Generating progress reports and analytics</li>
              <li>Syncing data across your devices</li>
            </ul>

            <h4 className="font-medium mb-2">Communication</h4>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
              <li>Sending important app updates and notifications</li>
              <li>Responding to customer support inquiries</li>
              <li>Providing workout tips and fitness content (optional)</li>
              <li>Notifying you about new features or changes</li>
            </ul>

            <h4 className="font-medium mb-2">Improvement and Analytics</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Analyzing app usage to improve features</li>
              <li>Identifying and fixing bugs or technical issues</li>
              <li>Developing new features based on user behavior</li>
              <li>Ensuring app security and preventing fraud</li>
            </ul>
          </section>

          {/* Voice Data and Processing */}
          <section>
            <h3 className="text-base mb-3">3. Voice Data and Processing</h3>
            <p className="mb-3">
              FitLogger's voice logging feature processes audio data to convert speech to text 
              for workout logging. Here's how we handle voice data:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong>Local Processing:</strong> Voice data is processed on your device when possible</li>
              <li><strong>Temporary Storage:</strong> Audio may be temporarily sent to secure servers for processing</li>
              <li><strong>No Permanent Storage:</strong> Voice recordings are not permanently stored</li>
              <li><strong>Encrypted Transmission:</strong> All voice data is encrypted during transmission</li>
              <li><strong>Opt-out Available:</strong> You can disable voice features at any time</li>
            </ul>
            <p>
              We do not use voice data for any purpose other than converting speech to workout data.
            </p>
          </section>

          {/* Data Sharing and Disclosure */}
          <section>
            <h3 className="text-base mb-3">4. Data Sharing and Disclosure</h3>
            <p className="mb-3">
              We do not sell, trade, or otherwise transfer your personal information to third 
              parties except in the following circumstances:
            </p>

            <h4 className="font-medium mb-2">Service Providers</h4>
            <p className="mb-3">
              We may share information with trusted third-party service providers who assist 
              us in operating our app, conducting business, or serving users:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
              <li>Cloud storage and backup services</li>
              <li>Analytics and crash reporting services</li>
              <li>Customer support platforms</li>
              <li>Payment processing (for premium features)</li>
            </ul>

            <h4 className="font-medium mb-2">Legal Requirements</h4>
            <p className="mb-3">
              We may disclose your information if required by law or in response to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
              <li>Valid legal processes or government requests</li>
              <li>Protection of our rights, property, or safety</li>
              <li>Protection of users' rights, property, or safety</li>
              <li>Investigation of potential violations of our terms</li>
            </ul>

            <h4 className="font-medium mb-2">Business Transfers</h4>
            <p>
              In the event of a merger, acquisition, or sale of all or part of our business, 
              user information may be transferred as part of the transaction.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h3 className="text-base mb-3">5. Data Security</h3>
            <p className="mb-3">
              We implement robust security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong>Encryption:</strong> Data is encrypted both in transit and at rest</li>
              <li><strong>Access Controls:</strong> Strict access controls limit who can view your data</li>
              <li><strong>Regular Audits:</strong> Security practices are regularly reviewed and updated</li>
              <li><strong>Secure Infrastructure:</strong> We use industry-standard secure cloud services</li>
              <li><strong>Data Minimization:</strong> We only collect data necessary for app functionality</li>
            </ul>
            <p>
              While we strive to protect your personal information, no method of transmission 
              or storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights and Choices */}
          <section>
            <h3 className="text-base mb-3">6. Your Rights and Choices</h3>
            <p className="mb-3">
              You have several rights regarding your personal information:
            </p>

            <h4 className="font-medium mb-2">Access and Portability</h4>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
              <li>Request a copy of your personal data</li>
              <li>Export your workout data in a portable format</li>
              <li>View what information we have about you</li>
            </ul>

            <h4 className="font-medium mb-2">Correction and Updates</h4>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
              <li>Update your profile information anytime</li>
              <li>Correct inaccurate personal data</li>
              <li>Modify your privacy preferences</li>
            </ul>

            <h4 className="font-medium mb-2">Deletion and Withdrawal</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Delete your account and associated data</li>
              <li>Request deletion of specific data types</li>
              <li>Withdraw consent for optional data collection</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <h3 className="text-base mb-3">7. Data Retention</h3>
            <p className="mb-3">
              We retain your information for different periods depending on the type of data:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong>Account Data:</strong> Retained while your account is active</li>
              <li><strong>Workout Data:</strong> Retained indefinitely unless you request deletion</li>
              <li><strong>Voice Data:</strong> Processed and immediately deleted</li>
              <li><strong>Technical Data:</strong> Retained for up to 2 years for analytics</li>
              <li><strong>Support Communications:</strong> Retained for 3 years</li>
            </ul>
            <p>
              After account deletion, we may retain some data for legal compliance, 
              security purposes, or legitimate business interests.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h3 className="text-base mb-3">8. Children's Privacy</h3>
            <p className="mb-3">
              FitLogger is not intended for children under 13 years of age. We do not 
              knowingly collect personal information from children under 13.
            </p>
            <p className="mb-3">
              If you are a parent or guardian and believe your child has provided us with 
              personal information, please contact us immediately. We will take steps to 
              remove such information from our systems.
            </p>
            <p>
              Users between 13-18 years old must have parental consent to use FitLogger.
            </p>
          </section>

          {/* International Data Transfers */}
          <section>
            <h3 className="text-base mb-3">9. International Data Transfers</h3>
            <p className="mb-3">
              FitLogger is based in the United States, and your information may be transferred 
              to and processed in the United States or other countries where our service 
              providers are located.
            </p>
            <p className="mb-3">
              We ensure that such transfers comply with applicable data protection laws and 
              implement appropriate safeguards to protect your personal information.
            </p>
            <p>
              By using FitLogger, you consent to the transfer of your information to 
              countries outside your country of residence.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h3 className="text-base mb-3">10. Changes to This Privacy Policy</h3>
            <p className="mb-3">
              We may update this Privacy Policy from time to time to reflect changes in 
              our practices or legal requirements. We will notify you of any material 
              changes by:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
              <li>Posting the updated policy in the app</li>
              <li>Sending you an email notification</li>
              <li>Displaying a prominent notice in the app</li>
              <li>Updating the "Last updated" date</li>
            </ul>
            <p>
              Your continued use of FitLogger after any changes indicates your acceptance 
              of the updated Privacy Policy.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h3 className="text-base mb-3">11. Contact Information</h3>
            <p className="mb-3">
              If you have any questions, concerns, or requests regarding this Privacy Policy 
              or our data practices, please contact us:
            </p>
            <div className="ml-4 space-y-1 mb-4">
              <p><strong>Privacy Officer:</strong> privacy@fitlogger.com</p>
              <p><strong>Data Protection:</strong> dpo@fitlogger.com</p>
              <p><strong>Mailing Address:</strong></p>
              <div className="ml-4">
                <p>FitLogger Inc.</p>
                <p>Attn: Privacy Department</p>
                <p>123 Fitness Street</p>
                <p>San Francisco, CA 94105</p>
                <p>United States</p>
              </div>
            </div>
            <p>
              We will respond to privacy-related inquiries within 30 days of receipt.
            </p>
          </section>

          {/* Acknowledgment */}
          <section className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              By using FitLogger, you acknowledge that you have read and understood this 
              Privacy Policy and agree to our data practices as described herein.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}