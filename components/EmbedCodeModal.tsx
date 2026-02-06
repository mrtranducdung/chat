import React, { useState } from 'react';
import { getCurrentTenant } from '../services/storageService';

interface EmbedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({ isOpen, onClose }) => {
  const tenant = getCurrentTenant();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !tenant) return null;

  // ✅ Production URL - Thay YOUR_DOMAIN bằng domain thật của bạn
  const WIDGET_URL = window.location.origin || 'https://geminibot-frontend.onrender.com';

  const embedCode = `<script 
  src="${WIDGET_URL}/embed.js"
  data-tenant-id="${tenant.id}"
  data-bot-name="${tenant.name} Assistant"
  data-primary-color="#2563eb"
  data-language="vi">
</script>`;

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyTenantId = () => {
    navigator.clipboard.writeText(tenant.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Get Embed Code</h2>
            <p className="text-sm text-gray-500 mt-1">Add chatbot to your website in seconds</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tenant Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">📋 Your Account Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded p-3">
                <p className="text-gray-500 text-xs mb-1">Company Name</p>
                <p className="font-medium text-gray-900">{tenant.name}</p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-gray-500 text-xs mb-1">Tenant ID</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-xs text-blue-600 break-all">
                    {tenant.id}
                  </code>
                  <button
                    onClick={copyTenantId}
                    className="text-blue-600 hover:text-blue-700 text-xs shrink-0"
                    title="Copy Tenant ID"
                  >
                    📋
                  </button>
                </div>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-gray-500 text-xs mb-1">Plan</p>
                <p className="font-medium text-gray-900 capitalize">{tenant.plan || 'Free'}</p>
              </div>
            </div>
          </div>

          {/* Embed Code */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                📦 Embed Code
              </label>
              <button
                onClick={copyCode}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <span>✓</span>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
{embedCode}
              </pre>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <span>📝</span>
              <span>How to Install</span>
            </h3>
            <ol className="text-sm text-amber-800 space-y-2 list-decimal list-inside">
              <li>
                <strong>Copy</strong> the embed code above
              </li>
              <li>
                <strong>Open</strong> your website's HTML file
              </li>
              <li>
                <strong>Paste</strong> the code right before the closing <code className="bg-amber-100 px-1 rounded">&lt;/body&gt;</code> tag
              </li>
              <li>
                <strong>Save</strong> and refresh your website - the chatbot will appear!
              </li>
            </ol>
          </div>

          {/* Customization Options */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>⚙️</span>
              <span>Customization Options</span>
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>You can customize the widget by changing these attributes:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  <code className="bg-gray-200 px-2 py-0.5 rounded text-xs">data-bot-name</code> - 
                  <span className="text-gray-700"> Change chatbot name</span>
                </li>
                <li>
                  <code className="bg-gray-200 px-2 py-0.5 rounded text-xs">data-primary-color</code> - 
                  <span className="text-gray-700"> Change button color (hex code)</span>
                </li>
                <li>
                  <code className="bg-gray-200 px-2 py-0.5 rounded text-xs">data-position</code> - 
                  <span className="text-gray-700"> Position: "bottom-right" or "bottom-left"</span>
                </li>
                <li>
                  <code className="bg-gray-200 px-2 py-0.5 rounded text-xs">data-language</code> - 
                  <span className="text-gray-700"> Language: "vi" (Vietnamese) or "en" (English)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Example */}
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <span>💡</span>
              <span>Example HTML</span>
            </h4>
            <pre className="text-xs bg-white border rounded p-3 overflow-x-auto">
{`<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to my site!</h1>
  
  <!-- Add chatbot here -->
  ${embedCode}
</body>
</html>`}
            </pre>
          </div>

          {/* Support */}
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">
              Need help? Check our{' '}
              <a href="#" className="text-blue-600 hover:underline font-medium">
                documentation
              </a>
              {' '}or{' '}
              <a href="#" className="text-blue-600 hover:underline font-medium">
                contact support
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
          <button
            onClick={copyCode}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {copied ? '✓ Copied!' : '📋 Copy Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmbedCodeModal;