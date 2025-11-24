import React from 'react'
import MessageBox from './MessageBox'

type message = {
    id: number;
    role: string;
    content: string;
}
type Props = {
    messages : message[];
}

const MessageSection = ({messages} : Props) => {
  return (
    <div className='flex-col-reverse'>
        {messages.map(msg => {
            return <MessageBox key={msg.id} id={msg.id} role={msg.role} content={msg.content} />
        })}
    </div>
  )
}

export default MessageSection
