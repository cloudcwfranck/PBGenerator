import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('renders title', () => {
    render(<App />);
    expect(screen.getByText('Pipeline Blueprint Generator')).toBeInTheDocument();
  });
});
