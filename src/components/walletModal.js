import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import useEthereumWallet, {
  SUPPORTED_WALLETS,
  closeWalletModal,
  connectWallet,
} from '@hooks/useEthereumWallet';
import { IconClose, IconExternal, IconShield, IconWallet } from '@components/icons';

const StyledOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: rgba(2, 12, 27, 0.75);
  backdrop-filter: blur(6px);
`;

const StyledDialog = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  max-width: 720px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  border: 1px solid var(--lightest-navy);
  border-radius: 16px;
  background-color: var(--light-navy);
  box-shadow: 0 20px 50px -15px var(--navy-shadow);
  text-align: left;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }

  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    padding: 6px;
    border: 0;
    border-radius: 50%;
    color: var(--light-slate);
    background-color: var(--lightest-navy);
    cursor: pointer;
    transition: var(--transition);

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover,
    &:focus-visible {
      outline: none;
      color: var(--green);
    }
  }

  .wallets {
    padding: 26px 22px;
    border-right: 1px solid var(--lightest-navy);

    @media (max-width: 640px) {
      border-right: 0;
      border-bottom: 1px solid var(--lightest-navy);
    }
  }

  .dialog-title {
    margin: 0 0 20px;
    color: var(--lightest-slate);
    font-size: var(--fz-xl);
  }

  .group-label {
    margin: 18px 0 8px;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &:first-of-type {
      margin-top: 0;
    }
  }

  .wallet-option {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px;
    border: 1px solid transparent;
    border-radius: 10px;
    color: var(--lightest-slate);
    background: transparent;
    font-family: var(--font-sans);
    font-size: var(--fz-md);
    font-weight: 600;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
    transition: var(--transition);

    &:hover,
    &:focus-visible {
      outline: none;
      border-color: var(--lightest-navy);
      background-color: var(--navy);
    }

    &:disabled {
      cursor: wait;
      opacity: 0.6;
    }

    &:after {
      display: none !important;
    }
  }

  .wallet-logo {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    overflow: hidden;
    color: #fff;
    font-size: var(--fz-sm);
    font-weight: 700;

    img {
      width: 100%;
      height: 100%;
    }
  }

  .wallet-name {
    flex-grow: 1;
  }

  .wallet-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 400;
    white-space: nowrap;

    &.detected {
      color: var(--green);
      background-color: var(--green-tint);
    }

    &.install {
      color: var(--slate);

      svg {
        width: 12px;
        height: 12px;
      }
    }
  }

  .connect-status {
    min-height: 18px;
    margin: 14px 0 0;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);

    &.error {
      color: var(--pink);
    }
  }

  .about {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 48px 28px 28px;

    @media (max-width: 640px) {
      padding: 24px 22px;
    }
  }

  .about-title {
    margin: 0 0 24px;
    color: var(--lightest-slate);
    font-size: var(--fz-lg);
    text-align: center;
  }

  .point {
    display: flex;
    gap: 14px;
    margin-bottom: 22px;

    @media (max-width: 640px) {
      margin-bottom: 16px;
    }
  }

  .point-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 12px;
    color: var(--green);
    background-color: var(--green-tint);

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .point h4 {
    margin: 0 0 4px;
    color: var(--lightest-slate);
    font-size: var(--fz-md);
  }

  .point p {
    margin: 0;
    color: var(--slate);
    font-size: var(--fz-sm);
    line-height: 1.4;
  }

  .about-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-top: 6px;
  }

  .get-wallet {
    ${({ theme }) => theme.mixins.smallButton};
  }

  .learn-more {
    ${({ theme }) => theme.mixins.inlineLink};
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
  }
`;

const isMobile = () =>
  typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const WalletLogo = ({ wallet }) => (
  <span className="wallet-logo" style={wallet.icon ? undefined : { background: wallet.color }}>
    {wallet.icon ? <img src={wallet.icon} alt="" /> : wallet.name.charAt(0)}
  </span>
);

WalletLogo.propTypes = {
  wallet: PropTypes.shape({
    name: PropTypes.string.isRequired,
    icon: PropTypes.string,
    color: PropTypes.string,
  }).isRequired,
};

