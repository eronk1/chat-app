import React from 'react'
import styles from './DirectMessageTyping.module.css'
import { useState, useEffect, useRef } from 'react';
export default function DirectMessageTyping({sender, message, pfp}){
    const [isShortMessage, setIsShortMessage] = useState(true);
    const [enableClamp, setEnableClamp] = useState(true);
    const messageRef = useRef(null);
    useEffect(() => {
        const messageElement = messageRef.current;
        const lineHeight = parseInt(window.getComputedStyle(messageElement).lineHeight);
        const maxHeight = lineHeight * 4; // Three lines
        setIsShortMessage(messageElement.scrollHeight <= maxHeight);
        console.log(messageElement.scrollHeight <= maxHeight)
    }, [message]);
    return(
      <div className={styles['message-parent']}>
        <img className='very-pro-image-lol' src={pfp} alt="cags2 (uwu) failed" />
        <div className={styles['message-part-parent']}>
            <div className={styles['the-header-parent']}>
                <p className='very-pro-sender-message'>{sender}</p>
                <ShowAllButton setEnableClamp={setEnableClamp} isShortMessage={isShortMessage} />
            </div>
            <div ref={messageRef} className={`${styles['the-message-body']} ${enableClamp ? styles['three-line-clamp'] : ''}`}>
                {message.replace(/  +/g, match => '\u00A0'.repeat(match.length))}
            </div>
        </div>
      </div>
    )
}

function ShowAllButton({ setEnableClamp, isShortMessage }) {
    const [arrowUp, setArrowUp] = useState(true); // State to track the arrow direction
    const [buttonBrightness, setButtonBrightness] = useState(`${isShortMessage ? 'brightness(90%)' : 'brightness(115%)'}`);
    const toggleArrow = () => {
        setArrowUp((old)=>{
            if(old){
                setEnableClamp(false);
            }else{
                setEnableClamp(true);
            }
            return !old;
        }); // Toggle the state between true and false
        setButtonBrightness(`${isShortMessage ? 'brightness(90%)' : 'brightness(115%)'}`)
        
    };
    useEffect(()=>{
        setButtonBrightness(`${isShortMessage ? 'brightness(90%)' : 'brightness(115%)'}`)
    },[isShortMessage])
    return (
        <button
            className={styles['show-all-button-parent']}
            onClick={toggleArrow}
            style={{ filter: buttonBrightness }}
            onMouseEnter={()=>setButtonBrightness('brightness(150%)')}
            onMouseLeave={()=>setButtonBrightness(`${isShortMessage ? 'brightness(90%)' : 'brightness(115%)'}`)}
        >
            Show All Text
            <span style={{ marginLeft: '5px' }}>
                {arrowUp ? '◄' : '▼'}
            </span>
        </button>
    );
}