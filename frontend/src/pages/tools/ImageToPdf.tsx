import { useState } from 'react'
import ToolLayout from '../../components/ToolLayout'
import FileUploader from '../../components/FileUploader'
import { imagesToPdf, downloadBlob, formatBytes } from '../../utils/imageUtils'
import { Loader2, X, GripVertical, FileDown } from 'lucide-react'

export default function ImageToPdf() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  function addFiles(newFiles: File[]) {
    setFiles(prev => [...prev, ...newFiles])
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function convert() {
    if (!files.length) return
    setLoading(true)
    try {
      const blob = await imagesToPdf(files)
      downloadBlob(blob, 'images-to-pdf.pdf')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToolLayout title="图片转 PDF" description="将一张或多张图片合并为 PDF" icon="📄">
      <FileUploader
        onFiles={addFiles}
        accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp'] }}
        multiple
        label="上传图片（支持多选）"
      />

      {files.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-3">已选文件（共 {files.length} 张，按顺序合并）</h2>
          <div className="space-y-2">
            {files.map((file, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3 shadow-sm">
                <GripVertical size={16} className="text-gray-300" />
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-10 h-10 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                </div>
                <button onClick={() => removeFile(i)} className="text-gray-300 hover:text-red-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={convert}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> 生成中...</>
              : <><FileDown size={18} /> 生成 PDF 并下载</>
            }
          </button>
        </div>
      )}
    </ToolLayout>
  )
}
