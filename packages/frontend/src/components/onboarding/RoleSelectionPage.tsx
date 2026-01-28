 
'use client';

import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ROLE_CONFIGS } from '@/config/onboardingConfig';
import { UserRole } from '@/types/onboarding';

/**
 * RoleSelectionContent - Role selection cards content
 * 
 * This is just the content portion - it should be rendered inside
 * the main page layout (with header/footer from page.tsx)
 * 
 * Shows on first visit to guide user through selecting their role:
 * - Õppija (Learner)
 * - Õpetaja (Teacher)  
 * - Uurija (Researcher)
 */
export default function RoleSelectionContent() {
  const { selectRole } = useOnboarding();
  const navigate = useNavigate();

  const roles = Object.values(ROLE_CONFIGS);

  const handleRoleSelect = (roleId: UserRole) => {
    selectRole(roleId);
    navigate('/synthesis');
  };

  return (
    <>
      <div className="page-header page-header--minimal">
        <h1 className="page-header__title">
          Vali oma roll
        </h1>
      </div>
      <div className="page-content">
        <div className="role-cards">
          {roles.map((role) => {
            const avatarMap: Record<string, string> = {
              learner: '/icons/student-avatar.png',
              teacher: '/icons/teacher-avatar.png',
              specialist: '/icons/researcher-avatar.png',
            };
            return (
            <div key={role.id} className="role-card">
              <div className="role-card-avatar">
                <img src={avatarMap[role.id] || '/icons/rolli_avatar.png'} alt="" />
              </div>
              
              <h2 className="role-card-title">
                Olen {role.titleEt.toLowerCase()}
              </h2>
              
              <p className="role-card-description">
                {role.descriptionEt}
              </p>
              
              <button 
                className="button button--primary"
                onClick={() => handleRoleSelect(role.id)}
              >
                {role.ctaText}
              </button>
            </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
