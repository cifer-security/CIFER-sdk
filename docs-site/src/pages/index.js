import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HeroBanner() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleAccent}>Quantum-Resistant</span>
              <br />
              Encryption
            </h1>
            <p className={styles.heroSubtitle}>
              CIFER SDK provides post-quantum cryptographic infrastructure for blockchain applications. 
              Secure your on-chain data with ML-KEM-768 key encapsulation and AES-GCM encryption.
            </p>
            <div className={styles.heroButtons}>
              <Link
                className={clsx('button button--primary button--lg', styles.heroButton)}
                to="/docs/getting-started/installation">
                Get Started →
              </Link>
              <Link
                className={clsx('button button--outline button--lg', styles.heroButtonSecondary)}
                to="/docs/api">
                API Reference
              </Link>
            </div>
            <div className={styles.installCommand}>
              <code>npm install cifer-sdk</code>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

const features = [
  {
    title: 'Quantum-Resistant',
    icon: '🔐',
    description: 'Built on ML-KEM-768 (NIST post-quantum standard) for encryption that stays secure against future quantum computers.',
    link: '/docs/getting-started/concepts',
  },
  {
    title: 'Multi-Chain Ready',
    icon: '🌐',
    description: 'Automatic chain discovery with support for multiple networks. Deploy secrets once, use across chains.',
    link: '/docs/getting-started/concepts',
  },
  {
    title: 'Wallet Agnostic',
    icon: '💼',
    description: 'Works with any EIP-1193 wallet—MetaMask, WalletConnect, Coinbase, or your own custom signer.',
    link: '/docs/getting-started/quick-start',
  },
  {
    title: 'Zero Dependencies',
    icon: '📦',
    description: 'No wallet library lock-in. Bring your own wallet stack—ethers, viem, wagmi, or vanilla JS.',
    link: '/docs/getting-started/concepts',
  },
  {
    title: 'File Encryption',
    icon: '📁',
    description: 'Encrypt files of any size with async job processing. Perfect for NFT metadata, documents, and media.',
    link: '/docs/guides/encryption',
  },
  {
    title: 'On-Chain Commitments',
    icon: '⛓️',
    description: 'Store encrypted data commitments on-chain with log-based retrieval and integrity verification.',
    link: '/docs/guides/commitments',
  },
];

function FeatureCard({title, icon, description, link}) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureIcon}>
        {icon}
      </div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDescription}>{description}</p>
      <Link to={link} className={styles.featureLink}>
        Learn more →
      </Link>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section className={styles.features}>
      <div className="container">
        <h2 className={styles.sectionTitle}>
          Why <span className={styles.sectionTitleAccent}>CIFER</span> SDK?
        </h2>
        <div className={styles.featureGrid}>
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CodeExample() {
  return (
    <section className={styles.codeSection}>
      <div className="container">
        <h2 className={styles.sectionTitle}>
          Simple, <span className={styles.sectionTitleAccent}>Powerful</span> API
        </h2>
        <div className={styles.codeWrapper}>
          <pre className={styles.codeBlock}>
            <code>{`import { createCiferSdk, Eip1193SignerAdapter, blackbox } from 'cifer-sdk';

// Initialize SDK with automatic chain discovery
const sdk = await createCiferSdk({
  blackboxUrl: 'https://cifer-blackbox.ternoa.dev:3010',
});

// Connect your wallet
const signer = new Eip1193SignerAdapter(window.ethereum);

// Encrypt data with quantum-resistant encryption
const encrypted = await blackbox.payload.encryptPayload({
  chainId: 752025,
  secretId: 123n,
  plaintext: 'My confidential data',
  signer,
  readClient: sdk.readClient,
  blackboxUrl: sdk.blackboxUrl,
});

// Store encrypted.cifer on-chain, encrypted.encryptedMessage off-chain
console.log('Encrypted successfully!');`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

function ArchitectureSection() {
  return (
    <section className={styles.architectureSection}>
      <div className="container">
        <h2 className={styles.sectionTitle}>
          How It <span className={styles.sectionTitleAccent}>Works</span>
        </h2>
        <div className={styles.architectureGrid}>
          <div className={styles.archStep}>
            <div className={styles.archNumber}>1</div>
            <h3>Create a Secret</h3>
            <p>Register a quantum-resistant keypair on the SecretsController contract. The private key is secured in the CIFER network.</p>
          </div>
          <div className={styles.archStep}>
            <div className={styles.archNumber}>2</div>
            <h3>Encrypt Data</h3>
            <p>Send plaintext to the Blackbox API with wallet signature authorization. Data is encrypted using your secret's public key.</p>
          </div>
          <div className={styles.archStep}>
            <div className={styles.archNumber}>3</div>
            <h3>Store On-Chain</h3>
            <p>Commit the encrypted envelope to any CIFER-compatible smart contract. The encrypted payload can be stored anywhere.</p>
          </div>
          <div className={styles.archStep}>
            <div className={styles.archNumber}>4</div>
            <h3>Decrypt Anytime</h3>
            <p>Authorized users can decrypt by signing a request. The Blackbox verifies ownership and returns plaintext.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <h2 className={styles.ctaTitle}>
          Ready to <span className={styles.ctaTitleAccent}>Build</span>?
        </h2>
        <p className={styles.ctaText}>
          Start encrypting your blockchain data with quantum-resistant security in minutes.
        </p>
        <div className={styles.ctaButtons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/getting-started/installation">
            Read the Docs
          </Link>
          <Link
            className="button button--outline button--lg"
            href="https://github.com/cifer-security/cifer-sdk">
            View on GitHub
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Quantum-Resistant Encryption for Web3"
      description="CIFER SDK provides post-quantum cryptographic infrastructure for blockchain applications using ML-KEM-768 and AES-GCM encryption.">
      <HeroBanner />
      <main>
        <FeaturesSection />
        <CodeExample />
        <ArchitectureSection />
        <CTASection />
      </main>
    </Layout>
  );
}
