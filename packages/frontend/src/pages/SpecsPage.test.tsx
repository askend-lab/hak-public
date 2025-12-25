import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
  loadTestResults: vi.fn().mockResolvedValue({
    numTotalTests: 1,
    numPassedTests: 1,
    numFailedTests: 0,
    numPendingTests: 0,
    testResults: [
      {
        name: '/steps/test.tsx',
        status: 'passed',
        assertionResults: [
          {
            fullName: 'Test Scenario',
            title: 'Test Scenario',
            status: 'passed',
            duration: 100,
            ancestorTitles: [],
          },
        ],
      },
    ],
  }),
  getFeatures: vi.fn().mockReturnValue({
    'test-feature': 'Feature: Test\n  Scenario: Test\n    Given step',
  }),
  findGherkinTests: vi.fn().mockReturnValue([
    {
      name: 'test.tsx',
      status: 'passed',
      tests: [{ name: 'Test Scenario', fullName: 'Test Scenario', status: 'passed', duration: 100 }],
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

  it('shows loading state initially', () => {
    renderSpecsPage();
    expect(screen.getByText('Loading specifications...')).toBeInTheDocument();
  });

  it('displays specifications title after loading', async () => {
    renderSpecsPage();
    await waitFor(() => {
      expect(screen.getByText('📋 Specifications')).toBeInTheDocument();
    });
  });

  it('displays feature name', async () => {
    renderSpecsPage();
    await waitFor(() => {
      expect(screen.getByText('Test Feature')).toBeInTheDocument();
    });
  });

  it('displays scenario name', async () => {
    renderSpecsPage();
    await waitFor(() => {
      expect(screen.getByText('Test Scenario')).toBeInTheDocument();
    });
  });

  it('displays test results summary', async () => {
    renderSpecsPage();
    await waitFor(() => {
      expect(screen.getByText('Test Results')).toBeInTheDocument();
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

  it('displays test duration', async () => {
    renderSpecsPage();
    await waitFor(() => {
      expect(screen.getByText('100ms')).toBeInTheDocument();
    });
  });
});
