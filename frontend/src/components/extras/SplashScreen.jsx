import React, { useState, useEffect } from 'react'
import styles from '../../styles/Splashscreen.module.css'

const SplashScreen = () => {
  const [loadingText, setLoadingText] = useState('Loading...')

  useEffect(() => {
    const loadingMessages = [
      'Loading...',
      'Preparing your experience...',
      'Almost ready...',
      'Welcome to NutriConnect!'
    ]
    const interval = setInterval(() => {
      setLoadingText(prev => {
        const currentIndex = loadingMessages.indexOf(prev)
        const nextIndex = (currentIndex + 1) % loadingMessages.length
        return loadingMessages[nextIndex]
      })
    }, 1250)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.splashContainer}>
      <div className={styles.splashFadeIn}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <div className={styles.iconContainer}>
              <i className='fas fa-leaf'></i>
            </div>
            <span className={styles.logoText}>
              <span className={styles.highlight}>N</span>utri
              <span className={styles.highlight}>C</span>onnect
            </span>
          </div>
        </div>

        <p className={styles.tagline}>
          FUELING HEALTH WITH NUTRITION AND CONNECTION
        </p>

        <div className={styles.progressBar}>
          <div className={styles.progressFill}></div>
        </div>

        <div className={styles.loadingText}>{loadingText}</div>

        <div className={styles.poweredBy}>Powered by NutriConnect</div>

        <div
          style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
        >
          <div className={styles.securedBadge}>
            <i className='fas fa-shield-alt'></i>
            <span>Secured & Protected</span>
          </div>
        </div>
      </div>
      <footer className={styles.footer}>
        <div className='footer-bottom'>
          <p>© 2025 Nutri Connect. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default SplashScreen
