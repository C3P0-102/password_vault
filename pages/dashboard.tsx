import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { generatePassword, PasswordOptions } from '@/utils/passwordGenerator';
import { encryptData, decryptData } from '@/utils/encryption';
import type { VaultItem } from '@/types';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'generator' | 'vault'>('generator');
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password generator state
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordOptions, setPasswordOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeLookAlikes: true,
  });

  // Vault form state
  const [showVaultForm, setShowVaultForm] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [vaultForm, setVaultForm] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/');
    }
  }, [session, status, router]);

  // Load vault items on mount
  useEffect(() => {
    if (session) {
      loadVaultItems();
    }
  }, [session]);

  const loadVaultItems = async () => {
    try {
      const res = await fetch('/api/vault/items');
      if (res.ok) {
        const items = await res.json();
        setVaultItems(items);
      }
    } catch (err) {
      console.error('Failed to load vault items:', err);
    }
  };

  const handleGeneratePassword = () => {
    try {
      const password = generatePassword(passwordOptions);
      setGeneratedPassword(password);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate password');
    }
  };

  const copyToClipboard = async (text: string, message = 'Copied to clipboard!') => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);

      // Auto-clear clipboard after 15 seconds
      setTimeout(async () => {
        try {
          await navigator.clipboard.writeText('');
        } catch (err) {
          console.log('Could not clear clipboard');
        }
      }, 15000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const saveToVault = async (item: typeof vaultForm) => {
    if (!item.title || !item.password) {
      setError('Title and password are required');
      return;
    }

    setLoading(true);
    try {
      const encryptedPassword = encryptData(item.password);

      const payload = {
        title: item.title,
        username: item.username,
        encryptedPassword,
        url: item.url,
        notes: item.notes,
      };

      const res = await fetch('/api/vault/items', {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem ? { ...payload, id: editingItem._id } : payload),
      });

      if (res.ok) {
        setSuccess(editingItem ? 'Item updated successfully!' : 'Item saved to vault!');
        setShowVaultForm(false);
        setEditingItem(null);
        setVaultForm({ title: '', username: '', password: '', url: '', notes: '' });
        loadVaultItems();
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to save item');
      }
    } catch (err) {
      setError('Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const deleteVaultItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const res = await fetch('/api/vault/items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setSuccess('Item deleted successfully!');
        loadVaultItems();
      } else {
        setError('Failed to delete item');
      }
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  const editVaultItem = (item: VaultItem) => {
    try {
      const decryptedPassword = decryptData(item.encryptedPassword);
      setVaultForm({
        title: item.title,
        username: item.username,
        password: decryptedPassword,
        url: item.url,
        notes: item.notes,
      });
      setEditingItem(item);
      setShowVaultForm(true);
    } catch (err) {
      setError('Failed to decrypt password');
    }
  };

  const copyPassword = async (item: VaultItem) => {
    try {
      const decryptedPassword = decryptData(item.encryptedPassword);
      await copyToClipboard(decryptedPassword, 'Password copied! Will be cleared in 15 seconds.');
    } catch (err) {
      setError('Failed to decrypt password');
    }
  };

  const filteredItems = vaultItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">SecureVault</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-300">{session.user.email}</span>
            </div>
            <button
              onClick={() => signOut()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('generator')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'generator'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Password Generator
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vault'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Vault ({vaultItems.length})
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-600 bg-opacity-20 border border-red-600 rounded-md p-3 text-red-400">
            {error}
            <button onClick={() => setError('')} className="float-right text-red-300 hover:text-red-100">×</button>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-600 bg-opacity-20 border border-green-600 rounded-md p-3 text-green-400">
            {success}
            <button onClick={() => setSuccess('')} className="float-right text-green-300 hover:text-green-100">×</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'generator' && (
          <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Password Generator</h2>

            {/* Password Options */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Length: {passwordOptions.length}
                </label>
                <input
                  type="range"
                  min="8"
                  max="128"
                  value={passwordOptions.length}
                  onChange={(e) => setPasswordOptions({
                    ...passwordOptions,
                    length: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={passwordOptions.includeUppercase}
                    onChange={(e) => setPasswordOptions({
                      ...passwordOptions,
                      includeUppercase: e.target.checked
                    })}
                    className="rounded border-gray-600"
                  />
                  <span>Uppercase (A-Z)</span>
                </label>

                <label className="flex items-center space-x-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={passwordOptions.includeLowercase}
                    onChange={(e) => setPasswordOptions({
                      ...passwordOptions,
                      includeLowercase: e.target.checked
                    })}
                    className="rounded border-gray-600"
                  />
                  <span>Lowercase (a-z)</span>
                </label>

                <label className="flex items-center space-x-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={passwordOptions.includeNumbers}
                    onChange={(e) => setPasswordOptions({
                      ...passwordOptions,
                      includeNumbers: e.target.checked
                    })}
                    className="rounded border-gray-600"
                  />
                  <span>Numbers (0-9)</span>
                </label>

                <label className="flex items-center space-x-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={passwordOptions.includeSymbols}
                    onChange={(e) => setPasswordOptions({
                      ...passwordOptions,
                      includeSymbols: e.target.checked
                    })}
                    className="rounded border-gray-600"
                  />
                  <span>Symbols (!@#$...)</span>
                </label>

                <label className="flex items-center space-x-2 text-gray-300 col-span-2">
                  <input
                    type="checkbox"
                    checked={passwordOptions.excludeLookAlikes}
                    onChange={(e) => setPasswordOptions({
                      ...passwordOptions,
                      excludeLookAlikes: e.target.checked
                    })}
                    className="rounded border-gray-600"
                  />
                  <span>Exclude Look-Alikes (il1Lo0O)</span>
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGeneratePassword}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md mb-4 transition duration-200"
            >
              Generate Password
            </button>

            {/* Generated Password Display */}
            {generatedPassword && (
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <code className="text-green-400 font-mono text-lg break-all">{generatedPassword}</code>
                    <button
                      onClick={() => copyToClipboard(generatedPassword)}
                      className="ml-4 bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setVaultForm({
                      ...vaultForm,
                      password: generatedPassword
                    });
                    setShowVaultForm(true);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  Save to Vault
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="space-y-6">
            {/* Vault Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-white">Password Vault</h2>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search vault..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    setVaultForm({ title: '', username: '', password: '', url: '', notes: '' });
                    setEditingItem(null);
                    setShowVaultForm(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition duration-200"
                >
                  Add Item
                </button>
              </div>
            </div>

            {/* Vault Items */}
            <div className="grid gap-4">
              {filteredItems.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
                  {vaultItems.length === 0 ? 'No vault items yet. Add your first password!' : 'No items match your search.'}
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div key={item._id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                        {item.username && (
                          <p className="text-gray-400 mb-1">Username: {item.username}</p>
                        )}
                        {item.url && (
                          <p className="text-gray-400 mb-1">
                            URL: <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">{item.url}</a>
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-gray-400 mb-2">Notes: {item.notes}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Created: {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => copyPassword(item)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                        >
                          Copy Password
                        </button>
                        <button
                          onClick={() => editVaultItem(item)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteVaultItem(item._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Vault Form Modal */}
        {showVaultForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveToVault(vaultForm);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
                  <input
                    type="text"
                    value={vaultForm.title}
                    onChange={(e) => setVaultForm({ ...vaultForm, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={vaultForm.username}
                    onChange={(e) => setVaultForm({ ...vaultForm, username: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password *</label>
                  <input
                    type="password"
                    value={vaultForm.password}
                    onChange={(e) => setVaultForm({ ...vaultForm, password: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">URL</label>
                  <input
                    type="url"
                    value={vaultForm.url}
                    onChange={(e) => setVaultForm({ ...vaultForm, url: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                  <textarea
                    value={vaultForm.notes}
                    onChange={(e) => setVaultForm({ ...vaultForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                  >
                    {loading ? 'Saving...' : (editingItem ? 'Update' : 'Save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowVaultForm(false);
                      setEditingItem(null);
                      setVaultForm({ title: '', username: '', password: '', url: '', notes: '' });
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
