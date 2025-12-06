import React from 'react'
import MessageBox from './MessageBox'

type message = {
    id: number;
    role: string;
    content: string;
    nodeId?: number;
    files?: { name: string; type: string; size: number }[];
}
type Props = {
    messages : message[];
    messageRefs?: React.MutableRefObject<Map<number, HTMLDivElement>>;
}

const MessageSection = ({messages, messageRefs} : Props) => {
  return (
    <div className='flex flex-col'>
        {messages.map(msg => {
            return (
              <div 
                key={msg.id} 
                ref={(el) => {
                  if (el && messageRefs) {
                    messageRefs.current.set(msg.id, el);
                  }
                }}
              >
                <MessageBox id={msg.id} role={msg.role} content={msg.content} files={msg.files} />
              </div>
            );
        })}
    </div>
  )
}

export default MessageSection
