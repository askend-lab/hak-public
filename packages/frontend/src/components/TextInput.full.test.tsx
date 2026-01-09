/* eslint-disable max-lines-per-function, max-lines */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextInput from './TextInput';

describe('TextInput', () => {
  const mockOnChange = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders input field', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          onSubmit={mockOnSubmit} 
          isLoading={false} 
        />
      );
      expect(screen.getByPlaceholderText('Sisesta tekst või sõna...')).toBeInTheDocument();
    });

    it('renders title', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          onSubmit={mockOnSubmit} 
          isLoading={false} 
        />
      );
      expect(screen.getByText('Teksti kõnesüntees')).toBeInTheDocument();
    });

    it('renders example text', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          onSubmit={mockOnSubmit} 
          isLoading={false} 
        />
      );
      expect(screen.getByText('"Printsess eestlanna elab lossis"')).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          onSubmit={mockOnSubmit} 
          isLoading={false} 
        />
      );
      expect(screen.getByText('Kuula')).toBeInTheDocument();
    });

    it('shows clear button when value is not empty', () => {
      render(
        <TextInput 
          value="test" 
          onChange={mockOnChange} 
          onSubmit={mockOnSubmit} 
          isLoading={false} 
        />
      );
      expect(screen.getByTitle('Kustuta tekst')).toBeInTheDocument();
    });

    it('hides clear button when value is empty', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          onSubmit={mockOnSubmit} 
          isLoading={false} 
        />
      );
      expect(screen.queryByTitle('Kustuta tekst')).not.toBeInTheDocument();
    });

    it('hides clear button when loading', () => {
      render(
        <TextInput 
          value="test" 
          onChange={mockOnChange} 
          onSubmit={mockOnSubmit} 
          isLoading={true} 
        />
      );
      expect(screen.queryByTitle('Kustuta tekst')).not.toBeInTheDocument();
    });
  });

  describe('input handling', () => {
    it('calls onChange when typing', async () => {
      const user = userEvent.setup();
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          onSubmit={mockOnSubmit} 
          isLoading={false} 
        />
      );

      await user.type(screen.getByPlaceholderText('Sisesta tekst või sõna...'), 'a');
      expect(mockOnChange).toHaveBeenCalledWith('a');
    });

    it('disables input when loading', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          onSubmit={mockOnSubmit} 
          isLoading={true} 
        />
      );
      expect(screen.getByPlaceholderText('Sisesta tekst või sõna...')).toBeDisabled();
    });
  });

  describe('clear button', () => {
    it('clears input when clicked', async () => {
      const user = userEvent.setup();
      render(
        <TextInput 
          value="test" 
          onChange={mockOnChange} 
          onSubmit={mockOnSubmit} 
          isLoading={false} 
        />
      );

      await user.click(screen.getByTitle('Kustuta tekst'));
      expect(mockOnChange).toHaveBeenCalledWith('');
    });
  });

  describe('submit button', () => {
    it('calls onSubmit when clicked', async () => {
      const user = userEvent.setup();
      render(
        <TextInput 
          value="test" 
          onChange={mockOnChange} 
          onSubmit={mockOnSubmit} 
          isLoading={false} 
        />
      );

      await user.click(screen.getByText('Kuula'));
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('is disabled when value is empty', () => {
      render(
        <TextInput 
          value="" 
          onChange={mockOnChange} 
          onSubmit={mockOnSubmit} 
          isLoading={false} 
        />
      );
      expect(screen.getByText('Kuula').closest('button')).toBeDisabled();
    });

    it('is disabled when loading', () => {
      render(
        <TextInput 
          value="test" 
          onChange={mockOnChange} 
          onSubmit={mockOnSubmit} 
          isLoading={true} 
        />
      );
      expect(screen.getByText('Sünteseerin...').closest('button')).toBeDisabled();
    });

    it('shows loading text when loading', () => {
      render(
        <TextInput 
          value="test" 
          onChange={mockOnChange} 
          onSubmit={mockOnSubmit} 
          isLoading={true} 
        />
      );
      expect(screen.getByText('Sünteseerin...')).toBeInTheDocument();
    });
  });

  describe('keyboard shortcuts', () => {
    it('submits on Ctrl+Enter', () => {
      render(
        <TextInput 
          value="test" 
          onChange={mockOnChange} 
          onSubmit={mockOnSubmit} 
          isLoading={false} 
        />
      );

      const input = screen.getByPlaceholderText('Sisesta tekst või sõna...');
      fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('does not submit on Enter alone', () => {
      render(
        <TextInput 
          value="test" 
          onChange={mockOnChange} 
          onSubmit={mockOnSubmit} 
          isLoading={false} 
        />
      );

      const input = screen.getByPlaceholderText('Sisesta tekst või sõna...');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('does not submit on Ctrl+Enter when loading', () => {
      render(
        <TextInput 
          value="test" 
          onChange={mockOnChange} 
          onSubmit={mockOnSubmit} 
          isLoading={true} 
        />
      );

      const input = screen.getByPlaceholderText('Sisesta tekst või sõna...');
      fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});
