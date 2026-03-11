import { useState } from 'react'
import JSZip from 'jszip'
import ToolLayout from '../../components/ToolLayout'
import FileUploader from '../../components/FileUploader'
import { extractImagesFromPdf } from '../../utils/pdfUtils'
import { downloadBlob } from '../../utils/imageUtils'
import { Download, Loader2, AlertCircle } from 'lucide-react'

export default function PdfExtractImages() {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleFile(files: File[]) {
    const file = files[0]
    setFileName(file.name.replace('.pdf', ''))
    setLoading(true)
    setImages([])
    setError(null)
    try {
      const imgs = await extractImagesFromPdf(file)
      setImages(imgs)
    } catch (e) {
      setError(`提取失败：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  async function downloadAll() {
    const zip = new JSZip()
    images.forEach((img, i) => {
      const base64 = img.split(',')[1]
      zip.file(`page-${i + 1}.png`, base64, { base64: true })
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(blob, `${fileName}-images.zip`)
  }

  function downloadOne(dataUrl: string, index: number) {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${fileName}-page-${index + 1}.png`
    a.click()
  }

  return (
    <ToolLayout title="PDF 提取图片" description="将 PDF 每页渲染为高清图片并下载" icon="🖼️">
      <FileUploader
        onFiles={handleFile}
        accept={{ 'application/pdf': ['.pdf'] }}
        label="上传 PDF 文件"
      />

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-8 flex items-center justify-center gap-2 text-blue-600">
          <Loader2 className="animate-spin" size={20} />
          <span>正在提取图片，请稍候...</span>
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">共 {images.length} 页</h2>
            <button
              onClick={downloadAll}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Download size={16} />
              全部下载 ZIP
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <img src={img} alt={`Page ${i + 1}`} className="w-full object-contain" />
                <div className="p-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">第 {i + 1} 页</span>
                  <button
                    onClick={() => downloadOne(img, i)}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                  >
                    <Download size={12} /> 下载
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
