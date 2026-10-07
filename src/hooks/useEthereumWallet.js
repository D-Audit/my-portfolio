/* global BigInt */
import { useCallback, useEffect, useState } from 'react';

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

const WEI_PER_ETH = BigInt('1000000000000000000');

const getProvider = () => (typeof window !== 'undefined' ? window.ethereum : undefined);

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

const useEthereumWallet = () => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);

  const refresh = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      return;
    }
    try {
      const [accounts, chainHex] = await Promise.all([
        provider.request({ method: 'eth_accounts' }),
        provider.request({ method: 'eth_chainId' }),
      ]);
      const current = accounts && accounts.length > 0 ? accounts[0] : null;
      setAccount(current);
      setChainId(parseInt(chainHex, 16));
      if (current) {
        const weiHex = await provider.request({
          method: 'eth_getBalance',
          params: [current, 'latest'],
        });
        setBalance(formatBalance(weiHex));
      } else {
        setBalance(null);
      }
    } catch (e) {
      // Provider unavailable or locked; keep the disconnected state.
    }
  }, []);

  useEffect(() => {
    const provider = getProvider();
    if (!provider) {
      return undefined;
    }
    refresh();
    provider.on('accountsChanged', refresh);
    provider.on('chainChanged', refresh);
    return () => {
      provider.removeListener('accountsChanged', refresh);
      provider.removeListener('chainChanged', refresh);
    };
  }, [refresh]);

  const connect = async () => {
    const provider = getProvider();
    if (!provider) {
      window.open('https://metamask.io/download/', '_blank', 'noopener noreferrer');
      return;
    }
    try {
      await provider.request({ method: 'eth_requestAccounts' });
      await refresh();
    } catch (e) {
      // User rejected the connection request; nothing to do.
    }
  };

  const sendEther = async (to, amount) => {
    const hash = await getProvider().request({
      method: 'eth_sendTransaction',
      params: [{ from: account, to, value: ethToWeiHex(amount) }],
    });
    refresh();
    return hash;
  };

  return { account, chainId, balance, connect, sendEther, refresh };
};

export default useEthereumWallet;
