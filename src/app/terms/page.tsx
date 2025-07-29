"use client";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-center mb-8">Terms and Conditions</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using FXCHub ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Age Requirement</h2>
            <p className="leading-relaxed">
              You must be at least 18 years old to use this Platform. By registering, you confirm that you are 18 years of age or older.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Account Registration</h2>
            <p className="leading-relaxed">
              You are responsible for maintaining the confidentiality of your account information and password. 
              You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Trading Risks</h2>
            <p className="leading-relaxed">
              Trading in financial markets involves substantial risk of loss and is not suitable for all investors. 
              The value of investments can go down as well as up. Past performance is not indicative of future results.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. No Investment Advice</h2>
            <p className="leading-relaxed">
              The information provided on this Platform is for educational and informational purposes only. 
              It does not constitute investment advice, financial advice, or any other type of advice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Subscription Services</h2>
            <p className="leading-relaxed">
              Premium features require a paid subscription. Subscription fees are non-refundable unless otherwise stated. 
              We reserve the right to modify subscription terms and pricing with appropriate notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Prohibited Activities</h2>
            <p className="leading-relaxed">
              You agree not to use the Platform for any unlawful purpose or to solicit others to perform unlawful acts. 
              You may not use the Platform to transmit viruses or other malicious code.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Intellectual Property</h2>
            <p className="leading-relaxed">
              All content on this Platform, including but not limited to text, graphics, logos, and software, 
              is the property of FXCHub and is protected by copyright laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
            <p className="leading-relaxed">
              FXCHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
              resulting from your use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Termination</h2>
            <p className="leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice, for any reason, 
              including breach of these Terms and Conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
            <p className="leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
              Your continued use of the Platform constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Information</h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us at support@fxchub.com
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