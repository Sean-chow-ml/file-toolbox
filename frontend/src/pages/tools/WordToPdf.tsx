import ConvertTool from './ConvertTool'

export default function WordToPdf() {
  return (
    <ConvertTool
      title="Word 转 PDF"
      description="高质量转换，保持原始排版"
      icon="📝"
      endpoint="/api/convert/word-to-pdf"
      accept={{ 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/msword': ['.doc'] }}
      outputExt="pdf"
      uploadLabel="上传 Word 文件（.doc / .docx）"
    />
  )
}
