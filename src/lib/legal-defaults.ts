// Policy text shown until the owner writes their own in Admin → Site
// settings. Written for PickTheMap's actual setup: an enquiry-only website,
// no online payments, no analytics, hosting on Vercel, data in Supabase
// (Singapore). It makes no promise of refund percentages or time limits.
// It is general information, not legal advice; the owner should have it
// reviewed before relying on it.
export type PolicyKey = "privacy" | "terms" | "cancellation";

export const legalDefaults: Record<PolicyKey, string> = {
  privacy: `Last updated: 18 November 2026

# Who we are
PickTheMap plans personalised holidays, including Europe self-drive trips, Indian holidays and Kerala stays. This policy explains what personal information we collect through this website, why we collect it, and the choices you have.

# What we collect
- Details you send in an enquiry: your name, phone number, email address, the destination and dates you are considering, and how many people are travelling.
- Details you share later while we plan your trip, by phone, email or WhatsApp, such as passport or driving licence details needed for bookings.
- Basic technical information that our hosting provider records when you visit, such as your IP address and browser type, used for security and to keep the website running.

We do not ask for payment card details on this website, and no payments are taken here.

# How we use it
- To reply to your enquiry, prepare a personalised quote and plan your trip with you.
- To contact you about that enquiry by phone, email or WhatsApp.
- To book the services you confirm with us, such as hotels, flights and car rental, which means sharing the details those suppliers need.
- To keep the website secure and prevent spam and misuse.
- To meet legal, tax and accounting obligations.

We do not sell your personal information. We send marketing messages only if you have asked for them.

# Who we share it with
- Travel suppliers such as hotels, airlines, car rental companies and local partners, only as far as needed to arrange the services you confirm.
- The service providers that run this website: Vercel for hosting and Supabase for our database, which is hosted in Singapore. They process information on our behalf.
- WhatsApp, if you choose to continue your enquiry there. Messages sent through WhatsApp are handled by WhatsApp under its own terms.
- Authorities, where the law requires it.

Because some of these providers operate outside India, your information may be stored or processed outside India.

# Cookies
This website uses only the cookies it needs to work. A sign-in cookie is set for our staff when they log in to the administration area. We do not use advertising or analytics cookies.

# How long we keep it
We keep enquiry and booking details for as long as we need them to deal with your request, answer questions about your trip, and meet legal obligations. After that we delete or anonymise them.

# Your choices and rights
You can ask us to show you the information we hold about you, to correct it or delete it, and you can withdraw your consent to being contacted. Contact us using the details on our Contact page and we will respond. We may need to confirm your identity first, and we may have to keep some records where the law requires it.

# Security
We use encrypted connections, access controls and limited staff access to protect your information. No online service is completely secure, so please do not send card numbers or passwords by email or chat.

# Children
This website is meant for adults planning travel. Details of children travelling are given by the adult making the enquiry. We do not knowingly collect information from children.

# Changes to this policy
We may update this policy from time to time. The date at the top shows when it last changed.

# Contact
For questions or requests about your information, see our Contact page.`,

  terms: `Last updated: 18 November 2026

# About these terms
These terms apply when you use this website and when you ask us to plan a trip. By sending an enquiry you agree to them. Please read them together with our Privacy Policy and Cancellation Policy.

# What we do
PickTheMap plans personalised holidays and road trips. We arrange hotels, flights, car rental, transfers and other services with independent suppliers. We do not run the hotels, airlines or car rental companies ourselves.

# Enquiries and quotes
- This website is for enquiries only. You cannot book or pay here, and sending an enquiry does not create a booking.
- We send you a written quote. Prices on the website marked "from" or "starting" are indicative. Your final price depends on dates, group size, hotels, car category and availability, and is the price in your written quote.
- A quote is valid for the period stated in it. Prices and availability can change until a booking is confirmed.
- A booking is confirmed only when we confirm it to you in writing and receive the payment we ask for.

# Prices and payment
- Prices are shown in the currency stated on the website or in your quote. Taxes such as GST and TCS are shown in, or added to, your quote where they apply.
- What is included and not included is set out in your quote. Items listed as not included, such as fuel, tolls, parking, fines, attraction tickets, meals and personal expenses, are paid by you.
- We tell you how and when to pay in your quote.

# Travel documents and eligibility
- You are responsible for a valid passport, visas, permits, insurance and any other documents your trip needs.
- Visa and entry information on this website is general guidance for Indian passport holders and can change. Always check the current rules with the official embassy or consulate before you travel.
- For self-drive trips, every driver needs a valid, full driving licence and must meet the rental company's age and licence rules, which may include an International Driving Permit.

# Self-drive trips
- You are responsible for driving safely and following the traffic laws of each country.
- Rental cars are provided by the rental company on its own terms. Basic insurance usually carries an excess, which you remain responsible for if the car is damaged. Fuel, tolls, parking, fines and security deposits are paid by you.
- Distances, driving times and routes shown on the website are estimates and exclude stops and traffic.

# Changes to your trip
We may need to change an itinerary, hotel or route because of supplier changes, weather, road or pass closures, safety or other circumstances outside our control. We will tell you as soon as we reasonably can and offer a suitable alternative where possible. If you want to change a confirmed booking, tell us in writing. Suppliers may charge for changes. Our Cancellation Policy explains cancellations and refunds.

# Our responsibility
- We take reasonable care in planning and arranging your trip and in the information we give you.
- Services such as flights, hotels and car rental are provided by independent suppliers under their own terms. We are not responsible for what those suppliers do or fail to do, such as delays, cancellations or changes, except where the law says we are.
- We are not responsible for events beyond our control, such as natural events, strikes, border or airspace closures, government action or pandemics.
- To the extent the law allows, our liability for a booking is limited to the amount you paid us for it. Nothing in these terms limits any right you have that cannot be limited by law.

# Your responsibilities
Give us accurate details, including names exactly as they appear in passports. Look after your belongings and follow the instructions of suppliers and local authorities. We may cancel a booking if information you give us proves to be false.

# This website
- Photographs and descriptions on this website are meant as inspiration. Your actual hotels, vehicles and experiences are those in your quote.
- The website's text, design and logo belong to PickTheMap. Some photographs are used under licences from their photographers and are credited at the end of this page. Please do not copy content from this website for commercial use without permission.
- Please do not misuse the website, send spam through the enquiry form or try to gain unauthorised access.

# Governing law
These terms are governed by the laws of India. Courts in India have jurisdiction, subject to any rights you have under consumer protection law.

# Contact
For questions about these terms, see our Contact page.`,

  cancellation: `Last updated: 18 November 2026

# How cancellations work
Cancellation and refund terms depend on what you booked. They are set out in your written quote and follow the rules of the suppliers involved, such as airlines, hotels and car rental companies, plus any fee we have told you about. We tell you the applicable charges before you confirm a booking.

# Before you confirm
Sending an enquiry or receiving a quote costs nothing and creates no booking. You can decline a quote at any time with no charge.

# Cancelling a confirmed booking
- Tell us in writing, by email or WhatsApp, as early as you can. The date we receive your request is the cancellation date.
- Charges depend on how close to departure you cancel and on the supplier terms. Some services can be non-refundable once booked, for example some flight fares, special-rate hotels, visa fees, insurance and service fees. Where we know this, we tell you in your quote.
- Cancellation charges are the suppliers' charges plus any non-refundable fee we have told you about. We will show you how they are calculated.

# Refunds
- If a refund is due, we pay it back the way you paid, after deducting the charges above and after we receive the supplier's refund where a supplier is involved.
- Supplier refunds can take several weeks, and amounts can change with exchange rates and bank charges. We keep you updated and pass on refunds as soon as we receive them.

# If we or a supplier cancel
- If we have to cancel a service we agreed to provide, we will offer you an alternative or a refund of what you paid for that service, less any charges we cannot recover where the cause is outside our control.
- If a supplier cancels or changes a service, for example an airline changing a flight, we will help you rearrange it and pass on any refund the supplier gives.

# Changes to a booking
You can ask to change dates, hotels or travellers. Changes depend on availability and supplier rules and may cost extra. We tell you the cost before we make the change.

# Unused services
No refund is due for services you do not use, such as a missed flight, a late arrival, an early departure or a day you choose to skip, unless the supplier gives one.

# Travel documents
If you cannot travel because of a refused visa, an invalid passport or missing documents, your booking is treated as a cancellation by you and the charges above apply. Please check visa requirements before you confirm.

# Events beyond anyone's control
If events beyond our control occur, such as severe weather, natural disasters, strikes, closures or government restrictions, we will work with suppliers to rebook or refund what they allow. We cannot refund what suppliers will not refund.

# Contact
To cancel a booking or ask about a refund, contact us using the details on our Contact page.`,
};
