import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, Mail, Link, MessageCircle, Copy, Check } from 'lucide-react';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  propertyId?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({
  url,
  title,
  description,
  imageUrl,
  price,
  propertyId
}) => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const shareText = price 
    ? `${title} - ${formatPrice(price)} | ${description || 'Check out this property!'}`
    : `${title} | ${description || 'Check this out!'}`;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`
  };

  const handleShare = async (platform: string) => {
    // Track share event
    if (propertyId) {
      try {
        await fetch(`/api/properties/${propertyId}/share`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ platform }),
        });
      } catch (error) {
        console.error('Error tracking share:', error);
      }
    }

    // Open share link
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      window.open(shareLinks[platform as keyof typeof shareLinks], '_blank', 'width=600,height=400');
    }

    setShowModal(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url
        });
        
        // Track native share
        if (propertyId) {
          try {
            await fetch(`/api/properties/${propertyId}/share`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ platform: 'native' }),
            });
          } catch (error) {
            console.error('Error tracking share:', error);
          }
        }
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleNativeShare}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </button>

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Property</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Property Preview */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex space-x-3">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {title}
                  </h4>
                  {price && (
                    <p className="text-sm font-semibold text-blue-600">
                      {formatPrice(price)}
                    </p>
                  )}
                  {description && (
                    <p className="text-xs text-gray-600 truncate">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Share Options */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Facebook className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">Facebook</span>
              </button>

              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
                  <Twitter className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">Twitter</span>
              </button>

              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                  <Linkedin className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">LinkedIn</span>
              </button>

              <button
                onClick={() => handleShare('whatsapp')}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">WhatsApp</span>
              </button>

              <button
                onClick={() => handleShare('email')}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <Mail className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">Email</span>
              </button>

              <button
                onClick={() => handleShare('copy')}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  {copied ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : (
                    <Copy className="h-4 w-4 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
              </button>
            </div>

            {/* URL Display */}
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <div className="flex items-center space-x-2">
                <Link className="h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  value={url}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-gray-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SocialShare;