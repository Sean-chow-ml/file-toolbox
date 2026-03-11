import ConvertTool from './ConvertTool'

export default function PdfToWord() {
  return (
    <ConvertTool
      title="PDF 转 Word"
      description="提取 PDF 文字内容，转换为可编辑的 Word"
      icon="📋"
      endpoint="/api/convert/pdf-to-word"
      accept={{ 'application/pdf': ['.pdf'] }}
      outputExt="docx"
      uploadLabel="上传 PDF 文件"
    />
  )
}
