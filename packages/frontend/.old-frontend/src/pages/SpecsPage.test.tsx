import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { SpecsPage } from './SpecsPage';
import { AuthProvider } from '../services/auth';

// Mock specifications parser
vi.mock('@hak/specifications', () => ({
  parseFeatureContent: vi.fn((content: string) => {
    if (!content) return null;
    return {
      name: 'Test Feature',
      description: 'Test description',
      tags: [],
      scenarios: [
        {
          name: 'Test Scenario',
          tags: [],
          steps: ['Given I am on the page', 'When I click button', 'Then I see result'],
        },
      ],
    };
  }),
}));

// Mock specs service
vi.mock('../services/specs', () => ({
  loadCucumberResults: vi.fn().mockResolvedValue([{
    keyword: 'Feature',
    name: 'Test Feature',
    elements: [{
      keyword: 'Scenario',
      name: 'Test Scenario',
      steps: [
        { keyword: 'Given', name: 'I am on the page', result: { status: 'passed', duration: 50000000 } },
        { keyword: 'When', name: 'I click button', result: { status: 'passed', duration: 50000000 } },
      ]
    }]
  }]),
  getFeatureGroups: vi.fn().mockReturnValue({
    'test': {
      'test-feature': 'Feature: Test\n  Scenario: Test\n    Given step',
    },
  }),
  parseCucumberResults: vi.fn().mockReturnValue([
    {
      name: 'Test Feature',
      status: 'passed',
      tests: [{ name: 'Test Scenario', fullName: 'Test Feature > Test Scenario', status: 'passed', duration: 100 }],
    },
  ]),
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const renderSpecsPage = () => {
  return render(
    <AuthProvider>
      <BrowserRouter>
        <SpecsPage />
      </BrowserRouter>
    </AuthProvider>
  );
};

describe('SpecsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays features header after loading', async () => {
    renderSpecsPage();
    await waitFor(() => {
      expect(screen.getByText('📋 Features')).toBeInTheDocument();
    });
  });

  it('displays feature name', async () => {
    renderSpecsPage();
    await waitFor(() => {
      expect(screen.getAllByText('Test Feature').length).toBeGreaterThan(0);
    });
  });

  it('displays scenario name', async () => {
    renderSpecsPage();
    await waitFor(() => {
      expect(screen.getAllByText('Test Scenario').length).toBeGreaterThan(0);
    });
  });

  it('displays steps with keywords', async () => {
    renderSpecsPage();
    await waitFor(() => {
      expect(screen.getByText('Given')).toBeInTheDocument();
      expect(screen.getByText('When')).toBeInTheDocument();
      expect(screen.getByText('Then')).toBeInTheDocument();
    });
  });

  it('displays group name with folder icon', async () => {
    renderSpecsPage();
    await waitFor(() => {
      expect(screen.getByText(/📂.*test/i)).toBeInTheDocument();
    });
  });

  it('toggles group expansion on click', async () => {
    renderSpecsPage();
    await waitFor(() => {
      expect(screen.getByText(/📂.*test/i)).toBeInTheDocument();
    });
    const groupText = screen.getByText(/📂.*test/i);
    fireEvent.click(groupText);
    await waitFor(() => {
      expect(screen.getByText(/📁.*test/i)).toBeInTheDocument();
    });
  });

  it('toggles feature expansion on click', async () => {
    renderSpecsPage();
    await waitFor(() => {
      expect(screen.getAllByText('Test Feature').length).toBeGreaterThan(0);
    });
    const featureItems = screen.getAllByText(/▼.*Test Feature/);
    if (featureItems[0]) {
      fireEvent.click(featureItems[0]);
      await waitFor(() => {
        expect(screen.getByText(/▶.*Test Feature/)).toBeInTheDocument();
      });
    }
  });
});
