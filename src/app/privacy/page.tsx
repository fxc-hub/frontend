"use client";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
            <p className="leading-relaxed mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Personal identification information (name, email address, phone number)</li>
              <li>Account credentials and profile information</li>
              <li>Payment and billing information</li>
              <li>Usage data and preferences</li>
              <li>Communication preferences and marketing consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
            <p className="leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Communicate with you about products, services, and events</li>
              <li>Monitor and analyze trends, usage, and activities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Information Sharing</h2>
            <p className="leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
              except as described in this policy. We may share your information with:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Service providers who assist in our operations</li>
              <li>Payment processors for transaction processing</li>
              <li>Legal authorities when required by law</li>
              <li>Business partners with your explicit consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
            <p className="leading-relaxed">
              We implement appropriate security measures to protect your personal information against unauthorized access, 
              alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Cookies and Tracking</h2>
            <p className="leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience on our platform. 
              You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Third-Party Services</h2>
            <p className="leading-relaxed">
              Our platform may contain links to third-party websites or services. We are not responsible for the privacy 
              practices of these external sites. We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Data Retention</h2>
            <p className="leading-relaxed">
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. 
              You may request deletion of your data subject to certain exceptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Your Rights</h2>
            <p className="leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access and update your personal information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request data portability</li>
              <li>Lodge a complaint with supervisory authorities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. International Transfers</h2>
            <p className="leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your data during such transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Children's Privacy</h2>
            <p className="leading-relaxed">
              Our services are not intended for children under 18 years of age. We do not knowingly collect 
              personal information from children under 18.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to This Policy</h2>
            <p className="leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes by posting 
              the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at privacy@fxchub.com
            </p>
          </section>

          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 