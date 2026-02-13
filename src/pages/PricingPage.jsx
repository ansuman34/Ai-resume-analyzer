import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Background from "../components/Background";
import "../styles/pricing-page.css";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const plans = [
    {
      id: 1,
      name: "Starter",
      description: "Perfect for getting started",
      price: isAnnual ? 99 : 9,
      period: "month",
      highlighted: false,
      features: [
        "5 Resume Uploads",
        "Basic ATS Analysis",
        "1 Template Access",
        "Resume Scoring",
        "Email Support"
      ],
      notIncluded: [
        "AI Content Suggestions",
        "Priority Support",
        "Advanced Analytics"
      ]
    },
    {
      id: 2,
      name: "Professional",
      description: "Most popular choice",
      price: isAnnual ? 299 : 29,
      period: "month",
      highlighted: true,
      badge: "MOST POPULAR",
      features: [
        "Unlimited Resume Uploads",
        "Advanced ATS Analysis",
        "All 10 Templates",
        "Resume Scoring & Feedback",
        "AI Content Suggestions",
        "Priority Email Support",
        "Interview Tips"
      ],
      notIncluded: [
        "1-on-1 Coaching",
        "Custom Branding"
      ]
    },
    {
      id: 3,
      name: "Premium",
      description: "For serious job seekers",
      price: isAnnual ? 599 : 59,
      period: "month",
      highlighted: false,
      features: [
        "Everything in Professional",
        "1-on-1 Career Coaching",
        "Cover Letter Generator",
        "LinkedIn Optimization",
        "Phone Support",
        "Job Match Recommendations",
        "Custom Resume Branding"
      ],
      notIncluded: [
        "Team Management"
      ]
    },
    {
      id: 4,
      name: "Enterprise",
      description: "For teams and organizations",
      price: "Custom",
      period: "contact us",
      highlighted: false,
      features: [
        "Everything in Premium",
        "Team Management (50+ members)",
        "Admin Dashboard",
        "Custom Integrations",
        "Dedicated Account Manager",
        "Advanced Analytics & Reporting",
        "SSO & Security Features"
      ],
      notIncluded: []
    }
  ];

  const faqs = [
    {
      id: 1,
      question: "Can I change plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the beginning of your next billing cycle."
    },
    {
      id: 2,
      question: "Do you offer refunds?",
      answer: "We offer a 14-day money-back guarantee on annual plans. Monthly subscriptions can be cancelled anytime with no questions asked."
    },
    {
      id: 3,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise plans."
    },
    {
      id: 4,
      question: "Is there a free trial?",
      answer: "Yes! Our Starter plan is completely free forever. Upgrade anytime to access more features and templates."
    },
    {
      id: 5,
      question: "Can I use ResuMax for multiple accounts?",
      answer: "Personal plans cover one account. For team management, please check our Enterprise plan or contact our sales team."
    },
    {
      id: 6,
      question: "Do you offer student discounts?",
      answer: "Absolutely! Students get 50% off any annual plan with a valid school email. Use code STUDENT50 at checkout."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="pricing-page">
      <Background />
      <div className="pricing-content">
        <Navbar />

        {/* Header Section */}
        <motion.section 
          className="pricing-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Simple, Transparent Pricing</h1>
          <p>Choose the perfect plan to accelerate your job search and land your dream role</p>
        </motion.section>

        {/* Billing Toggle */}
        <motion.section 
          className="billing-toggle-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="billing-toggle">
            <span className={!isAnnual ? "active" : ""}>Monthly</span>
            <motion.div 
              className="toggle-switch"
              onClick={() => setIsAnnual(!isAnnual)}
              layout
            >
              <motion.div 
                className="toggle-thumb"
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.div>
            <span className={isAnnual ? "active" : ""}>Annual</span>
            {isAnnual && <span className="savings-badge">Save 17%</span>}
          </div>
        </motion.section>

        {/* Pricing Cards */}
        <motion.section 
          className="pricing-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              className={`pricing-card ${plan.highlighted ? "highlighted" : ""}`}
              variants={itemVariants}
              whileHover={plan.highlighted ? { y: -15 } : { y: -10 }}
            >
              {plan.badge && (
                <div className="badge">
                  {plan.badge}
                </div>
              )}
              
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <p className="plan-description">{plan.description}</p>
              </div>

              <div className="plan-price">
                {typeof plan.price === "string" ? (
                  <>
                    <span className="price-label">{plan.price}</span>
                  </>
                ) : (
                  <>
                    <span className="currency">$</span>
                    <span className="amount">{plan.price}</span>
                    <span className="period">/{plan.period}</span>
                  </>
                )}
              </div>

              <motion.button 
                className={`plan-button ${plan.highlighted ? "btn-primary" : "btn-secondary"}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {plan.id === 4 ? "Contact Sales" : "Get Started"}
              </motion.button>

              <div className="plan-features">
                <div className="features-section">
                  <h4>Included:</h4>
                  <ul>
                    {plan.features.map((feature, i) => (
                      <li key={i}>
                        <span className="checkmark">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.notIncluded.length > 0 && (
                  <div className="features-section">
                    <h4>Not included:</h4>
                    <ul className="not-included">
                      {plan.notIncluded.map((feature, i) => (
                        <li key={i}>
                          <span className="cross">✕</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* Value Proposition */}
        <motion.section 
          className="value-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2>What You Get With Every Plan</h2>
          <div className="value-grid">
            <div className="value-item">
              <div className="value-icon">⚡</div>
              <h3>Instant ATS Analysis</h3>
              <p>Get real-time feedback on your resume's compatibility with Applicant Tracking Systems</p>
            </div>
            <div className="value-item">
              <div className="value-icon">🎨</div>
              <h3>Professional Templates</h3>
              <p>Access beautifully designed, industry-specific resume templates</p>
            </div>
            <div className="value-item">
              <div className="value-icon">🤖</div>
              <h3>AI-Powered Tools</h3>
              <p>Leverage artificial intelligence to optimize your resume content</p>
            </div>
            <div className="value-item">
              <div className="value-icon">📊</div>
              <h3>Advanced Analytics</h3>
              <p>Track your progress and get insights on what's working</p>
            </div>
          </div>
        </motion.section>

        {/* Comparison Table */}
        <motion.section 
          className="comparison-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2>Detailed Feature Comparison</h2>
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Starter</th>
                  <th>Professional</th>
                  <th>Premium</th>
                  <th>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="feature-name">Resume Uploads</td>
                  <td>5</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td className="feature-name">Templates</td>
                  <td>1</td>
                  <td>10</td>
                  <td>10</td>
                  <td>10+</td>
                </tr>
                <tr>
                  <td className="feature-name">ATS Analysis</td>
                  <td>Basic</td>
                  <td>Advanced</td>
                  <td>Advanced</td>
                  <td>Advanced</td>
                </tr>
                <tr>
                  <td className="feature-name">AI Suggestions</td>
                  <td></td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td className="feature-name">Cover Letters</td>
                  <td></td>
                  <td></td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td className="feature-name">Career Coaching</td>
                  <td></td>
                  <td></td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td className="feature-name">Priority Support</td>
                  <td></td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td className="feature-name">Team Management</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section 
          className="faq-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2>Frequently Asked Questions</h2>
          <div className="faq-container">
            {faqs.map((faq) => (
              <motion.div 
                key={faq.id}
                className={`faq-item ${expandedFaq === faq.id ? "expanded" : ""}`}
              >
                <button 
                  className="faq-question"
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                >
                  <span>{faq.question}</span>
                  <span className="faq-icon">+</span>
                </button>
                <motion.div 
                  className="faq-answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ 
                    height: expandedFaq === faq.id ? "auto" : 0,
                    opacity: expandedFaq === faq.id ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <p>{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.section 
          className="final-cta"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <h2>Ready to Transform Your Job Search?</h2>
          <p>Start free with Starter plan. No credit card required.</p>
          <motion.button 
            className="btn-primary-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Free
          </motion.button>
        </motion.section>

        <Footer />
      </div>
    </div>
  );
}
