import React from 'react'
import './StarterHeader.css'
import {Link} from 'react-router-dom'

export default function StarterHeader(props) {
  return (
    <header id='starterPageHeading'>
        <Link className='signupButton' to={props.topRightButtonLink}>{props.topRightButtonValue}</Link>
    </header>
  )
}
