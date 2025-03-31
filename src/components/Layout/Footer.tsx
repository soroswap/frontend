import React from 'react';
import { styled, useTheme } from 'soroswap-ui';

// Styled Footer
const FooterContainer = styled('footer')<{ isMobile: boolean }>`
  padding: ${({ isMobile }) => (isMobile ? '20px' : '30px')};
  text-align: center;
  width: 100vw; // Full viewport width
  background: ${({ theme }) => theme.palette.background.paper};
  color: ${({ theme }) => theme.palette.text.secondary};
  display: flex;
  flex-direction: ${({ isMobile }) => (isMobile ? 'column' : 'row')};
  justify-content: space-between;
  align-items: ${({ isMobile }) => (isMobile ? 'center' : 'flex-start')};
  gap: 20px;
  flex-wrap: wrap;
  box-sizing: border-box;
  margin-left: 0; // No offset needed from MainBackground
  margin-right: 0; // No offset needed from MainBackground
  position: relative; // Ensure it respects document flow
  left: 0; // Align to left edge of viewport
`;

const LinksContainer = styled('div')`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
`;

const FooterLink = styled('a')`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-weight: 500;
  font-size: 15px;
  text-decoration: none;
  &:hover {
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const ExternalLinks = styled('div')`
  display: flex;
  gap: 15px;
  align-items: center;
