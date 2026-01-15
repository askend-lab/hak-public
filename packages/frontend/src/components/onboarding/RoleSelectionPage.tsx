 
'use client';

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
 * - Kõnesünteesi spetsialist (Speech synthesis specialist)
 */
export default function RoleSelectionContent() {
  const { selectRole } = useOnboarding();

  const roles = Object.values(ROLE_CONFIGS);

  const handleRoleSelect = (roleId: UserRole) => {
    selectRole(roleId);
  };

  return (
    <div className="role-selection-content">
      <h1 className="role-selection-title">
        Teksti kõnesünteesiks vali oma roll
      </h1>
      
      <div className="role-cards">
        {roles.map((role) => (
          <div key={role.id} className="role-card">
            <div className="role-card-avatar">
              <img src="/icons/rolli_avatar.png" alt="" />
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
        ))}
      </div>
    </div>
  );
}
