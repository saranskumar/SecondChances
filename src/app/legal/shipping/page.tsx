import styles from '../legal.module.css'

export const metadata = {
    title: 'Shipping Policy - Second Chances',
}

export default function ShippingPolicyPage() {
    return (
        <div className={styles.wrapper}>
            <h1 className={styles.title}>Shipping Policy</h1>
            <span className={styles.lastUpdated}>Last Updated: March 2026</span>

            <div className={styles.content}>
                <p>
                    Second Chances is a peer-to-peer marketplace. We connect buyers and sellers, but we do not handle inventory, fulfillment, or shipping mechanics centrally. This policy outlines how shipping and delivery are expected to be handled between users.
                </p>

                <h2>1. Order Process</h2>
                <p>
                    When a buyer places an order on Second Chances:
                </p>
                <ul>
                    <li>The item is marked as &quot;sold&quot; on the platform and reserved for the buyer.</li>
                    <li>The seller receives a notification with the buyer&apos;s name, delivery address, and phone number.</li>
                    <li>The buyer receives an order confirmation with the order details.</li>
                </ul>

                <h2>2. Delivery Arrangements</h2>
                <p>
                    Within 24 hours of an order being placed, the seller must contact the buyer using the phone number provided at checkout.
                </p>
                <ul>
                    <li><strong>Mutual Agreement:</strong> The buyer and seller are responsible for mutually agreeing on a delivery method and timeline.</li>
                    <li><strong>Local Pickup:</strong> Users may arrange to meet in a safe, public place for hand-delivery.</li>
                    <li><strong>Courier Services:</strong> Sellers may use local courier services (e.g., Dunzo, Swiggy Genie, Porter) to deliver the item. The buyer and seller must agree in advance on who bears the courier cost.</li>
                </ul>

                <h2>3. Cash on Delivery (COD) / Payment on Arrival</h2>
                <p>
                    To ensure trust and satisfaction, Second Chances encourages a Payment on Arrival model.
                </p>
                <ul>
                    <li>The buyer should inspect the item upon delivery.</li>
                    <li>Payment should only be made once the buyer has verified that the item matches the condition described in the listing.</li>
                    <li>If the item is significantly not as described, the buyer has the right to refuse the item, and the seller must take it back.</li>
                </ul>

                <h2>4. Shipping Costs</h2>
                <p>
                    Since Second Chances does not facilitate shipping, shipping costs are not currently included in the listing price on the platform. Any shipping fees incurred via third-party couriers must be negotiated directly between the buyer and the seller.
                </p>

                <h2>5. Disputes</h2>
                <p>
                    If an item is damaged during transit or fails to arrive, the buyer and seller must communicate to resolve the issue. If a third-party courier was used, the seller should initiate a claim with the courier service.
                </p>
            </div>
        </div>
    )
}
