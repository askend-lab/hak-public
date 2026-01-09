'use client';

import { useState } from 'react';
import FeedbackModal from './FeedbackModal';

export default function Footer() {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const handleFeedbackSubmit = async (message: string, email: string) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, email }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      // You can add a success notification here if you have a notification system
      console.log('Feedback submitted successfully');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  };

  return (
    <>
      <div className="page-footer__content">
        <div className="footer-section footer-logo">
          <img src="/icons/logo.svg" alt="EKI Logo" className="footer-logo-image" />
          <div className="footer-contact">
            <p>Roosikrantsi 6, 10119 Tallinn Reg-kood: 70004011 Keelenõu 631 3731 Üldkontakt 617 7500 eki@eki.ee</p>
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Hääldusabiline</h3>
          <ul className="footer-links">
            <li><a href="#">Portaaliest</a></li>
            <li><a href="#">Versiooniajalugu</a></li>
            <li><a href="#">Kasutus- ja privaatsustingimused</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Sotsiaalmeedia</h3>
          <p className="footer-description">Hoia pilk peal.</p>
          <ul className="footer-social">
            <li>
              <a href="https://www.facebook.com/eestikeeleinstituut" target="_blank" rel="noopener noreferrer">
                <img src="/icons/facebook.svg" alt="" className="social-icon" />
                <span>Facebook</span>
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com/@EestiKeeleInstituut" target="_blank" rel="noopener noreferrer">
                <img src="/icons/youtube.svg" alt="" className="social-icon" />
                <span>Youtube</span>
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/company/eesti-keele-instituut" target="_blank" rel="noopener noreferrer">
                <img src="/icons/linkedin.svg" alt="" className="social-icon" />
                <span>LinkedIn</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Tagasiside</h3>
          <p className="footer-description">
            Iga arvamus loeb ja aitab Hääldusabilist paremaks teha!
          </p>
          <button
            className="footer-feedback-button"
            onClick={() => setIsFeedbackModalOpen(true)}
          >
            Kirjuta meile
          </button>
        </div>
      </div>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
}
