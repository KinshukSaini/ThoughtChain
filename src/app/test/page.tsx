import React from 'react'
import InputBox from '@/app/components/InputBox'
const ChatPage = () => {
  return (
    <div className="flex flex-row">

      {/* chatUI */}
      <div className='h-[100vh] w-[50%] bg-gray-200'>
        <div>
          <InputBox/>
        </div>
        
      </div>


      {/* mind map - graph */}
      <div className='h-[100vh] w-[50%] bg-gray-400'>
        
      </div>
    </div>
  )
}

export default ChatPage
