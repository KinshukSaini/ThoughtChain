import React from 'react'
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkSupersub from 'remark-supersub'; // For H~2~O and X^2^
import { remarkHighlightMark } from 'remark-highlight-mark';


type Props = {
  id: number;
  role: string;
  content: string;
  files?: { name: string; type: string; size: number }[];
}
const MessageBox = ({id, role, content, files} : Props) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className='text-lg'>
      {role === 'user' ? (
        <div className="flex justify-end m-2">
          <div className="bg-[#292a2c] text-white p-4 rounded-l-2xl max-w-xs wrap-break-word rounded-tr-2xl">
            {content}
            {files && files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((file, index) => (
                  <div key={index} className="text-xs bg-gray-700 p-2 rounded flex items-center gap-2">
                    <span>📎</span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{file.name}</div>
                      <div className="text-gray-400">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-start m-2">
          <div className="text-white p-4 rounded-lg max-w-max wrap-break-word"><ReactMarkdown remarkPlugins={[remarkGfm, remarkSupersub]}>{content}</ReactMarkdown></div>
        </div>
      )}
    </div>
  )
}

export default MessageBox
