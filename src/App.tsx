import { useState } from 'react';
import { freighter, getBalance, sendXlm } from './stellar';
import './App.css';

function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      setStatus({ type: 'info', message: 'Connecting to Freighter...' });
      if (!freighter) {
        throw new Error('Freighter wallet not found. Please install the extension.');
      }
      const result = await freighter.getAddress();
      if (!result || !result.address) {
        throw new Error('Failed to retrieve address from Freighter.');
      }
      setAddress(result.address);
      const bal = await getBalance(result.address);
      setBalance(bal);
      setStatus({ type: 'success', message: 'Wallet connected successfully!' });
    } catch (error: any) {
      console.error('Connection Error:', error);
      setStatus({ type: 'error', message: error.message || 'Failed to connect wallet.' });
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setBalance(null);
    setStatus({ type: 'info', message: 'Wallet disconnected.' });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    if (!destination || !amount) {
      setStatus({ type: 'error', message: 'Please provide destination and amount.' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Processing transaction...' });
    try {
      const result = await sendXlm(address, destination, amount);
      console.log('Transaction result:', result);
      setStatus({ type: 'success', message: `Payment successful! Hash: ${result.hash}` });
      const bal = await getBalance(address);
      setBalance(bal);
    } catch (error: any) {
      console.error('Payment Error:', error);
      setStatus({ type: 'error', message: error.message || 'Transaction failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Stellar Payment dApp</h1>
        <p>Send XLM on Testnet</p>
      </header>

      <main>
        {!address ? (
          <div className="wallet-section">
            <button className="btn-primary" onClick={connectWallet}>
              Connect Freighter Wallet
            </button>
          </div>
        ) : (
          <div className="dashboard">
            <div className="account-info">
              <p><strong>Address:</strong> {address}</p>
              <p><strong>Balance:</strong> {balance} XLM</p>
              <button className="btn-secondary" onClick={disconnectWallet}>
                Disconnect
              </button>
            </div>

            <div className="payment-section">
              <h2>Send XLM</h2>
              <form onSubmit={handlePayment}>
                <div className="form-group">
                  <label>Destination Address</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="G..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount (XLM)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.01"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Payment'}
                </button>
              </form>
            </div>
          </div>
        )}

        {status && (
          <div className={`status-message ${status.type}`}>
            {status.message}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
