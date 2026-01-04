import React from 'react'
import { useNavigate } from 'react-router-dom'

const InstitutionDashboard = () => {
  const navigate = useNavigate();
  return (
    <div className='text-center w-screen h-screen'>
      Under Progress
      <button
        className='min-h-screen flex items-center justify-center mx-auto'
        onClick={() => navigate('/institution/profile')}>
        Profile
      </button>
    </div>
  )
}

export default InstitutionDashboard
