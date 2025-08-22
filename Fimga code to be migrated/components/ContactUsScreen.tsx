import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface ContactUsScreenProps {
  onBack: () => void;
}

export function ContactUsScreen({ onBack }: ContactUsScreenProps) {
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
        <h1 className="text-xl font-medium text-foreground">Contact Us</h1>
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
          {/* Header */}
          <section>
            <h2 className="text-lg mb-4">Get in Touch</h2>
            <p className="mb-4">
              We're here to help! Whether you have questions about FitLogger, need technical support, 
              or want to share feedback, our team is ready to assist you.
            </p>
            <p>
              Choose the contact method that works best for you, and we'll get back to you as soon as possible.
            </p>
          </section>

          {/* Customer Support */}
          <section>
            <h3 className="text-base mb-3">Customer Support</h3>
            <p className="mb-3">
              For general questions, account issues, or technical support, reach out to our 
              customer support team:
            </p>
            <div className="ml-4 space-y-2 mb-4">
              <p><strong>Email:</strong> support@fitlogger.com</p>
              <p><strong>Phone:</strong> +1 (555) 348-5644</p>
              <p><strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM PST</p>
              <p><strong>Response Time:</strong> Within 24 hours</p>
            </div>
            <p>
              Please include your account email and a detailed description of your issue 
              when contacting support.
            </p>
          </section>

          {/* Technical Support */}
          <section>
            <h3 className="text-base mb-3">Technical Support</h3>
            <p className="mb-3">
              Experiencing bugs, app crashes, or other technical issues? Our technical team 
              can help resolve any problems you're encountering.
            </p>
            <div className="ml-4 space-y-2 mb-4">
              <p><strong>Email:</strong> tech@fitlogger.com</p>
              <p><strong>Priority Support:</strong> +1 (555) 348-8324</p>
              <p><strong>Hours:</strong> 24/7 for critical issues</p>
            </div>
            <p className="mb-3">
              When reporting technical issues, please include:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Your device model and operating system version</li>
              <li>FitLogger app version</li>
              <li>Steps to reproduce the issue</li>
              <li>Screenshots or error messages (if applicable)</li>
            </ul>
          </section>

          {/* Business Inquiries */}
          <section>
            <h3 className="text-base mb-3">Business & Partnership Inquiries</h3>
            <p className="mb-3">
              Interested in partnering with FitLogger or have business-related questions? 
              Contact our business development team.
            </p>
            <div className="ml-4 space-y-2 mb-4">
              <p><strong>Email:</strong> business@fitlogger.com</p>
              <p><strong>Phone:</strong> +1 (555) 348-2874</p>
              <p><strong>LinkedIn:</strong> @FitLoggerBusiness</p>
            </div>
            <p>
              We're always open to exploring new partnerships, integrations, and 
              collaboration opportunities.
            </p>
          </section>

          {/* Feedback & Suggestions */}
          <section>
            <h3 className="text-base mb-3">Feedback & Feature Requests</h3>
            <p className="mb-3">
              Your feedback helps us improve FitLogger! Share your ideas, suggestions, 
              or feature requests with our product team.
            </p>
            <div className="ml-4 space-y-2 mb-4">
              <p><strong>Email:</strong> feedback@fitlogger.com</p>
              <p><strong>Feature Requests:</strong> Available in-app under Profile &gt; Suggest a Feature</p>
              <p><strong>Community Forum:</strong> community.fitlogger.com</p>
            </div>
            <p>
              We review all feedback and prioritize features based on user demand and 
              our product roadmap.
            </p>
          </section>

          {/* Media & Press */}
          <section>
            <h3 className="text-base mb-3">Media & Press</h3>
            <p className="mb-3">
              Media inquiries, press releases, and interview requests should be directed 
              to our media relations team.
            </p>
            <div className="ml-4 space-y-2 mb-4">
              <p><strong>Email:</strong> press@fitlogger.com</p>
              <p><strong>Press Kit:</strong> fitlogger.com/press</p>
              <p><strong>Media Contact:</strong> Sarah Johnson, Communications Director</p>
            </div>
          </section>

          {/* Office Locations */}
          <section>
            <h3 className="text-base mb-3">Office Locations</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Headquarters - San Francisco</h4>
                <div className="ml-4 space-y-1">
                  <p>123 Fitness Street</p>
                  <p>San Francisco, CA 94105</p>
                  <p>United States</p>
                  <p><strong>Phone:</strong> +1 (555) 348-5644</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Development Center - Austin</h4>
                <div className="ml-4 space-y-1">
                  <p>456 Tech Boulevard</p>
                  <p>Austin, TX 78701</p>
                  <p>United States</p>
                  <p><strong>Phone:</strong> +1 (512) 348-9876</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">European Office - London</h4>
                <div className="ml-4 space-y-1">
                  <p>789 Wellness Lane</p>
                  <p>London, EC1A 1AA</p>
                  <p>United Kingdom</p>
                  <p><strong>Phone:</strong> +44 20 7946 0958</p>
                </div>
              </div>
            </div>
          </section>

          {/* Social Media */}
          <section>
            <h3 className="text-base mb-3">Follow Us</h3>
            <p className="mb-3">
              Stay connected with FitLogger on social media for updates, tips, and community features:
            </p>
            <div className="ml-4 space-y-2">
              <p><strong>Twitter:</strong> @FitLoggerApp</p>
              <p><strong>Instagram:</strong> @FitLoggerOfficial</p>
              <p><strong>Facebook:</strong> FitLogger</p>
              <p><strong>YouTube:</strong> FitLogger Tutorials</p>
              <p><strong>LinkedIn:</strong> FitLogger Inc.</p>
            </div>
          </section>

          {/* Response Times */}
          <section>
            <h3 className="text-base mb-3">Expected Response Times</h3>
            <div className="space-y-2">
              <p><strong>Customer Support:</strong> Within 24 hours</p>
              <p><strong>Technical Issues:</strong> Within 12 hours</p>
              <p><strong>Business Inquiries:</strong> Within 48 hours</p>
              <p><strong>Media Requests:</strong> Within 24 hours</p>
              <p><strong>Feedback & Suggestions:</strong> We read all feedback, though individual responses may vary</p>
            </div>
          </section>

          {/* Emergency Contact */}
          <section className="pt-4 border-t border-border">
            <h3 className="text-base mb-3">Emergency Contact</h3>
            <p className="mb-3">
              For critical security issues or urgent matters affecting user safety:
            </p>
            <div className="ml-4 space-y-1">
              <p><strong>Emergency Line:</strong> +1 (555) 911-HELP</p>
              <p><strong>Security Issues:</strong> security@fitlogger.com</p>
              <p><strong>Available:</strong> 24/7</p>
            </div>
          </section>

          {/* Footer Note */}
          <section className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              We value your communication and strive to provide excellent customer service. 
              Thank you for choosing FitLogger for your fitness journey!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}