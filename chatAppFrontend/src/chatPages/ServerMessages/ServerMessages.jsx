import React from 'react'
import { useParams, Outlet } from "react-router-dom";

function ServerMessages() {
  const { channelId, messageId } = useParams();

  
  return (
    <div>
      <Outlet />
    </div>
  )
}

export default ServerMessages