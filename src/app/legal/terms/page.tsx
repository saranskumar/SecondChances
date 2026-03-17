import styles from '../legal.module.css'

export const metadata = {
    title: 'Terms of Service - Second Chances',
}

export default function TermsOfServicePage() {
    return (
        <div className={styles.wrapper}>
            <h1 className={styles.title}>Terms of Service</h1>
            <span className={styles.lastUpdated}>Last Updated: March 2026</span>

            <div className={styles.content}>
                <p>
                    Welcome to Second Chances. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.
                </p>

                <h2>1. Acceptance of Terms</h2>
                <p>
                    By registering for an account, browsing, or listing items on Second Chances, you agree to comply with and be legally bound by these Terms. If you do not agree to these Terms, you may not use our platform.
                </p>

                <h2>2. Platform Eligibility</h2>
                <p>
                    You must be at least 18 years old to use this platform. By using Second Chances, you represent and warrant that you meet this requirement.
                </p>

                <h2>3. User Accounts</h2>
                <p>
                    You are responsible for safeguarding your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. We authenticate users via Google OAuth, and ask you to provide a display name for other users to identify you.
                </p>

                <h2>4. Marketplace Rules</h2>
                <p>
                    Second Chances is a peer-to-peer marketplace. We provide the platform for buyers and sellers to connect but do not own, create, sell, resell, or control any of the items listed.
                </p>
                <ul>
                    <li><strong>Prohibited Items:</strong> You may not list illegal, counterfeit, or explicitly prohibited items. All clothing and accessories must be clean and in the described condition.</li>
                    <li><strong>Accurate Descriptions:</strong> Sellers must accurately describe items, including their condition (e.g., Brand New, Like New, Good, Fair), and provide accurate photographs.</li>
                    <li><strong>Buyer Responsibilities:</strong> Buyers agree to inspect items upon delivery before making payment via Cash on Delivery (COD).</li>
                </ul>

                <h2>5. Transactions and Payments</h2>
                <p>
                    Currently, Second Chances operates on a Cash on Delivery (COD) / Direct Payment model.
                </p>
                <ul>
                    <li>When a buyer places an order, the seller is notified and provided with the buyer&apos;s contact information and delivery address.</li>
                    <li>It is the responsibility of the buyer and seller to arrange delivery or pickup.</li>
                    <li>Payment must be made directly to the seller upon satisfactory inspection of the item.</li>
                    <li>Second Chances does not process payments or hold funds in escrow, and is not responsible for transaction disputes.</li>
                </ul>

                <h2>6. Dispute Resolution</h2>
                <p>
                    Because Second Chances does not facilitate payments or hold inventory, any disputes arising from a transaction must be resolved directly between the buyer and the seller. We encourage users to communicate respectfully and resolve issues amicably.
                </p>

                <h2>7. Termination</h2>
                <p>
                    We reserve the right to suspend or terminate your account and access to the platform at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users.
                </p>

                <h2>8. Modifications</h2>
                <p>
                    We may revise these Terms of Service from time to time. The most current version will always be posted on this page. By continuing to use the platform after those revisions become effective, you agree to be bound by the revised terms.
                </p>
            </div>
        </div>
    )
}
