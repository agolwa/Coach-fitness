import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface TermsAndConditionsScreenProps {
  onBack: () => void;
}

export function TermsAndConditionsScreen({ onBack }: TermsAndConditionsScreenProps) {
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
        <h1 className="text-xl font-medium text-foreground">Terms and Conditions</h1>
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
            <h2 className="text-lg mb-4">Welcome to FitLogger</h2>
            <p className="mb-4">
              These Terms and Conditions govern your use of the FitLogger mobile application 
              and services provided by FitLogger Inc. By accessing or using our application, 
              you agree to be bound by these terms.
            </p>
            <p>
              If you disagree with any part of these terms, then you may not access the service.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <h3 className="text-base mb-3">1. Acceptance of Terms</h3>
            <p className="mb-3">
              By downloading, installing, or using the FitLogger application, you acknowledge 
              that you have read, understood, and agree to be bound by these Terms and Conditions 
              and our Privacy Policy.
            </p>
            <p>
              These terms apply to all visitors, users, and others who access or use the service.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h3 className="text-base mb-3">2. Description of Service</h3>
            <p className="mb-3">
              FitLogger is a fitness tracking application that allows users to log workouts, 
              track exercises, monitor progress, and maintain fitness records through voice 
              commands and manual input.
            </p>
            <p className="mb-3">
              The service includes but is not limited to workout logging, exercise databases, 
              progress tracking, voice recognition features, and data synchronization capabilities.
            </p>
            <p>
              We reserve the right to modify, suspend, or discontinue any aspect of the service 
              at any time without prior notice.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h3 className="text-base mb-3">3. User Accounts</h3>
            <p className="mb-3">
              To access certain features of the application, you may be required to create 
              an account. You are responsible for maintaining the confidentiality of your 
              account credentials and for all activities that occur under your account.
            </p>
            <p className="mb-3">
              You agree to provide accurate, current, and complete information during 
              registration and to update such information to keep it accurate, current, 
              and complete.
            </p>
            <p>
              You must immediately notify us of any unauthorized use of your account 
              or any other breach of security.
            </p>
          </section>

          {/* Acceptable Use */}
          <section>
            <h3 className="text-base mb-3">4. Acceptable Use</h3>
            <p className="mb-3">You agree not to use the service to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
              <li>Violate any applicable laws or regulations</li>
              <li>Transmit any harmful, offensive, or inappropriate content</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Attempt to gain unauthorized access to any part of the service</li>
              <li>Use the service for any commercial purpose without authorization</li>
              <li>Upload or transmit viruses or malicious code</li>
            </ul>
            <p>
              We reserve the right to terminate or suspend your account for violations 
              of these acceptable use policies.
            </p>
          </section>

          {/* Privacy and Data */}
          <section>
            <h3 className="text-base mb-3">5. Privacy and Data Protection</h3>
            <p className="mb-3">
              Your privacy is important to us. Our Privacy Policy explains how we collect, 
              use, and protect your information when using our service. By using FitLogger, 
              you consent to our data practices as described in our Privacy Policy.
            </p>
            <p className="mb-3">
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <p>
              You retain ownership of your fitness data and content. We do not claim 
              ownership of your personal workout information.
            </p>
          </section>

          {/* Voice Recognition */}
          <section>
            <h3 className="text-base mb-3">6. Voice Recognition Features</h3>
            <p className="mb-3">
              Our voice recognition features may process and temporarily store audio data 
              to provide accurate workout logging. Audio data is processed securely and 
              is not permanently stored on our servers.
            </p>
            <p className="mb-3">
              Voice recognition accuracy may vary based on environmental conditions, 
              speech patterns, and device capabilities. We do not guarantee perfect 
              accuracy of voice-to-text conversions.
            </p>
            <p>
              You may disable voice features at any time through the application settings.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h3 className="text-base mb-3">7. Intellectual Property Rights</h3>
            <p className="mb-3">
              The FitLogger application and its original content, features, and functionality 
              are owned by FitLogger Inc. and are protected by international copyright, 
              trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="mb-3">
              You may not reproduce, distribute, modify, create derivative works, publicly 
              display, publicly perform, republish, download, store, or transmit any of 
              the material on our service without prior written consent.
            </p>
            <p>
              All trademarks, service marks, and trade names used in the application 
              are trademarks or registered trademarks of their respective owners.
            </p>
          </section>

          {/* Disclaimers */}
          <section>
            <h3 className="text-base mb-3">8. Health and Fitness Disclaimers</h3>
            <p className="mb-3">
              FitLogger is designed for general fitness tracking purposes only and should 
              not be used as a substitute for professional medical advice, diagnosis, 
              or treatment. Always consult with a qualified healthcare provider before 
              starting any exercise program.
            </p>
            <p className="mb-3">
              The application provides general fitness information and tools but cannot 
              provide personalized medical advice. Users assume all risks associated 
              with their exercise routines and fitness activities.
            </p>
            <p>
              We are not responsible for any injuries, health complications, or other 
              adverse effects that may result from using our application or following 
              any fitness recommendations.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h3 className="text-base mb-3">9. Limitation of Liability</h3>
            <p className="mb-3">
              In no event shall FitLogger Inc., its directors, employees, partners, agents, 
              suppliers, or affiliates be liable for any indirect, incidental, special, 
              consequential, or punitive damages, including loss of profits, data, use, 
              goodwill, or other intangible losses.
            </p>
            <p className="mb-3">
              Our total liability to you for all claims arising from your use of the 
              service shall not exceed the amount you paid to us for the service in 
              the twelve months preceding the claim.
            </p>
            <p>
              Some jurisdictions do not allow the exclusion of certain warranties or 
              limitation of liability for consequential damages, so the above limitations 
              may not apply to you.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h3 className="text-base mb-3">10. Termination</h3>
            <p className="mb-3">
              We may terminate or suspend your account and access to the service immediately, 
              without prior notice or liability, for any reason, including breach of these terms.
            </p>
            <p className="mb-3">
              You may also delete your account at any time through the application settings. 
              Upon termination, your right to use the service will cease immediately.
            </p>
            <p>
              Provisions that by their nature should survive termination shall survive, 
              including ownership provisions, warranty disclaimers, indemnity, and 
              limitations of liability.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h3 className="text-base mb-3">11. Governing Law</h3>
            <p className="mb-3">
              These Terms shall be interpreted and governed by the laws of the State of 
              California, United States, without regard to conflict of law provisions.
            </p>
            <p className="mb-3">
              Any disputes arising from these terms or your use of the service shall be 
              resolved through binding arbitration in accordance with the Commercial 
              Arbitration Rules of the American Arbitration Association.
            </p>
            <p>
              The arbitration shall take place in San Francisco, California, and shall 
              be conducted in English.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h3 className="text-base mb-3">12. Changes to Terms</h3>
            <p className="mb-3">
              We reserve the right to modify these Terms and Conditions at any time. 
              We will notify users of any material changes by posting the new terms 
              in the application and updating the "Last updated" date.
            </p>
            <p className="mb-3">
              Your continued use of the service after any such changes constitutes 
              acceptance of the new Terms and Conditions.
            </p>
            <p>
              It is your responsibility to review these terms periodically for changes.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h3 className="text-base mb-3">13. Contact Information</h3>
            <p className="mb-3">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <div className="ml-4 space-y-1">
              <p>Email: legal@fitlogger.com</p>
              <p>Address: 123 Fitness Street, San Francisco, CA 94105</p>
              <p>Phone: +1 (555) FITLOGR</p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              By using FitLogger, you acknowledge that you have read and understood 
              these Terms and Conditions and agree to be bound by them.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}