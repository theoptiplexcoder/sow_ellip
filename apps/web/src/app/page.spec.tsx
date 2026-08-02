import { render, screen } from '@testing-library/react';
import Index from './page.js';

describe('Index', () => {
  it('renders a heading', () => {
    render(<Index />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
