import React, { useState } from 'react';
import styled from 'styled-components';
import { wallet } from '@config';
import { IconWallet } from '@components/icons';

const StyledHeroWalletButton = styled.button`
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

  .wallet-addr {
    font-family: var(--font-mono);
    letter-spacing: 0.5px;
  }
`;

const truncateAddress = address => `${address.slice(0, 6)}...${address.slice(-4)}`;

const HeroWalletButton = () => {
  const [connected, setConnected] = useState(false);

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
      }
    } catch (e) {
      // User rejected the connection request; nothing to do.
    }
  };

  return (
    <StyledHeroWalletButton
      type="button"
      onClick={connectWallet}
      title={connected ? wallet.address : 'Connect your MetaMask wallet'}>
      <IconWallet />
      {connected ? (
        <span className="wallet-addr">{truncateAddress(wallet.address)}</span>
      ) : (
        'Connect Wallet'
      )}
    </StyledHeroWalletButton>
  );
};

export default HeroWalletButton;
