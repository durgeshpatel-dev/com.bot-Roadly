import { StrictMode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import VerifyEmail from '../VerifyEmail';
import { authApi } from '../../../api/auth.api';

vi.mock('../../../api/auth.api', () => ({ authApi: { verifyEmail: vi.fn() } }));

describe('Email verification', () => {
  it('consumes a single-use token once under StrictMode', async () => {
    vi.mocked(authApi.verifyEmail).mockResolvedValue({ data: { success: true } } as never);
    render(<StrictMode><MemoryRouter initialEntries={['/verify-email?token=once']}><VerifyEmail /></MemoryRouter></StrictMode>);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Verification successful' })).toBeTruthy());
    expect(authApi.verifyEmail).toHaveBeenCalledTimes(1);
  });

  it('shows a useful error for a missing token without sending a request', () => {
    vi.clearAllMocks();
    render(<MemoryRouter><VerifyEmail /></MemoryRouter>);
    expect(screen.getByText('No verification token provided')).toBeTruthy();
    expect(authApi.verifyEmail).not.toHaveBeenCalled();
  });
});
