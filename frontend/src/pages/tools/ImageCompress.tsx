import { useState } from 'react'
import JSZip from 'jszip'
import ToolLayout from '../../components/ToolLayout'
import FileUploader from '../../components/FileUploader'
import { compressImage, downloadBlob, formatBytes } from '../../utils/imageUtils'
import { Loader2, Download, ArrowRight } from 'lucide-react'

interface Result {
  original: File
  compressed: File
  preview: string
}

export default function ImageCompress() {
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [quality, setQuality] = useState(0.8)

  async function handleFiles(files: File[]) {
    setLoading(true)
    setResults([])
    try {
      const maxSizeMB = quality > 0.7 ? 1 : quality > 0.4 ? 0.5 : 0.2
      const maxDim = quality > 0.7 ? 2048 : quality > 0.4 ? 1280 : 800
      const newResults: Result[] = []
      for (const file of files) {
        const compressed = await compressImage(file, maxSizeMB, maxDim)
        const preview = URL.createObjectURL(compressed)
        newResults.push({ original: file, compressed, preview })
      }
      setResults(newResults)
    } finally {
      setLoading(false)
    }
  }

  function downloadOne(r: Result) {
    const ext = r.original.name.split('.').pop()
    downloadBlob(r.compressed, r.original.name.replace(/\.[^.]+$/, `_compressed.${ext}`))
  }

  async function downloadAll() {
    const zip = new JSZip()
    for (const r of results) {
      const ext = r.original.name.split('.').pop()
      const name = r.original.name.replace(/\.[^.]+$/, `_compressed.${ext}`)
      zip.file(name, r.compressed)
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(blob, 'compressed-images.zip')
  }

  const saved = results.reduce((acc, r) => acc + r.original.size - r.compressed.size, 0)

  return (
    <ToolLayout title="图片压缩" description="在浏览器内压缩图片，文件不上传服务器" icon="🗜️">
      <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          压缩质量：{Math.round(quality * 100)}%
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={quality}
          onChange={e => setQuality(parseFloat(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>最大压缩</span>
          <span>最高质量</span>
        </div>
      </div>

      <FileUploader
        onFiles={handleFiles}
        accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
        multiple
        label="上传图片（支持多选，浏览器内处理）"
      />

      {loading && (
        <div className="mt-6 flex items-center justify-center gap-2 text-blue-600">
          <Loader2 className="animate-spin" size={20} />
          <span>压缩中...</span>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
              共节省 {formatBytes(saved)}
            </div>
            {results.length > 1 && (
              <button
                onClick={downloadAll}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <Download size={14} /> 全部下载
              </button>
            )}
          </div>
          <div className="space-y-3">
            {results.map((r, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                <img src={r.preview} alt={r.original.name} className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{r.original.name}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{formatBytes(r.original.size)}</span>
                    <ArrowRight size={12} />
                    <span className="text-green-600 font-medium">{formatBytes(r.compressed.size)}</span>
                    <span className="text-green-500">
                      (-{Math.round((1 - r.compressed.size / r.original.size) * 100)}%)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => downloadOne(r)}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  <Download size={14} /> 下载
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
