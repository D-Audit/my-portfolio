/* global BigInt */
import { useEffect, useState } from 'react';

const NETWORKS = {
  1: 'Ethereum',
  10: 'Optimism',
  56: 'BNB Smart Chain',
  137: 'Polygon',
  8453: 'Base',
  42161: 'Arbitrum One',
  43114: 'Avalanche',
  11155111: 'Sepolia',
};

const EXPLORERS = {
  1: 'https://etherscan.io',
  10: 'https://optimistic.etherscan.io',
  56: 'https://bscscan.com',
  137: 'https://polygonscan.com',
  8453: 'https://basescan.org',
  42161: 'https://arbiscan.io',
  43114: 'https://snowtrace.io',
  11155111: 'https://sepolia.etherscan.io',
};

// Wallets offered in the picker. Installed ones are matched by their EIP-6963 rdns.
export const SUPPORTED_WALLETS = [
  {
    rdns: 'io.metamask',
    name: 'MetaMask',
    color: '#f6851b',
    installUrl: 'https://metamask.io/download/',
    mobileLink: url => `https://metamask.app.link/dapp/${url.replace(/^https?:\/\//, '')}`,
  },
  {
    rdns: 'com.trustwallet.app',
    name: 'Trust Wallet',
    color: '#0500ff',
    installUrl: 'https://trustwallet.com/download',
    mobileLink: url =>
      `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(url)}`,
  },
  {
    rdns: 'app.phantom',
    name: 'Phantom',
    color: '#ab9ff2',
    installUrl: 'https://phantom.com/download',
    mobileLink: url =>
      `https://phantom.app/ul/browse/${encodeURIComponent(url)}?ref=${encodeURIComponent(url)}`,
  },
  {
    rdns: 'io.rabby',
    name: 'Rabby',
    color: '#7084ff',
    installUrl: 'https://rabby.io/',
  },
  {
    rdns: 'com.okex.wallet',
    name: 'OKX Wallet',
    color: '#000000',
    installUrl: 'https://www.okx.com/web3',
  },
];

const STORAGE_KEY = 'connected-wallet-rdns';
const LEGACY_RDNS = 'injected';
const WEI_PER_ETH = BigInt('1000000000000000000');

// Converts a decimal ETH string (e.g. "0.05") to a hex wei string without float rounding.
export const ethToWeiHex = amount => {
  const [whole = '0', fraction = ''] = amount.trim().split('.');
  const wei = BigInt(whole || '0') * WEI_PER_ETH + BigInt((fraction + '0'.repeat(18)).slice(0, 18));
  return `0x${wei.toString(16)}`;
};

const formatBalance = weiHex => {
  const wei = BigInt(weiHex);
  const whole = wei / WEI_PER_ETH;
  const fraction = (wei % WEI_PER_ETH).toString().padStart(18, '0').slice(0, 4).replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole.toString();
};

export const getNetworkName = chainId => NETWORKS[chainId] || `Chain ${chainId}`;

export const getExplorerTxUrl = (chainId, hash) =>
  EXPLORERS[chainId] ? `${EXPLORERS[chainId]}/tx/${hash}` : null;

const readStoredRdns = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return null;
  }
};

const writeStoredRdns = rdns => {
  try {
    if (rdns) {
      window.localStorage.setItem(STORAGE_KEY, rdns);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    // Storage blocked; the connection just won't be restored on reload.
  }
};

// One wallet connection shared by every component that uses the hook.
let state = {
  detected: [],
  provider: null,
  walletName: null,
  account: null,
  chainId: null,
  balance: null,
  modalOpen: false,
};
const listeners = new Set();
let initialized = false;

const setState = patch => {
  state = { ...state, ...patch };
  listeners.forEach(listener => listener(state));
};

const refresh = async () => {
  const { provider } = state;
  if (!provider) {
    return;
  }
  try {
    const [accounts, chainHex] = await Promise.all([
      provider.request({ method: 'eth_accounts' }),
      provider.request({ method: 'eth_chainId' }),
    ]);
    const account = accounts && accounts.length > 0 ? accounts[0] : null;
    let balance = null;
    if (account) {
      const weiHex = await provider.request({
        method: 'eth_getBalance',
        params: [account, 'latest'],
      });
      balance = formatBalance(weiHex);
    }
    setState({ account, chainId: parseInt(chainHex, 16), balance });
  } catch (e) {
    // Provider unavailable or locked; keep the current state.
  }
};

const setActiveProvider = (provider, walletName) => {
  if (state.provider && state.provider !== provider) {
    state.provider.removeListener('accountsChanged', refresh);
    state.provider.removeListener('chainChanged', refresh);
  }
  if (provider && state.provider !== provider) {
    provider.on('accountsChanged', refresh);
    provider.on('chainChanged', refresh);
  }
  setState({ provider, walletName });
};

const addDetected = entry => {
  if (state.detected.some(wallet => wallet.rdns === entry.rdns)) {
    return;
  }
  setState({ detected: [...state.detected, entry] });
  if (!state.provider && readStoredRdns() === entry.rdns) {
    setActiveProvider(entry.provider, entry.name);
    refresh();
  }
};

const init = () => {
  if (initialized || typeof window === 'undefined') {
    return;
  }
  initialized = true;

  window.addEventListener('eip6963:announceProvider', event => {
    const { info, provider } = event.detail;
    addDetected({ rdns: info.rdns, name: info.name, icon: info.icon, provider });
  });
  window.dispatchEvent(new Event('eip6963:requestProvider'));

  // Older wallets only expose window.ethereum without announcing themselves.
  setTimeout(() => {
    if (state.detected.length === 0 && window.ethereum) {
      addDetected({
        rdns: LEGACY_RDNS,
        name: window.ethereum.isMetaMask ? 'MetaMask' : 'Browser Wallet',
        icon: null,
        provider: window.ethereum,
      });
    }
  }, 500);
};

export const openWalletModal = () => setState({ modalOpen: true });

export const closeWalletModal = () => setState({ modalOpen: false });

export const connectWallet = async wallet => {
  await wallet.provider.request({ method: 'eth_requestAccounts' });
  setActiveProvider(wallet.provider, wallet.name);
  writeStoredRdns(wallet.rdns);
  await refresh();
  setState({ modalOpen: false });
};

// Forgets the wallet on this site; the wallet itself keeps its own permission list.
export const disconnectWallet = () => {
  setActiveProvider(null, null);
  writeStoredRdns(null);
  setState({ account: null, chainId: null, balance: null });
};

export const sendEther = async (to, amount) => {
  const hash = await state.provider.request({
    method: 'eth_sendTransaction',
    params: [{ from: state.account, to, value: ethToWeiHex(amount) }],
  });
  refresh();
  return hash;
};

const useEthereumWallet = () => {
  const [snapshot, setSnapshot] = useState(state);

  useEffect(() => {
    listeners.add(setSnapshot);
    init();
    setSnapshot(state);
    return () => listeners.delete(setSnapshot);
  }, []);

  return snapshot;
};

export default useEthereumWallet;