`;

const ExternalButton = styled('button')`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.palette.text.primary}; // Set color to white for the button
  &:hover {
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const SocialButton = styled('button')`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  color: white;
  &:hover {
    color: ${({ theme }) => theme.palette.primary.main};
  }
`;

interface FooterProps {
  isMobile: boolean;
}

const Footer: React.FC<FooterProps> = ({ isMobile }) => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer isMobile={isMobile}>
      <div>
        <LinksContainer>
          <FooterLink href="/#">Home</FooterLink>
          <FooterLink href="/terms">Terms of Use</FooterLink>
          <FooterLink href="/privacy">Privacy Policy</FooterLink>
        </LinksContainer>
        <div style={{ marginTop: '10px', textAlign: isMobile ? 'center' : 'left' }}>
          ©{currentYear} Soroswap. <span style={{ fontWeight: 600 }}>All rights reserved.</span>
        </div>
      </div>

      <ExternalLinks>


        {/* Social Media Buttons */}

        <SocialButton onClick={() => window.open('https://docs.soroswap.finance/', '_blank')}>
            <svg width="25" height="25" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '5px' }}>
                <path d="M14.001 5.5h-4v-4m4 4v10h-12v-14h8m4 4l-4-4M5.001 8.5h6M5.001 11.5h4" stroke="#ffffff" />
            </svg>
            Docs
        </SocialButton>
        
        <SocialButton onClick={() => window.open('https://dune.com/paltalabs/soroswap', '_blank')}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sc-bAEjGW fDEMCB">
            <path d="M11.993 23.981c6.623 0 11.993-5.368 11.993-11.99C23.986 5.368 18.616 0 11.993 0S.001 5.368.001 11.99c0 6.623 5.37 11.991 11.992 11.991z" fill="#F4603E"></path>
            <path d="M2.088 18.754s7.924-2.596 21.891-7.15c0 0 .765 7.458-6.966 11.348 0 0-3.813 1.828-7.996.655 0 0-4.165-.786-6.93-4.853z" fill="#1E1870"></path>
        </svg>

            Dune
        </SocialButton>

        <SocialButton onClick={() => window.open("https://github.com/soroswap/", '_blank')}>
          <svg width="25" height="25" viewBox="0 0 34 33" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 0.208496C14.8113 0.208496 12.644 0.639592 10.6219 1.47717C8.59983 2.31475 6.76251 3.54241 5.21487 5.09005C2.08926 8.21566 0.333313 12.4549 0.333313 16.8752C0.333313 24.2418 5.11665 30.4918 11.7333 32.7085C12.5666 32.8418 12.8333 32.3252 12.8333 31.8752V29.0585C8.21665 30.0585 7.23331 26.8252 7.23331 26.8252C6.46665 24.8918 5.38331 24.3752 5.38331 24.3752C3.86665 23.3418 5.49998 23.3752 5.49998 23.3752C7.16665 23.4918 8.04998 25.0918 8.04998 25.0918C9.49998 27.6252 11.95 26.8752 12.9 26.4752C13.05 25.3918 13.4833 24.6585 13.95 24.2418C10.25 23.8252 6.36665 22.3918 6.36665 16.0418C6.36665 14.1918 6.99998 12.7085 8.08331 11.5252C7.91665 11.1085 7.33331 9.37516 8.24998 7.12516C8.24998 7.12516 9.64998 6.67516 12.8333 8.82516C14.15 8.4585 15.5833 8.27516 17 8.27516C18.4166 8.27516 19.85 8.4585 21.1666 8.82516C24.35 6.67516 25.75 7.12516 25.75 7.12516C26.6666 9.37516 26.0833 11.1085 25.9166 11.5252C27 12.7085 27.6333 14.1918 27.6333 16.0418C27.6333 22.4085 23.7333 23.8085 20.0166 24.2252C20.6166 24.7418 21.1666 25.7585 21.1666 27.3085V31.8752C21.1666 32.3252 21.4333 32.8585 22.2833 32.7085C28.9 30.4752 33.6666 24.2418 33.6666 16.8752C33.6666 14.6865 33.2356 12.5192 32.398 10.4971C31.5604 8.47501 30.3327 6.63769 28.7851 5.09005C27.2374 3.54241 25.4001 2.31475 23.378 1.47717C21.3559 0.639592 19.1887 0.208496 17 0.208496Z" fill="#ffffff" />
          </svg>
        </SocialButton>
        <SocialButton onClick={() => window.open("https://www.linkedin.com/company/paltalabs", '_blank')}>
          <svg width="25" height="25" viewBox="0 0 30 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M26.6667 0.875C27.5507 0.875 28.3986 1.22619 29.0237 1.85131C29.6488 2.47643 30 3.32428 30 4.20833V27.5417C30 28.4257 29.6488 29.2736 29.0237 29.8987C28.3986 30.5238 27.5507 30.875 26.6667 30.875H3.33333C2.44928 30.875 1.60143 30.5238 0.976311 29.8987C0.351189 29.2736 0 28.4257 0 27.5417V4.20833C0 3.32428 0.351189 2.47643 0.976311 1.85131C1.60143 1.22619 2.44928 0.875 3.33333 0.875H26.6667ZM25.8333 26.7083V17.875C25.8333 16.434 25.2609 15.052 24.2419 14.0331C23.223 13.0141 21.841 12.4417 20.4 12.4417C18.9833 12.4417 17.3333 13.3083 16.5333 14.6083V12.7583H11.8833V26.7083H16.5333V18.4917C16.5333 17.2083 17.5667 16.1583 18.85 16.1583C19.4688 16.1583 20.0623 16.4042 20.4999 16.8418C20.9375 17.2793 21.1833 17.8728 21.1833 18.4917V26.7083H25.8333ZM6.46667 10.1417C7.20927 10.1417 7.92146 9.84667 8.44657 9.32157C8.97167 8.79646 9.26667 8.08427 9.26667 7.34167C9.26667 5.79167 8.01667 4.525 6.46667 4.525C5.71964 4.525 5.00321 4.82175 4.47498 5.34998C3.94675 5.87821 3.65 6.59464 3.65 7.34167C3.65 8.89167 4.91667 10.1417 6.46667 10.1417ZM8.78333 26.7083V12.7583H4.16667V26.7083H8.78333Z" fill="#ffffff" />
          </svg>
        </SocialButton>
        <SocialButton onClick={() => window.open("https://discord.gg/yXFaku4w9u", '_blank')}>
          <svg width="25" height="25" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30.1167 2.75825C27.9 1.72491 25.5 0.974914 23 0.541581C22.9781 0.54088 22.9563 0.544993 22.9361 0.553632C22.916 0.562271 22.8979 0.575225 22.8833 0.591581C22.5833 1.14158 22.2333 1.85825 22 2.40825C19.3483 2.00825 16.6517 2.00825 14 2.40825C13.7667 1.84158 13.4167 1.14158 13.1 0.591581C13.0833 0.558248 13.0333 0.541581 12.9833 0.541581C10.4833 0.974914 8.09999 1.72491 5.86666 2.75825C5.84999 2.75825 5.83333 2.77491 5.81666 2.79158C1.28333 9.57491 0.0333253 16.1749 0.649992 22.7082C0.649992 22.7416 0.666659 22.7749 0.699992 22.7916C3.69999 24.9916 6.58333 26.3249 9.43333 27.2082C9.48333 27.2249 9.53332 27.2082 9.54999 27.1749C10.2167 26.2582 10.8167 25.2916 11.3333 24.2749C11.3667 24.2082 11.3333 24.1416 11.2667 24.1249C10.3167 23.7582 9.41666 23.3249 8.53333 22.8249C8.46666 22.7916 8.46666 22.6916 8.51666 22.6416C8.69999 22.5082 8.88332 22.3582 9.06666 22.2249C9.09999 22.1916 9.14999 22.1916 9.18333 22.2082C14.9167 24.8249 21.1 24.8249 26.7667 22.2082C26.8 22.1916 26.85 22.1916 26.8833 22.2249C27.0667 22.3749 27.25 22.5082 27.4333 22.6582C27.5 22.7082 27.5 22.8082 27.4167 22.8416C26.55 23.3582 25.6333 23.7749 24.6833 24.1416C24.6167 24.1582 24.6 24.2416 24.6167 24.2916C25.15 25.3082 25.75 26.2749 26.4 27.1916C26.45 27.2082 26.5 27.2249 26.55 27.2082C29.4167 26.3249 32.3 24.9916 35.3 22.7916C35.3333 22.7749 35.35 22.7416 35.35 22.7082C36.0833 15.1582 34.1333 8.60825 30.1833 2.79158C30.1667 2.77491 30.15 2.75825 30.1167 2.75825ZM12.2 18.7249C10.4833 18.7249 9.04999 17.1416 9.04999 15.1916C9.04999 13.2416 10.45 11.6582 12.2 11.6582C13.9667 11.6582 15.3667 13.2582 15.35 15.1916C15.35 17.1416 13.95 18.7249 12.2 18.7249ZM23.8167 18.7249C22.1 18.7249 20.6667 17.1416 20.6667 15.1916C20.6667 13.2416 22.0667 11.6582 23.8167 11.6582C25.5833 11.6582 26.9833 13.2582 26.9667 15.1916C26.9667 17.1416 25.5833 18.7249 23.8167 18.7249Z" fill="#ffffff" />
          </svg>
        </SocialButton>
        <SocialButton onClick={() => window.open("https://medium.com/soroswap", '_blank')}>
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0,0,256,256">
            <g fill="#ffffff" stroke-miterlimit="10" style={{ mixBlendMode: "normal" }}>
              <g transform="scale(5.33333,5.33333)">
                <circle cx="14" cy="24" r="12" />
                <ellipse cx="34" cy="24" rx="6" ry="11" />
                <ellipse cx="44" cy="24" rx="2" ry="10" />
              </g>
            </g>
          </svg>
        </SocialButton>
        <SocialButton onClick={() => window.open("https://twitter.com/SoroswapFinance", '_blank')}>
          <svg width="25" height="25" viewBox="0 0 36 29" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M35.4333 3.87484C34.15 4.45817 32.7667 4.8415 31.3333 5.02484C32.8 4.1415 33.9333 2.7415 34.4667 1.05817C33.0833 1.8915 31.55 2.47484 29.9333 2.80817C28.6167 1.37484 26.7667 0.541504 24.6667 0.541504C20.75 0.541504 17.55 3.7415 17.55 7.6915C17.55 8.25817 17.6167 8.80817 17.7333 9.32484C11.8 9.02484 6.51665 6.17484 2.99998 1.85817C2.38332 2.90817 2.03332 4.1415 2.03332 5.4415C2.03332 7.92484 3.28332 10.1248 5.21665 11.3748C4.03332 11.3748 2.93332 11.0415 1.96665 10.5415V10.5915C1.96665 14.0582 4.43332 16.9582 7.69998 17.6082C6.6512 17.8952 5.55014 17.9351 4.48332 17.7248C4.93599 19.1456 5.82255 20.3889 7.01834 21.2797C8.21414 22.1706 9.65906 22.6643 11.15 22.6915C8.6227 24.6922 5.48998 25.7737 2.26665 25.7582C1.69998 25.7582 1.13332 25.7248 0.56665 25.6582C3.73332 27.6915 7.49998 28.8748 11.5333 28.8748C24.6667 28.8748 31.8833 17.9748 31.8833 8.52484C31.8833 8.20817 31.8833 7.90817 31.8666 7.5915C33.2666 6.5915 34.4666 5.32484 35.4333 3.87484Z" fill="#ffffff" />
          </svg>
        </SocialButton>
      </ExternalLinks>
    </FooterContainer>
  );
};

export default Footer;
