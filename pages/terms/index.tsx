import React from 'react';

const TermsOfUse = () => {
  return (
    <div
      style={{
        margin: '20px',
        maxWidth: '800px', // Limits the width to make the content more centered
        marginLeft: 'auto', // Centers the content horizontally
        marginRight: 'auto', // Centers the content horizontally
      }}
    >
      <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>Soroswap Terms of Use</h1>
      
      <h2 style={{ marginBottom: '10px' }}>1. Introduction</h2>
      <p style={{ marginBottom: '20px' }}>
        Welcome to Soroswap, a decentralized cryptocurrency exchange ("the Exchange"). By using the services provided by Soroswap, you ("User," "You," or "Your") agree to comply with and be bound by these Terms of Use ("Terms"). If you do not agree with these Terms, please do not use the services of the Exchange.
      </p>
      <p style={{ marginBottom: '20px' }}>
        These Terms are a legally binding agreement between you and Soroswap. Please read them carefully.
      </p>

      <h2 style={{ marginBottom: '10px' }}>2. Services Provided</h2>
      <p style={{ marginBottom: '20px' }}>
        Soroswap is a decentralized platform that enables Users to trade digital assets, such as cryptocurrencies and tokens, directly with one another, without the need for an intermediary. Our platform operates using smart contracts and blockchain technology to facilitate peer-to-peer transactions.
      </p>
      <p style={{ marginBottom: '10px' }}>The services provided by Soroswap include:</p>
      <ul style={{ marginBottom: '20px' }}>
        <li>Trading of cryptocurrencies and tokens</li>
        <li>Swap services between digital assets</li>
        <li>Liquidity provision and staking options</li>
        <li>Other services as may be added from time to time</li>
      </ul>

      <h2 style={{ marginBottom: '10px' }}>3. Eligibility</h2>
      <p style={{ marginBottom: '20px' }}>
        You must be at least 18 years old or the legal age in your jurisdiction to use the services of the Exchange. By accessing and using the Exchange, you confirm that you meet the eligibility criteria.
      </p>
      <p style={{ marginBottom: '20px' }}>
        You also represent and warrant that you are not located in, or a resident of, any jurisdiction where the use of decentralized exchange services is prohibited or restricted.
      </p>

      <h2 style={{ marginBottom: '10px' }}>4. Account and Security</h2>
      <p style={{ marginBottom: '20px' }}>
        While Soroswap is a decentralized exchange that does not require user accounts, some features may require interacting with a digital wallet or connecting via third-party services (such as MetaMask, Trust Wallet, etc.).
      </p>
      <p style={{ marginBottom: '20px' }}><strong>Wallet Security:</strong> You are solely responsible for maintaining the security and confidentiality of your wallet private keys, passwords, and any other credentials. The Exchange will not be liable for any loss of funds due to compromised keys or security breaches on your part.</p>
      <p style={{ marginBottom: '20px' }}><strong>Transactions:</strong> You agree to conduct all transactions through your digital wallet, and you are responsible for confirming the details of each transaction before initiating it.</p>

      <h2 style={{ marginBottom: '10px' }}>5. Risk Acknowledgment</h2>
      <p style={{ marginBottom: '20px' }}>
        Cryptocurrency assets are subject to high market risks and volatility. Past performance is not indicative of future results. Investments in blockchain assets may result in loss of part or all of your investment. Please do your own research and use caution. You are solely responsible for your actions on the Stellar network. Soroswap is not responsible for your investment losses.
      </p>
      <p style={{ marginBottom: '20px' }}>
        Cryptocurrency assets, “automated market making” (AMM), “voting” and the "decentralized exchange" (DEX) are unregulated and do not have governmental oversight. The SEC has recently issued a "Statement on Cryptocurrencies and Initial Coin Offerings" that may be of interest to you.
      </p>

      <h2 style={{ marginBottom: '10px' }}>6. The Stellar Network (Separate from Soroswap)</h2>
      <p style={{ marginBottom: '20px' }}>
        Soroswap operates on the Stellar network. Soroswap is unable to control the actions of others on the Stellar network. When using Soroswap, you are communicating with the Stellar network. Transactions on the Stellar network are irreversible. Soroswap is not a custodian of your assets. We do not store any tokens, cryptoassets, or private keys on your behalf.
      </p>

      <h2 style={{ marginBottom: '10px' }}>7. User Conduct</h2>
      <p style={{ marginBottom: '20px' }}>
        By using Soroswap, you agree to:
      </p>
      <ul style={{ marginBottom: '20px' }}>
        <li>Comply with all applicable laws, rules, and regulations in your jurisdiction.</li>
        <li>Not engage in any activities that would result in the exploitation or manipulation of the Exchange's services, including but not limited to market manipulation, fraudulent behavior, or money laundering.</li>
        <li>Not use the Exchange for illegal activities, including the trading of illicit or prohibited assets.</li>
      </ul>

      <h2 style={{ marginBottom: '10px' }}>8. No Custodial Services</h2>
      <p style={{ marginBottom: '20px' }}>
        Soroswap is a non-custodial platform, meaning that we do not hold or store any of your funds or assets. All transactions and assets are stored in your wallet, and you retain full control of your private keys.
      </p>
      <p style={{ marginBottom: '20px' }}>
        We do not provide any custodial services, and we do not have access to your funds. It is your responsibility to safeguard your assets.
      </p>

      <h2 style={{ marginBottom: '10px' }}>9. Limitation of Liability</h2>
      <p style={{ marginBottom: '20px' }}>
        To the maximum extent permitted by law:
      </p>
      <ul style={{ marginBottom: '20px' }}>
        <li>Soroswap is not liable for any loss or damage arising from the use of the Exchange or any transaction executed on the platform.</li>
        <li>Soroswap does not guarantee the security, stability, or availability of the platform at all times.</li>
        <li>The Exchange is not liable for any losses due to technical issues, such as network outages or smart contract failures.</li>
        <li>You, the user, are solely responsible for ensuring your own compliance with laws and taxes in your jurisdiction. Cryptocurrencies may be illegal in your area. You are solely responsible for your own security, including keeping your account secret keys safe and backed up.</li>
      </ul>

      <h2 style={{ marginBottom: '10px' }}>10. Privacy</h2>
      <p style={{ marginBottom: '20px' }}>
        As a decentralized platform, Soroswap does not collect or store personal data. However, by interacting with the platform, you may provide certain information through your wallet or third-party services. Please review the privacy policy.
      </p>

      <h2 style={{ marginBottom: '10px' }}>11. Disclaimer of Warranty</h2>
      <p style={{ marginBottom: '20px' }}>
        Soroswap is open-source software licensed under the Apache-2.0 license. It is provided free of charge and on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
      </p>
    </div>
  );
};

export default TermsOfUse;
