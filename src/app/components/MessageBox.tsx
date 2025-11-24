import React from 'react'
type Props = {
  id: number;
  role: string;
  content: string;
}
const MessageBox = ({id, role, content} : Props) => {
  const containerStyle = (role == 'bot') ? 'text-center p-4' : 'text-right p-4 bg-[#282a2c]';
  const bubbleStyle = `
    inline-block p-3 rounded-lg max-w-[70%]
    `;
  return (
    <div key={id} className={containerStyle}>
      <div className={bubbleStyle}>
        {content}
      </div>
    </div>
  )
}

export default MessageBox
