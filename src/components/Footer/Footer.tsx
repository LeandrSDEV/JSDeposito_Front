import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">JSDeposito</div>

        <nav className="footer-nav">
          <a href="/about">Sobre</a>
          <a href="/contact">Contato</a>
          <a href="/help">Ajuda</a>
        </nav>

        <div className="footer-socials">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <svg className="icon" viewBox="0 0 24 24"><path fill="currentColor" d="M22 12a10 10 0 10-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3 3-3 .9 0 1.8.2 1.8.2v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.4 3h-1.9v7A10 10 0 0022 12z"/></svg>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <svg className="icon" viewBox="0 0 24 24"><path fill="currentColor" d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 001.9-2.38 8.56 8.56 0 01-2.72 1.04 4.27 4.27 0 00-7.3 3.9 12.12 12.12 0 01-8.8-4.46 4.27 4.27 0 001.32 5.7 4.23 4.23 0 01-1.93-.53v.05a4.27 4.27 0 003.43 4.18 4.3 4.3 0 01-1.92.07 4.27 4.27 0 003.98 2.96 8.56 8.56 0 01-5.3 1.83A8.71 8.71 0 012 18.5a12.06 12.06 0 006.56 1.92c7.88 0 12.2-6.54 12.2-12.2 0-.18-.01-.36-.02-.54A8.7 8.7 0 0022.46 6z"/></svg>
          </a>
          <a href="https://www.instagram.com/jsdeposit0?igsh=MWR3Ymc4c21udGEwdQ==" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg className="icon" viewBox="0 0 24 24"><path fill="currentColor" d="M7 2C4.8 2 3 3.8 3 6v12c0 2.2 1.8 4 4 4h10c2.2 0 4-1.8 4-4V6c0-2.2-1.8-4-4-4H7zm0 2h10c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm5 3a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 110 4 2 2 0 010-4zm4.5-.1a1 1 0 11-2 0 1 1 0 012 0z"/></svg>
          </a>
        </div>
      </div>
      <div className="footer-copy">
        &copy; {new Date().getFullYear()} JSDeposito. Todos os direitos reservados.
      </div>
    </footer>
  );
}
