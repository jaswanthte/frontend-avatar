import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Techenhance AI Assistant Avatar header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Techenhance AI Assistant Avatar/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders chatbox textarea', () => {
  render(<App />);
  const textareaElement = screen.getByPlaceholderText(/Type your message here.../i);
  expect(textareaElement).toBeInTheDocument();
});

test('renders send button', () => {
  render(<App />);
  const sendButtonElement = screen.getByText(/Send/i);
  expect(sendButtonElement).toBeInTheDocument();
});
