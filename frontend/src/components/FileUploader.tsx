import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'

interface Props {
  onFiles: (files: File[]) => void
  accept?: Record<string, string[]>
  multiple?: boolean
  label?: string
}

export default function FileUploader({ onFiles, accept, multiple = false, label }: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFiles,
    accept,
    multiple,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
        ${isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-3 text-gray-400" size={40} />
      <p className="text-lg font-medium text-gray-700">
        {isDragActive ? '松开即可上传' : label || '拖拽文件到此处'}
      </p>
      <p className="text-sm text-gray-400 mt-1">或 <span className="text-blue-500">点击选择文件</span></p>
    </div>
  )
}
