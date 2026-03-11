import ConvertTool from './ConvertTool'

export default function ExcelToPdf() {
  return (
    <ConvertTool
      title="Excel 转 PDF"
      description="将表格文件转换为 PDF，保持格式"
      icon="📊"
      endpoint="/api/convert/excel-to-pdf"
      accept={{
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls'],
      }}
      outputExt="pdf"
      uploadLabel="上传 Excel 文件（.xls / .xlsx）"
    />
  )
}
