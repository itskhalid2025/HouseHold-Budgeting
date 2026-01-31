import useIsMobile from "../hooks/useIsMobile";
import TransactionsMobile from "./mobile/TransactionsMobile";
import TransactionsDesktop from "./desktop/TransactionsDesktop";

export default function Transactions() {
    const mobile = useIsMobile();
    return mobile ? <TransactionsMobile /> : <TransactionsDesktop />;
}
