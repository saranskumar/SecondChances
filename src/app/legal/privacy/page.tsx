import styles from '../legal.module.css'

export const metadata = {
    title: 'Privacy Policy - Second Chances',
}

export default function PrivacyPolicyPage() {
    return (
        <div className={styles.wrapper}>
            <h1 className={styles.title}>Privacy Policy</h1>
            <span className={styles.lastUpdated}>Last Updated: March 2026</span>

            <div className={styles.content}>
                <p>
                    At Second Chances, we value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you use our thrifting platform.
                </p>

                <h2>1. Information We Collect</h2>
                <p>When you use Second Chances, we may collect the following types of information:</p>
                <ul>
                    <li><strong>Account Information:</strong> Name, email address, phone number, and delivery addresses.</li>
                    <li><strong>Authentication Data:</strong> OAuth profile information when you sign in via Google.</li>
                    <li><strong>Transaction Data:</strong> Details about items you list, orders you place, and your browsing history on our platform.</li>
                    <li><strong>User Content:</strong> Product descriptions, images of items you list, and communications with other users.</li>
                </ul>

                <h2>2. How We Use Your Information</h2>
                <p>We use the collected information for the following purposes:</p>
                <ul>
                    <li>To provide, maintain, and improve our marketplace platform.</li>
                    <li>To facilitate transactions and communication between buyers and sellers.</li>
                    <li>To manage your account and provide customer support.</li>
                    <li>To send administrative emails, order updates, and essential security notices.</li>
                    <li>To maintain a safe and trustworthy environment by monitoring for fraudulent activity.</li>
                </ul>

                <h2>3. Information Sharing</h2>
                <p>
                    Second Chances is a peer-to-peer marketplace. For a transaction to take place, we must share specific information between the buyer and seller.
                </p>
                <ul>
                    <li><strong>With Sellers:</strong> When you place an order, we share your name, phone number, and delivery address with the seller so they can arrange delivery.</li>
                    <li><strong>With Buyers:</strong> Your display name is visible on your product listings.</li>
                    <li><strong>Third-Party Services:</strong> We may share data with service providers who assist us in operating our platform (e.g., Supabase for database and authentication, Vercel for hosting).</li>
                </ul>
                <p>We do not sell your personal data to advertisers or third parties.</p>

                <h2>4. Data Security</h2>
                <p>
                    We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, please note that no method of transmission over the internet or electronic storage is 100% secure.
                </p>

                <h2>5. Contact Us</h2>
                <p>
                    If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:hello@secondchances.in">hello@secondchances.in</a>.
                </p>
            </div>
        </div>
    )
}
