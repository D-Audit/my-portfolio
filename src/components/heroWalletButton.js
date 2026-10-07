import React from 'react';
import styled from 'styled-components';
import { useEthereumWallet } from '@hooks';
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
  const { account, connect } = useEthereumWallet();

  const onClick = () => {
    if (account) {
      document.getElementById('wallet').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    connect();
  };

  return (
    <StyledHeroWalletButton
      type="button"
      onClick={onClick}
      title={account ? 'Send Ether to support my work' : 'Connect your MetaMask wallet'}>
      <IconWallet />
      {account ? <span className="wallet-addr">{truncateAddress(account)}</span> : 'Connect Wallet'}
    </StyledHeroWalletButton>
  );
};

export default HeroWalletButton;
