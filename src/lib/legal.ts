import "server-only";

/**
 * The business behind the shop, and the policy terms that have to agree
 * wherever they appear.
 *
 * UK distance selling requires a trader to publish who they are and where they
 * trade from — the Electronic Commerce (EC Directive) Regulations 2002 and the
 * Consumer Contracts Regulations 2013 both bite. Sole traders are not exempt.
 *
 * The identity fields below are deliberately `null` rather than a plausible
 * placeholder. A page that reads "Tengology, Oxford" looks finished and would
 * ship a legal gap silently; a page that says the details are outstanding
 * cannot be mistaken for done. `LegalIdentity` renders the difference.
 */

/** The sole trader's own name. Required alongside the trading name. */
export const PROPRIETOR: string | null = null;

/**
 * A geographic trading address — where the business actually operates from.
 * A PO Box alone does not satisfy the regulations. Home-based traders may use
 * a paid service address instead of publishing a home address.
 */
export const TRADING_ADDRESS: readonly string[] | null = null;

export const TRADING_NAME = "Tengology";

/** Reachable within a working day or two; the regulations require an email. */
export const CONTACT_EMAIL = "hello@tengology.com";
export const ORDERS_EMAIL = "orders@tengology.com";

/** Not VAT registered — prices carry no VAT and no VAT number is shown. */
export const VAT_REGISTERED = false;

export function hasLegalIdentity(): boolean {
  return Boolean(PROPRIETOR && TRADING_ADDRESS?.length);
}

/**
 * Cancellation window, split the way the statute splits it: fourteen days from
 * delivery to say you're cancelling, then fourteen more to actually post the
 * parcel back. Quoting one number for both is the common mistake and it
 * shortens what the shopper is entitled to.
 */
export const CANCEL_NOTICE_DAYS = 14;
export const CANCEL_RETURN_DAYS = 14;

/** A refund is due within 14 days of the goods coming back. */
export const REFUND_DAYS = 14;

/** Change of mind is the shopper's postage; faulty or wrong is always ours. */
export const RETURN_POSTAGE_PAID_BY_CUSTOMER = true;

/**
 * How long an order sits with us before it is handed to Royal Mail.
 *
 * TODO: confirm with the studio. These are placeholders chosen to be honest
 * rather than flattering — quoting a dispatch time you miss is a complaint,
 * and under the Consumer Contracts Regulations delivery must happen within 30
 * days unless another period was agreed.
 */
export const DISPATCH_DAYS_IN_STOCK = "2–3 working days";
export const DISPATCH_DAYS_MADE_TO_ORDER = "up to 5 working days";

/**
 * Products whose cancellation right is genuinely excluded.
 *
 * Regulation 28(1)(b) of the Consumer Contracts Regulations 2013 excludes goods
 * "made to the consumer's specifications" or "clearly personalised". This is
 * narrower than it sounds: a stock design merely assembled after the order is
 * placed is NOT excluded. A charm chosen as the buyer's own initial is the
 * textbook personalisation case; a bespoke strand designed by the buyer is
 * plainly made to specification.
 *
 * The exclusion can only be relied on if the shopper was told before ordering,
 * which is why it is stated on the returns page and again at checkout.
 */
export const NON_RETURNABLE_SLUGS = [
  "initial-letter-crystal-necklace",
  "bespoke-crystal-design",
] as const;

/** Shown on every policy page so a shopper can see how current it is. */
export const POLICIES_UPDATED = "6 September 2026";
