import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { srConfig, wallet } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion, useEthereumWallet } from '@hooks';
import {
  disconnectWallet,
  getExplorerTxUrl,
  getNetworkName,
  openWalletModal,
  sendEther,
} from '@hooks/useEthereumWallet';
import WalletModal from '@components/walletModal';
import { IconCopy, IconSend, IconWallet } from '@components/icons';

const truncateAddress = address => `${address.slice(0, 6)}...${address.slice(-4)}`;

const AMOUNT_PATTERN = /^\d*\.?\d{0,18}$/;

const StyledWalletSection = styled.div`
  max-width: 600px;
  margin: 80px auto 0;
  text-align: center;

  .support-icons {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 14px;
    font-size: 26px;
    line-height: 1;
  }

  .support-title {
    margin: 0 0 10px;
    color: var(--lightest-slate);
    font-size: clamp(28px, 5vw, 40px);
  }

  .support-subtitle {
    margin: 0 0 6px;
    color: var(--light-slate);
    font-size: var(--fz-lg);
  }

  .support-note {
    margin: 0 auto;
    max-width: 480px;
    color: var(--slate);
    font-size: var(--fz-md);

    .eth {
      color: var(--green);
      font-family: var(--font-mono);
      font-size: 0.9em;
    }
  }

  .divider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    margin: 24px 0 28px;

    &:before,
    &:after {
      content: '';
      width: 60px;
      height: 1px;
      background-color: var(--lightest-navy);
    }

    span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--green);
    }
  }

  @media (max-width: 768px) {
    margin-top: 60px;
  }
`;

const StyledWalletCard = styled.div`
  ${({ theme }) => theme.mixins.boxShadow};
  padding: 28px;
  border: 1px solid var(--lightest-navy);
  border-radius: 12px;
  background: linear-gradient(145deg, var(--light-navy) 0%, var(--navy) 100%);
  text-align: left;

  @media (max-width: 480px) {
    padding: 20px 16px;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 22px;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    color: var(--green);
    font-size: var(--fz-xxl);
    font-weight: 600;

    svg {
      width: 22px;
      height: 22px;
    }
  }

  .status-pill {
    padding: 4px 12px;
    border: 1px solid var(--lightest-navy);
    border-radius: 999px;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    white-space: nowrap;

    &.connected {
      border-color: var(--green);
      color: var(--green);
      background-color: var(--green-tint);
    }
  }

  .connect-prompt {
    margin: 0 0 20px;
    color: var(--light-slate);
    font-size: var(--fz-md);
    text-align: center;
  }

  .disconnect-button {
    display: block;
    margin: 4px auto 0;
    padding: 0;
    border: 0;
    color: var(--slate);
    background: transparent;
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    cursor: pointer;
    transition: var(--transition);

    &:hover,
    &:focus-visible {
      outline: none;
      color: var(--pink);
    }
  }

  .label {
    display: block;
    margin-bottom: 8px;
    color: var(--light-slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .amount-input {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid var(--lightest-navy);
    border-radius: 8px;
    color: var(--lightest-slate);
    background-color: var(--dark-navy);
    font-family: var(--font-mono);
    font-size: var(--fz-lg);
    transition: var(--transition);

    &::placeholder {
      color: var(--dark-slate);
    }

    &:focus {
      outline: none;
      border-color: var(--green);
    }

    &:disabled {
      opacity: 0.6;
    }
  }

  .address-box {
    margin: 18px 0;
    padding: 16px;
    border: 1px solid var(--lightest-navy);
    border-radius: 8px;
    background-color: rgba(2, 12, 27, 0.4);

    .address-row + .address-row {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid var(--lightest-navy);
    }

    .label {
      margin-bottom: 6px;
    }
  }

  .address-value {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--lightest-slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
    word-break: break-all;

    &.muted,
    .muted {
      color: var(--slate);
    }
  }

  .copy-button {
    display: inline-flex;
    flex-shrink: 0;
    padding: 6px;
    border: 0;
    border-radius: 6px;
    color: var(--green);
    background-color: var(--green-tint);
    cursor: pointer;
    transition: var(--transition);

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover,
    &:focus-visible {
      outline: none;
      background-color: rgba(56, 225, 180, 0.2);
    }
  }

  .primary-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 16px;
    border: 1px solid var(--green);
    border-radius: 8px;
    color: var(--navy);
    background-color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover:not(:disabled),
    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 4px var(--green-tint);
    }

    &:disabled {
      border-color: var(--lightest-navy);
      color: var(--slate);
      background-color: var(--lightest-navy);
      cursor: not-allowed;
    }
  }

  .tx-status {
    min-height: 20px;
    margin: 12px 0 0;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: var(--fz-xxs);
    text-align: center;

    &.success {
      color: var(--green);
    }

    &.error {
      color: var(--pink);
    }

    a {
      ${({ theme }) => theme.mixins.inlineLink};
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 18px;
    padding-top: 18px;
    border-top: 1px solid var(--lightest-navy);

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  .info-tile {
    padding: 12px 14px;
    border: 1px solid var(--lightest-navy);
    border-radius: 8px;
    background-color: rgba(2, 12, 27, 0.4);

    &.highlight {
      border-color: rgba(56, 225, 180, 0.4);
      background-color: var(--green-tint);

      .label {
        color: var(--green);
      }
    }

    .label {
      margin-bottom: 4px;
      font-size: 10px;
    }

    .info-main {
      color: var(--lightest-slate);
      font-size: var(--fz-sm);
      font-weight: 600;
    }

    .info-sub {
      color: var(--slate);
      font-family: var(--font-mono);
      font-size: 11px;
    }
  }
`;

