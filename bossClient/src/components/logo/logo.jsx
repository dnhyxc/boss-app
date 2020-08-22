import React from 'react'
import './lodo.less'
import logo from './logo.jpg'

export default function Logo() {
    return (
        <div className="logo-container">
            <img src={logo} alt="logopic" className='logo-img' />
        </div>
    )
}