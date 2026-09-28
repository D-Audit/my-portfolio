import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { srConfig, wallet } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import { IconWallet } from '@components/icons';

const truncateAddress = address => `${address.slice(0, 6)}...${address.slice(-4)}`;

const StyledWalletSection = styled.div`
  max-width: 600px;
  margin: 60px auto 0;
  text-align: center;

  @media (max-width: 768px) {
    margin-top: 40px;
  }
`;

const StyledWalletCard = styled.div`
  ${({ theme }) => theme.mixins.boxShadow};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 20px;
  border: 1px solid var(--lightest-navy);
  border-radius: var(--border-radius);
  background-color: var(--light-navy);

  .wallet-heading {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    color: var(--lightest-slate);
    font-size: var(--fz-md);
    font-weight: 600;
  }

  .wallet-icon {
    display: flex;
    color: var(--green);

    svg {
      width: 22px;
      height: 22px;
    }
  }

  .wallet-network {
    margin: 0;
    color: var(--slate);
    font-size: var(--fz-xxs);
    font-family: var(--font-mono);
  }

  .wallet-address {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    max-width: 100%;
    padding: 8px 14px;
    border: 1px dashed var(--green);
    border-radius: var(--border-radius);
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    background: transparent;
    cursor: pointer;
    transition: var(--transition);

    &:hover,
    &:focus-visible {
      outline: none;
      background-color: var(--green-tint);
    }

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .wallet-copied {
    margin: 0;
    min-height: 18px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
  }
`;

const StyledConnectButton = styled.button`
  ${({ theme }) => theme.mixins.bigButton};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const WalletCard = () => {
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    sr.reveal(revealContainer.current, srConfig());
  }, []);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Clipboard unavailable (e.g. insecure context); ignore silently.
    }
  };

  const connectWallet = async () => {
    const ethereumProvider = typeof window !== 'undefined' && window.ethereum;
    if (!ethereumProvider) {
      window.open('https://metamask.io/download/', '_blank', 'noopener noreferrer');
      return;
    }
    try {
      const accounts = await ethereumProvider.request({
        method: 'eth_requestAccounts',
      });
      if (accounts && accounts.length > 0) {
        setConnected(true);
        await copyAddress();
      }
    } catch (e) {
      // User rejected the connection request; nothing to do.
    }
  };

  return (
    <StyledWalletSection id="wallet" ref={revealContainer}>
      <StyledWalletCard>
        <h3 className="wallet-heading">
          <span className="wallet-icon">
            <IconWallet />
          </span>
          Support &amp; Payments
        </h3>
        <p className="wallet-network">{wallet.network}</p>

        <button
          type="button"
          className="wallet-address"
          onClick={copyAddress}
          aria-label={`Copy wallet address ${wallet.address}`}>
          <span>{truncateAddress(wallet.address)}</span>
        </button>

        <p className="wallet-copied" role="status" aria-live="polite">
          {copied ? 'Address copied!' : '\u00A0'}
        </p>

        <StyledConnectButton type="button" onClick={connectWallet}>
          <IconWallet />
          {connected ? 'Wallet Connected' : 'Connect Wallet'}
        </StyledConnectButton>
      </StyledWalletCard>
    </StyledWalletSection>
  );
};

export default WalletCard;
