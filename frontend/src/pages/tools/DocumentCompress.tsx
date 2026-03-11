import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import ToolLayout from '../../components/ToolLayout'
import FileUploader from '../../components/FileUploader'
import { downloadBlob, formatBytes } from '../../utils/imageUtils'
import { Loader2, FileDown, ArrowRight } from 'lucide-react'

export default function DocumentCompress() {
  const [original, setOriginal] = useState<File | null>(null)
  const [compressed, setCompressed] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleFile(files: File[]) {
    const file = files[0]
    setOriginal(file)
    setCompressed(null)
    setLoading(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
      // Re-save with compression (removes unused objects)
      const bytes = await pdfDoc.save({ useObjectStreams: true })
      setCompressed(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }))
    } catch (e) {
      alert('PDF 处理失败，可能是加密文件或格式不支持')
    } finally {
      setLoading(false)
    }
  }

  function doDownload() {
    if (!compressed || !original) return
    downloadBlob(compressed, original.name.replace('.pdf', '_compressed.pdf'))
  }

  const reduction = original && compressed
    ? Math.round((1 - compressed.size / original.size) * 100)
    : 0

  return (
    <ToolLayout title="PDF 压缩" description="压缩 PDF 文件体积，浏览器内处理" icon="📦">
      <FileUploader
        onFiles={handleFile}
        accept={{ 'application/pdf': ['.pdf'] }}
        label="上传 PDF 文件"
      />

      {loading && (
        <div className="mt-6 flex items-center justify-center gap-2 text-blue-600">
          <Loader2 className="animate-spin" size={20} />
          <span>压缩中...</span>
        </div>
      )}

      {compressed && original && (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">压缩完成</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">原始大小</p>
              <p className="text-lg font-bold text-gray-700">{formatBytes(original.size)}</p>
            </div>
            <ArrowRight className="text-gray-300" />
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">压缩后</p>
              <p className="text-lg font-bold text-green-600">{formatBytes(compressed.size)}</p>
            </div>
            <div className="ml-auto bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              {reduction >= 0 ? `节省 ${reduction}%` : '文件已是最优'}
            </div>
          </div>
          <button
            onClick={doDownload}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <FileDown size={18} /> 下载压缩后的 PDF
          </button>
        </div>
      )}
    </ToolLayout>
  )
}
