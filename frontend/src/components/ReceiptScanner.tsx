import { useRef, useState } from 'react';
import { Upload, Camera, Check, AlertCircle } from 'lucide-react';
import apiService from '../services/api';
import { translations, Language } from '../translations';

interface Receipt {
  id: number;
  storeName: string;
  amount: number;
  date: string;
  category: string;
  confidence: number;
  items: any[];
}

export const ReceiptScanner = ({ language = 'en', isDarkMode = true }: { language?: Language; isDarkMode?: boolean }) => {
  const t = translations[language];
  const theme = isDarkMode ? 'dark' : 'light';
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('Grocery');
  const [editDate, setEditDate] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const categories = [
    'Grocery', 'Food', 'Transport', 'Entertainment',
    'Shopping', 'Healthcare', 'Education', 'Utilities', 'Other'
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError('Cannot access camera');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        
        canvasRef.current.toBlob(async (blob) => {
          if (blob) {
            await scanReceipt(blob);
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  const handleFileUpload = (file: File) => {
    scanReceipt(file);
  };

  const scanReceipt = async (file: Blob) => {
    setLoading(true);
    setError('');
    stopCamera();

    try {
      const response = await apiService.scanReceipt(file);
      console.log('scanReceipt response:', response);

      if (response.success) {
        const data = response.receipt;
        setReceipt({ ...data, id: response.receipt.id } as Receipt);
        setEditAmount(data.amount?.toString() || '');
        setEditCategory(data.category || 'Grocery');
        setEditDate(data.date || new Date().toISOString().split('T')[0]);
      } else {
        console.error('scanReceipt: response.success is false', response);
      }
    } catch (err: any) {
      console.error('scanReceipt error:', err);
      setError(err.response?.data?.error || 'Failed to scan receipt');
    } finally {
      setLoading(false);
    }
  };

  const confirmReceipt = async () => {
    if (!receipt) return;

    setLoading(true);
    try {
      await apiService.confirmReceipt(receipt.id, {
        amount: parseFloat(editAmount),
        category: editCategory,
        date: editDate,
        description: receipt.storeName
      });

      setReceipt(null);
      setEditAmount('');
      setEditCategory('Grocery');
      alert('Receipt saved successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to confirm receipt');
    } finally {
      setLoading(false);
    }
  };

  if (receipt) {
    return (
      <div className={`${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white'} rounded-lg shadow p-6 max-w-2xl`}>
        <h2 className="text-xl font-bold mb-4">{t.confirm}</h2>

        <div className={`mb-4 p-3 rounded ${theme === 'dark' ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50'}`}>
          <p className="text-sm">
            {t.confidence}: <span className="font-bold">{(receipt.confidence * 100).toFixed(0)}%</span>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : ''}`}>{t.storeName}</label>
            <input
              type="text"
              value={receipt.storeName || ''}
              readOnly
              className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-gray-300' : 'bg-gray-100'}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : ''}`}>{t.receiptAmount}</label>
              <input
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : ''}`}>{t.receiptDate}</label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : ''}`}>{t.receiptCategory}</label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'border-gray-300'}`}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {Array.isArray(receipt.items) && receipt.items.length > 0 && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : ''}`}>{t.receiptItems}</label>
              <div className={`p-3 rounded text-sm max-h-40 overflow-y-auto ${theme === 'dark' ? 'bg-slate-700 border border-slate-600' : 'bg-gray-50'}`}>
                {receipt.items.map((item, i) => (
                  <div key={i} className={`flex justify-between py-1 ${theme === 'dark' ? 'border-slate-600' : 'border-gray-300'} border-b last:border-b-0`}>
                    <span>{item.name}</span>
                    <span className="font-medium">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setReceipt(null)}
            className={`flex-1 px-4 py-2 border rounded ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700 text-white' : 'border-gray-300 hover:bg-gray-50'}`}
          >
            {t.cancel}
          </button>
          <button
            onClick={confirmReceipt}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Check size={18} /> {t.confirm}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white'} rounded-lg shadow p-6 max-w-2xl`}>
      <h2 className="text-xl font-bold mb-4">{t.receipts}</h2>

      {error && (
        <div className={`mb-4 p-3 rounded flex gap-2 ${theme === 'dark' ? 'bg-red-900/30 text-red-300 border border-red-700' : 'bg-red-50 text-red-700'}`}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {cameraActive ? (
        <div className="space-y-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full rounded border-2 ${theme === 'dark' ? 'border-slate-600' : 'border-gray-300'}`}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          <div className="flex gap-2">
            <button
              onClick={capturePhoto}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              📸 {t.takePhoto}
            </button>
            <button
              onClick={stopCamera}
              className={`flex-1 px-4 py-2 border rounded ${theme === 'dark' ? 'border-slate-600 hover:bg-slate-700 text-white' : 'border-gray-300 hover:bg-gray-50'}`}
            >
              ✕ {t.cancel}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={startCamera}
              className={`px-4 py-3 border-2 rounded flex items-center justify-center gap-2 ${theme === 'dark' ? 'border-blue-600 text-blue-400 hover:bg-blue-900/20' : 'border-blue-600 text-blue-600 hover:bg-blue-50'}`}
            >
              <Camera size={20} /> {t.takePhoto}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-4 py-3 border-2 rounded flex items-center justify-center gap-2 ${theme === 'dark' ? 'border-slate-600 text-gray-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              <Upload size={20} /> {t.upload}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            style={{ display: 'none' }}
          />

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t.scanning}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
