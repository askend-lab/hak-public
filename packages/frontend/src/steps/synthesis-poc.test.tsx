/**
 * Proof of Concept: React Testing Library test for synthesis flow
 * 
 * This demonstrates the approach for Gherkin tests:
 * - Render real React components
 * - Simulate user interactions
 * - Assert on UI state
 */
import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { defineFeature, loadFeature } from 'jest-cucumber';
import * as path from 'path';

import { SentenceRow } from '../components/synthesis/SentenceRow';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key === 'input.placeholder' ? 'Write your sentence here' : key,
  }),
}));

// Load Gherkin feature
const feature = loadFeature(path.join(__dirname, '../../../specifications/US-001-basic-synthesis.feature'));

// Gherkin-driven test using defineFeature
describe('US-001: Basic text synthesis (Gherkin)', () => {
  defineFeature(feature, (test) => {
    test('Synthesize a word', ({ given, when, then, and }) => {
      let mockOnChange: ReturnType<typeof vi.fn>;
      let mockOnPlay: ReturnType<typeof vi.fn>;
      let user: ReturnType<typeof userEvent.setup>;

      given('I am on the main page', () => {
        mockOnChange = vi.fn();
        mockOnPlay = vi.fn();
        user = userEvent.setup();
        
        render(
          <SentenceRow
            value=""
            onChange={mockOnChange}
            onPlay={mockOnPlay}
            isLoading={false}
            isLast={true}
          />
        );
      });

      when(/^I enter "(.+)" in the text input$/, async (text: string) => {
        const input = screen.getByPlaceholderText('Write your sentence here');
        await user.type(input, text);
      });

      and('I click the play button', async () => {
        const playButton = screen.getByRole('button', { name: /▶/ });
        await user.click(playButton);
      });

      then('I hear the synthesized audio', () => {
        expect(mockOnPlay).toHaveBeenCalled();
      });

      and('the audio player shows the audio is playing', () => {
        // In this POC, we verify the callback was triggered
        expect(mockOnPlay).toHaveBeenCalledTimes(1);
      });
    });
  });
});

// Additional non-Gherkin test
describe('US-001: Additional tests', () => {
  it('Shows loading state when isLoading is true', () => {
    render(
      <SentenceRow
        value="Tere"
        onChange={vi.fn()}
        onPlay={vi.fn()}
        isLoading={true}
        isLast={true}
      />
    );

    expect(screen.getByText('⏳')).toBeInTheDocument();
  });
});