const WalletModal = () => {
  const { detected, modalOpen } = useEthereumWallet();
  const [mounted, setMounted] = useState(false);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const closeButton = useRef(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!modalOpen) {
      return undefined;
    }
    setError(null);
    closeButton.current.focus();
    const onKeyDown = e => e.key === 'Escape' && closeWalletModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [modalOpen]);

  if (!mounted || !modalOpen) {
    return null;
  }

  const installed = detected.map(wallet => {
    const known = SUPPORTED_WALLETS.find(supported => supported.rdns === wallet.rdns);
    return { ...known, ...wallet };
  });
  const notInstalled = SUPPORTED_WALLETS.filter(
    supported =>
      !installed.some(wallet => wallet.rdns === supported.rdns || wallet.name === supported.name),
  );

  const onSelect = async wallet => {
    setPending(wallet.rdns);
    setError(null);
    try {
      await connectWallet(wallet);
      const section = document.getElementById('wallet');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (e) {
      setError(e && e.code === 4001 ? 'Request cancelled in your wallet.' : 'Could not connect.');
    } finally {
      setPending(null);
    }
  };

  const linkFor = wallet =>
    isMobile() && wallet.mobileLink ? wallet.mobileLink(window.location.href) : wallet.installUrl;

  return createPortal(
    <StyledOverlay onClick={closeWalletModal}>
      <StyledDialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-modal-title"
        onClick={e => e.stopPropagation()}>
        <button
          ref={closeButton}
          type="button"
          className="close-button"
          onClick={closeWalletModal}
          aria-label="Close">
          <IconClose />
        </button>

        <div className="wallets">
          <h3 id="wallet-modal-title" className="dialog-title">
            Connect a Wallet
          </h3>

          {installed.length > 0 && (
            <>
              <p className="group-label">Installed</p>
              {installed.map(wallet => (
                <button
                  key={wallet.rdns}
                  type="button"
                  className="wallet-option"
                  onClick={() => onSelect(wallet)}
                  disabled={pending !== null}>
                  <WalletLogo wallet={wallet} />
                  <span className="wallet-name">{wallet.name}</span>
                  <span className="wallet-tag detected">
                    {pending === wallet.rdns ? 'Opening...' : 'Detected'}
                  </span>
                </button>
              ))}
            </>
          )}

          {notInstalled.length > 0 && (
            <>
              <p className="group-label">{installed.length > 0 ? 'More wallets' : 'Wallets'}</p>
              {notInstalled.map(wallet => (
                <a
                  key={wallet.rdns}
                  className="wallet-option"
                  href={linkFor(wallet)}
                  target="_blank"
                  rel="noopener noreferrer">
                  <WalletLogo wallet={wallet} />
                  <span className="wallet-name">{wallet.name}</span>
                  <span className="wallet-tag install">
                    {isMobile() && wallet.mobileLink ? 'Open' : 'Install'}
                    <IconExternal />
                  </span>
                </a>
              ))}
            </>
          )}

          <p className={`connect-status ${error ? 'error' : ''}`} role="status" aria-live="polite">
            {error || (pending ? 'Approve the request in your wallet...' : ' ')}
          </p>
        </div>

        <div className="about">
          <h3 className="about-title">New to crypto wallets?</h3>

          <div className="point">
            <span className="point-icon">
              <IconWallet />
            </span>
            <div>
              <h4>Your keys, your crypto</h4>
              <p>
                A wallet holds your ETH and tokens, and only you control it. No bank in between.
              </p>
            </div>
          </div>

          <div className="point">
            <span className="point-icon">
              <IconShield />
            </span>
            <div>
              <h4>You approve everything</h4>
              <p>
                Connecting only shares your public address. Nothing moves until you confirm it in
                your wallet.
              </p>
            </div>
          </div>

          <div className="about-actions">
            <a
              className="get-wallet"
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer">
              Get MetaMask
            </a>
            <a
              className="learn-more"
              href="https://ethereum.org/en/wallets/"
              target="_blank"
              rel="noopener noreferrer">
              What is a wallet?
            </a>
          </div>
        </div>
      </StyledDialog>
    </StyledOverlay>,
    document.body,
  );
};

export default WalletModal;
