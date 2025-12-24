import { render, screen, fireEvent } from '@testing-library/react';

import { UnimplementedFeatures } from './UnimplementedFeatures';

describe('UnimplementedFeatures', () => {
  it('should render header', () => {
    render(
      <UnimplementedFeatures 
        expandedScenarios={new Set()} 
        setExpandedScenarios={jest.fn()} 
      />
    );
    expect(screen.getByText('Unimplemented Features')).toBeInTheDocument();
  });

  it('should render feature file name', () => {
    render(
      <UnimplementedFeatures 
        expandedScenarios={new Set()} 
        setExpandedScenarios={jest.fn()} 
      />
    );
    expect(screen.getByText('US-033-baseline-tasks.feature')).toBeInTheDocument();
  });

  it('should render all scenarios', () => {
    render(
      <UnimplementedFeatures 
        expandedScenarios={new Set()} 
        setExpandedScenarios={jest.fn()} 
      />
    );
    expect(screen.getByText('Baseline tasks visible to all users')).toBeInTheDocument();
    expect(screen.getByText('Can play baseline task entries')).toBeInTheDocument();
  });

  it('should toggle scenario expansion', () => {
    const setExpandedScenarios = jest.fn();
    render(
      <UnimplementedFeatures 
        expandedScenarios={new Set()} 
        setExpandedScenarios={setExpandedScenarios} 
      />
    );
    
    fireEvent.click(screen.getByText('Baseline tasks visible to all users'));
    expect(setExpandedScenarios).toHaveBeenCalled();
  });

  it('should show steps when scenario is expanded', () => {
    render(
      <UnimplementedFeatures 
        expandedScenarios={new Set(['unimpl-0'])} 
        setExpandedScenarios={jest.fn()} 
      />
    );
    expect(screen.getByText(/I am a newly authenticated user/)).toBeInTheDocument();
  });
});