const WalletCard = () => {
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { account, chainId, balance, walletName } = useEthereumWallet();
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [txStatus, setTxStatus] = useState(null);

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

  const onAmountChange = e => {
    if (AMOUNT_PATTERN.test(e.target.value)) {
      setAmount(e.target.value);
    }
  };

  const amountIsValid = amount !== '' && amount !== '.' && Number(amount) > 0;

  const onSend = async () => {
    setSending(true);
    setTxStatus({ type: 'pending', text: 'Confirm the transaction in your wallet...' });
    try {
      const hash = await sendEther(wallet.address, amount);
      setTxStatus({ type: 'success', text: 'Received on-chain. Much appreciated!', hash });
      setAmount('');
    } catch (e) {
      const rejected = e && e.code === 4001;
      setTxStatus({
        type: 'error',
        text: rejected ? 'Transaction cancelled.' : 'Transaction failed. Please try again.',
      });
    } finally {
      setSending(false);
    }
  };

  const onDisconnect = () => {
    disconnectWallet();
    setAmount('');
    setTxStatus(null);
  };

  const txUrl = txStatus && txStatus.hash && getExplorerTxUrl(chainId, txStatus.hash);

  return (
    <StyledWalletSection id="wallet" ref={revealContainer}>
      <div className="support-icons" aria-hidden="true">
        <span role="img" aria-label="shield">
          🛡️
        </span>
        <span role="img" aria-label="chain">
          ⛓️
        </span>
        <span role="img" aria-label="rocket">
          🚀
        </span>
      </div>
      <h3 className="support-title">Fuel the Next Build</h3>
      <p className="support-subtitle">Found something useful here? Send a little gas my way.</p>
      <p className="support-note">
        Every bit of <span className="eth">ETH</span> goes straight into more audits, more
        experiments, and safer smart contracts on-chain.
      </p>

      <div className="divider" aria-hidden="true">
        <span />
      </div>

      <StyledWalletCard>
        <div className="card-header">
          <h4 className="card-title">
            <IconSend />
            Send Ether
          </h4>
          {account && <span className="status-pill connected">Connected</span>}
        </div>

        {account ? (
          <>
            <label className="label" htmlFor="eth-amount">
              Amount (ETH)
            </label>
            <input
              id="eth-amount"
              className="amount-input"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.0"
              value={amount}
              onChange={onAmountChange}
              disabled={sending}
            />

            <div className="address-box">
              <div className="address-row">
                <span className="label">Recipient address</span>
                <div className="address-value">
                  <span>{wallet.address}</span>
                  <button
                    type="button"
                    className="copy-button"
                    onClick={copyAddress}
                    aria-label="Copy recipient address">
                    <IconCopy />
                  </button>
                  {copied && <span className="muted">Copied!</span>}
                </div>
              </div>
              <div className="address-row">
                <span className="label">Your address</span>
                <div className="address-value">{account}</div>
              </div>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={onSend}
              disabled={!amountIsValid || sending}>
              <IconSend />
              {sending ? 'Sending...' : 'Send Ether'}
            </button>

            <p
              className={`tx-status ${txStatus ? txStatus.type : ''}`}
              role="status"
              aria-live="polite">
              {txStatus ? txStatus.text : ' '}
              {txUrl && (
                <>
                  {' '}
                  <a href={txUrl} target="_blank" rel="noopener noreferrer">
                    View on explorer
                  </a>
                </>
              )}
            </p>

            <div className="info-grid">
              <div className="info-tile highlight">
                <span className="label">Network</span>
                <div className="info-main">{chainId ? getNetworkName(chainId) : '—'}</div>
                <div className="info-sub">{chainId ? `Chain ID #${chainId}` : ' '}</div>
              </div>
              <div className="info-tile">
                <span className="label">{walletName || 'Wallet'}</span>
                <div className="info-main">{truncateAddress(account)}</div>
                <div className="info-sub">{balance !== null ? `${balance} ETH` : ' '}</div>
              </div>
            </div>

            <button type="button" className="disconnect-button" onClick={onDisconnect}>
              Disconnect wallet
            </button>
          </>
        ) : (
          <>
            <p className="connect-prompt">Connect your wallet to send Ether directly</p>
            <button type="button" className="primary-button" onClick={openWalletModal}>
              <IconWallet />
              Connect Wallet
            </button>
          </>
        )}
      </StyledWalletCard>

      <WalletModal />
    </StyledWalletSection>
  );
};

export default WalletCard;
