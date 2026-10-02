import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

function renderRoute(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => localStorage.clear());

test('shows the SchoolBot home screen and navigation', () => {
  renderRoute();

  expect(screen.getByRole('heading', { name: 'Welcome to SchoolBot' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Generate Questions' })).toHaveAttribute('href', '/generate-questions');
  expect(screen.getByRole('link', { name: 'Grade Submissions' })).toHaveAttribute('href', '/grade-submissions');
});

test('shows the question generation form and accepts PDF files', () => {
  renderRoute('/generate-questions');

  expect(screen.getByRole('heading', { name: 'Generate Questions' })).toBeInTheDocument();
  expect(document.querySelector('#file-upload')).toHaveAttribute('accept', '.pdf,application/pdf');
  expect(screen.getByText('Number of Questions')).toBeInTheDocument();
});

test('shows the grading form and criteria field', () => {
  renderRoute('/grade-submissions');

  expect(screen.getByRole('heading', { name: 'Grade Submissions' })).toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: /Grading Criteria/ })).toBeInTheDocument();
  expect(document.querySelector('#student-submissions')).toHaveAttribute('multiple');
});

test('restores and persists the selected color mode', () => {
  localStorage.setItem('darkMode', 'true');
  renderRoute();

  const switchMode = screen.getByRole('button', { name: 'Switch to light mode' });
  expect(switchMode).toHaveAttribute('aria-pressed', 'true');

  fireEvent.click(switchMode);

  expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toHaveAttribute('aria-pressed', 'false');
  expect(localStorage.getItem('darkMode')).toBe('false');
});
