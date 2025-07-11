import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Navbar = () => {
  const { user, setShowLogin, logout, credit } = useContext(AppContext)
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()

  const handleProfileClick = () => {
    setShowMenu((prev) => !prev)
  }

  const handleLogout = () => {
    setShowMenu(false)
    logout()
  }

  return (
    <div className='flex items-center justify-between py-4 relative'>
      <Link to='/'>
        <img src={assets.logo} alt='logo' className='w-28 sm:w-32 lg:w-40' />
      </Link>
      <div>
        {user ? (
          <div className='flex items-center gap-2 sm:gap-3'>
            <button
              onClick={() => navigate('/buy')}
              className='flex items-center gap-2 bg-blue-100 px-4 sm:px-6 py-1.5 sm:py-3 rounded-full hover:scale-105 transition-all duration-700 ease-in-out'
            >
              <img className='w-5' src={assets.credit_star} alt='credit' />
              <p className='text-xs sm:text-sm font-medium text-gray-600'>
                Credits Left: {credit}
              </p>
            </button>

            <p className='text-gray-600 max-sm:hidden pl-4'>Hi, {user.name}</p>

            {/* Clickable profile menu */}
            <div className='relative'>
              <img
                onClick={handleProfileClick}
                className='w-10 drop-shadow cursor-pointer'
                src={assets.profile_icon}
                alt='profile-user'
              />

              {showMenu && (
                <div className='absolute top-full right-0 z-10 bg-white text-black rounded shadow-md mt-2'>
                  <ul className='list-none m-0 p-2 bg-white rounded-md border text-sm'>
                    <li
                      onClick={handleLogout}
                      className='py-1 px-4 hover:bg-gray-200 cursor-pointer'
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className='flex items-center gap-3 sm:gap-5'>
            <p onClick={() => navigate('/buy')} className='cursor-pointer'>
              Pricing
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className='bg-zinc-800 text-white px-7 py-2 sm:px-10 text-sm rounded-full'
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar
