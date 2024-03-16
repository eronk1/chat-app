import styles from './UserSettings.module.css';
import { motion } from 'framer-motion';

import React from 'react'


export default function UserSettings({setShowSettingsContent, userSummary}) {
  return (
    <div
        className={styles['user-settings-top-parent']}
    >
        <button onClick={() => setShowSettingsContent(old => !old)}>Esc</button>
        <button>logout</button>
    </div>
  )
}
